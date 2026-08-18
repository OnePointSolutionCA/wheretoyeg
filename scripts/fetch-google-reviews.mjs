#!/usr/bin/env node
/**
 * Pull real Google reviews for each business via Places API (New).
 * Writes them into the business .md frontmatter under `reviews:`.
 *
 * Requires: GOOGLE_PLACES_API_KEY env var.
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-google-reviews.mjs
 *
 * Flags:
 *   --force      Overwrite existing reviews
 *   --slug=x     Fetch only one business
 *   --dry        Print what would happen, don't touch disk
 *   --max=N      Cap total businesses this run
 *   --per=N      Reviews per business (default 5, max 5)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUSINESS_DIR = path.join(ROOT, "content/businesses");
const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY env var.");
  process.exit(1);
}

const ARGS = process.argv.slice(2);
const FORCE = ARGS.includes("--force");
const DRY = ARGS.includes("--dry");
const ONLY = ARGS.find((a) => a.startsWith("--slug="))?.split("=")[1];
const MAX = parseInt(ARGS.find((a) => a.startsWith("--max="))?.split("=")[1] ?? "1000", 10);
const PER = Math.min(5, parseInt(ARGS.find((a) => a.startsWith("--per="))?.split("=")[1] ?? "5", 10));

async function textSearch(query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.reviews",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 5, languageCode: "en" }),
  });
  if (!res.ok) throw new Error(`Text search ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).places ?? [];
}

function normalize(s) {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

function pickBestMatch(places, name) {
  const target = normalize(name);
  return places
    .map((p) => {
      const dn = normalize(p.displayName?.text ?? "");
      let score = 0;
      if (dn === target) score += 100;
      if (dn.startsWith(target) || target.startsWith(dn)) score += 30;
      const nt = target.split(" ");
      const nd = dn.split(" ");
      score += nt.filter((w) => w.length > 2 && nd.includes(w)).length * 10;
      if ((p.reviews?.length ?? 0) > 0) score += 5;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.p;
}

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  return { fmRaw: m[1], body: m[2] };
}

// Simple field peek without a full YAML parser
function peekField(fmRaw, key) {
  const lines = fmRaw.split("\n");
  for (const l of lines) {
    const m = l.match(new RegExp(`^${key}:\\s*(.*)$`));
    if (m) return m[1].replace(/^"|"$/g, "").trim();
  }
  return "";
}

function hasReviewsBlock(fmRaw) {
  return /^reviews:\s*\n\s+- /m.test(fmRaw);
}

/** Escape a scalar for YAML single-line double-quoted value. */
function escapeYaml(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Format multi-line comment as a folded block scalar. */
function formatComment(s) {
  const trimmed = String(s).trim().replace(/\r\n/g, "\n");
  const indent = "      ";
  return trimmed.split("\n").map((line) => indent + line.trimEnd()).join("\n");
}

function toReviewsYaml(reviews) {
  const lines = ["reviews:"];
  for (const r of reviews) {
    lines.push(`  - name: "${escapeYaml(r.name)}"`);
    lines.push(`    rating: ${r.rating}`);
    lines.push(`    date: "${escapeYaml(r.date)}"`);
    lines.push(`    comment: |`);
    lines.push(formatComment(r.comment));
  }
  return lines.join("\n");
}

/**
 * Insert or replace the reviews: block in a frontmatter string.
 * Places it just before the closing --- of the frontmatter.
 */
function upsertReviewsBlock(fmRaw, reviewsYaml) {
  const lines = fmRaw.split("\n");
  // Find existing "reviews:" line
  const idx = lines.findIndex((l) => /^reviews:\s*($|\[)/.test(l));
  if (idx === -1) {
    // Append at end
    return fmRaw.trimEnd() + "\n" + reviewsYaml;
  }
  // Detect where the block ends: next line that starts at column 0 with a key: (not indented)
  let end = idx + 1;
  while (end < lines.length && (lines[end].startsWith(" ") || lines[end] === "" || lines[end].startsWith("\t"))) {
    end++;
  }
  return [...lines.slice(0, idx), ...reviewsYaml.split("\n"), ...lines.slice(end)].join("\n");
}

function mapGoogleReviews(gReviews) {
  return (gReviews ?? []).slice(0, PER).map((r) => ({
    name: r.authorAttribution?.displayName ?? "Google reviewer",
    rating: r.rating ?? 5,
    date: (r.publishTime ?? "").slice(0, 10) || (r.relativePublishTimeDescription ?? ""),
    comment: r.text?.text ?? r.originalText?.text ?? "",
  })).filter((r) => r.comment.length > 0);
}

async function processOne(file) {
  const filePath = path.join(BUSINESS_DIR, file);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = parseFrontmatter(raw);
  if (!parsed) return { file, status: "no-frontmatter" };

  const slug = (peekField(parsed.fmRaw, "slug") || file.replace(/\.md$/, ""));
  const name = peekField(parsed.fmRaw, "name");
  const address = peekField(parsed.fmRaw, "address");

  if (ONLY && slug !== ONLY) return { slug, status: "skipped-filter" };
  if (hasReviewsBlock(parsed.fmRaw) && !FORCE) return { slug, status: "already-has-reviews" };

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
  const reviews = mapGoogleReviews(best?.reviews);
  if (!reviews.length) return { slug, status: "no-reviews-available" };

  const yaml = toReviewsYaml(reviews);
  const newFm = upsertReviewsBlock(parsed.fmRaw, yaml);
  const newFile = `---\n${newFm}\n---\n${parsed.body}`;
  if (!DRY) await fs.writeFile(filePath, newFile);

  return { slug, status: "ok", count: reviews.length, matched: best.displayName?.text };
}

async function main() {
  const files = (await fs.readdir(BUSINESS_DIR)).filter((f) => f.endsWith(".md"));
  let ok = 0, skipped = 0, fail = 0, i = 0;
  for (const file of files) {
    if (i >= MAX) break;
    const r = await processOne(file);
    if (r.status === "ok") { console.log(`✓ ${r.slug} → ${r.count} reviews (${r.matched})`); ok++; i++; }
    else if (r.status === "already-has-reviews") { skipped++; }
    else if (r.status === "skipped-filter") { /* silent */ }
    else { console.log(`✗ ${r.slug || file}: ${r.status}${r.error ? " — " + r.error : ""}`); fail++; i++; }
    await new Promise((res) => setTimeout(res, 150));
  }
  console.log(`\nDone: ${ok} added, ${skipped} already had reviews, ${fail} failed`);
  if (DRY) console.log("(dry run — no files changed)");
}

main().catch((e) => { console.error(e); process.exit(1); });
