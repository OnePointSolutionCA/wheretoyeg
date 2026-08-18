#!/usr/bin/env node
/**
 * Pull real business photos from Google Places API (New).
 *
 * Requires: GOOGLE_PLACES_API_KEY env var.
 *
 * For each business without a real photo (stock photos count as "no
 * real photo"), the script:
 *   1. Text-searches Google Places for "{name} Edmonton" and picks the
 *      top result whose name loosely matches.
 *   2. Fetches up to 5 photos from that place.
 *   3. Saves them to /public/photos/{slug}-{n}.jpg.
 *   4. Updates the business .md file's `photos:` field to point at
 *      the local paths.
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-google-photos.mjs
 *
 * Flags:
 *   --force      Re-fetch even businesses that already have real photos
 *   --slug=x     Fetch only the business with this slug
 *   --dry        Print what would happen, don't touch disk
 *   --max=N      Cap number of businesses processed this run (default: all)
 *   --per=N      Photos per business (default: 3)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUSINESS_DIR = path.join(ROOT, "content/businesses");
const PHOTO_DIR = path.join(ROOT, "public/photos");

const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY env var.");
  console.error("Usage: GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-google-photos.mjs");
  process.exit(1);
}

const ARGS = process.argv.slice(2);
const FORCE = ARGS.includes("--force");
const DRY = ARGS.includes("--dry");
const ONLY_SLUG = ARGS.find((a) => a.startsWith("--slug="))?.split("=")[1];
const MAX = parseInt(ARGS.find((a) => a.startsWith("--max="))?.split("=")[1] ?? "1000", 10);
const PER = parseInt(ARGS.find((a) => a.startsWith("--per="))?.split("=")[1] ?? "3", 10);

async function textSearch(query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.photos",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 5, languageCode: "en" }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Text search ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.places ?? [];
}

async function fetchPhotoBinary(photoName, maxWidth = 1600) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${KEY}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) return null;
  return buf;
}

function normalize(s) {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

function pickBestMatch(places, businessName) {
  const target = normalize(businessName);
  const scored = places.map((p) => {
    const displayName = normalize(p.displayName?.text ?? "");
    let score = 0;
    if (displayName === target) score += 100;
    if (displayName.startsWith(target) || target.startsWith(displayName)) score += 30;
    const targetWords = target.split(" ");
    const nameWords = displayName.split(" ");
    const common = targetWords.filter((w) => w.length > 2 && nameWords.includes(w)).length;
    score += common * 10;
    if ((p.photos?.length ?? 0) > 0) score += 5;
    return { p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.p ?? null;
}

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const lines = m[1].split("\n");
  const fields = {};
  for (const line of lines) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (kv) fields[kv[1]] = kv[2];
  }
  return { fields, raw: m[1], body: m[2], full: text };
}

function setPhotosField(text, photoPaths) {
  const newLine = `photos: [${photoPaths.map((p) => `"${p}"`).join(", ")}]`;
  const lines = text.split("\n");
  const idx = lines.findIndex((l) => /^photos:/.test(l));
  if (idx >= 0) {
    lines[idx] = newLine;
    return lines.join("\n");
  }
  return text;
}

async function processOne(file) {
  const filePath = path.join(BUSINESS_DIR, file);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = parseFrontmatter(raw);
  if (!parsed) return { file, status: "no-frontmatter" };
  const { fields } = parsed;

  const slug = (fields.slug ?? file.replace(/\.md$/, "")).replace(/^"|"$/g, "");
  const name = (fields.name ?? "").replace(/^"|"$/g, "");
  const address = (fields.address ?? "").replace(/^"|"$/g, "");
  const photosStr = (fields.photos ?? "").trim();

  if (ONLY_SLUG && slug !== ONLY_SLUG) return { slug, status: "skipped-slug-filter" };

  const hasRealPhoto = photosStr.includes(`/photos/${slug}`) && !photosStr.includes("/_stock/");
  if (hasRealPhoto && !FORCE) return { slug, status: "already-has-real-photo" };

  const query = address && !/^edmonton$/i.test(address.trim())
    ? `${name} ${address}`
    : `${name} Edmonton`;

  let places;
  try {
    places = await textSearch(query);
  } catch (e) {
    return { slug, status: "search-error", error: e.message };
  }
  if (!places.length) return { slug, status: "no-places-match" };

  const best = pickBestMatch(places, name);
  if (!best || !best.photos?.length) return { slug, status: "no-photos-on-place" };

  const localPaths = [];
  const toFetch = best.photos.slice(0, PER);
  for (let i = 0; i < toFetch.length; i++) {
    const photo = toFetch[i];
    let buf;
    try { buf = await fetchPhotoBinary(photo.name); } catch { buf = null; }
    if (!buf) continue;
    const local = `/photos/${slug}-${i + 1}.jpg`;
    if (!DRY) {
      await fs.mkdir(PHOTO_DIR, { recursive: true });
      await fs.writeFile(path.join(PHOTO_DIR, `${slug}-${i + 1}.jpg`), buf);
    }
    localPaths.push(local);
  }

  if (!localPaths.length) return { slug, status: "all-photo-downloads-failed" };

  if (!DRY) {
    const updated = setPhotosField(raw, localPaths);
    await fs.writeFile(filePath, updated);
  }
  return { slug, status: "ok", matched: best.displayName?.text, photoCount: localPaths.length };
}

async function main() {
  const files = (await fs.readdir(BUSINESS_DIR)).filter((f) => f.endsWith(".md"));
  let ok = 0, skipped = 0, fail = 0, i = 0;
  for (const file of files) {
    if (i >= MAX) break;
    const r = await processOne(file);
    if (r.status === "ok") { console.log(`✓ ${r.slug} → ${r.matched} (${r.photoCount} photos)`); ok++; i++; }
    else if (r.status === "already-has-real-photo") { skipped++; }
    else if (r.status === "skipped-slug-filter") { /* silent */ }
    else { console.log(`✗ ${r.slug || file}: ${r.status}${r.error ? " — " + r.error : ""}`); fail++; i++; }
    // Politely space out requests
    await new Promise((r) => setTimeout(r, 120));
  }
  console.log(`\nDone: ${ok} fetched, ${skipped} already had real photos, ${fail} failed`);
  if (DRY) console.log("(dry run — no files changed)");
}

main().catch((e) => { console.error(e); process.exit(1); });
