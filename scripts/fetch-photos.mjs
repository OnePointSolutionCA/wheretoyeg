#!/usr/bin/env node
/**
 * Free photo fetcher — scrapes the OpenGraph image from each business's
 * website (the picture they use when their site is shared on Facebook/
 * Twitter/etc). No API key required.
 *
 * Order of preference:
 *   1. og:image
 *   2. twitter:image / twitter:image:src
 *   3. First large <img> in the hero
 *
 * Usage: node scripts/fetch-photos.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUSINESS_DIR = path.join(ROOT, "content/businesses");
const PHOTO_DIR = path.join(ROOT, "public/photos");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function fetchText(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

async function fetchBinary(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 3000) return null; // too small — probably icon, not photo
    return buf;
  } catch { return null; }
}

function absUrl(base, maybeRel) {
  try { return new URL(maybeRel, base).href; } catch { return null; }
}

function extractOgImage(html, base) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return absUrl(base, m[1]);
  }
  return null;
}

function extractHeroImg(html, base) {
  // Find first <img> src that looks big / hero
  const imgRe = /<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["'][^>]*>/gi;
  const candidates = [];
  let m;
  while ((m = imgRe.exec(html)) !== null) candidates.push(m[1]);
  // Prefer ones with words like hero, banner, cover, header, main
  const preferred = candidates.find((s) => /hero|banner|cover|header|main|bg/i.test(s));
  const pick = preferred || candidates[0];
  return pick ? absUrl(base, pick) : null;
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

function setPhotosField(text, photoPath) {
  // Replace `photos: []` line with `photos: ["/photos/xxx.jpg"]`
  const lines = text.split("\n");
  const photosIdx = lines.findIndex((l) => /^photos:\s*\[\]\s*$/.test(l));
  if (photosIdx >= 0) {
    lines[photosIdx] = `photos: ["${photoPath}"]`;
    return lines.join("\n");
  }
  // If photos: is on multiple lines already, don't touch it
  return text;
}

async function processOne(file) {
  const filePath = path.join(BUSINESS_DIR, file);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = parseFrontmatter(raw);
  if (!parsed) return { file, status: "no-frontmatter" };
  const { fields } = parsed;

  const slug = (fields.slug ?? file.replace(/\.md$/, "")).replace(/^"|"$/g, "");
  const website = (fields.website ?? "").replace(/^"|"$/g, "");
  const existingPhotos = (fields.photos ?? "").trim();

  // Skip if already has photo(s)
  if (existingPhotos && existingPhotos !== "[]" && !existingPhotos.startsWith("[]")) {
    return { slug, status: "already-has-photo" };
  }
  if (!website) return { slug, status: "no-website" };

  const html = await fetchText(website);
  if (!html) return { slug, status: "site-fetch-failed", website };

  const imgUrl = extractOgImage(html, website) || extractHeroImg(html, website);
  if (!imgUrl) return { slug, status: "no-og-image", website };

  const buf = await fetchBinary(imgUrl);
  if (!buf) return { slug, status: "img-download-failed", imgUrl };

  // Detect extension from URL or default to .jpg
  let ext = ".jpg";
  const extMatch = imgUrl.match(/\.(jpg|jpeg|png|webp)(?:\?|$)/i);
  if (extMatch) ext = "." + extMatch[1].toLowerCase();

  const localPath = `/photos/${slug}${ext}`;
  const diskPath = path.join(PHOTO_DIR, `${slug}${ext}`);
  await fs.writeFile(diskPath, buf);

  const updated = setPhotosField(raw, localPath);
  if (updated !== raw) await fs.writeFile(filePath, updated);

  return { slug, status: "ok", size: (buf.length / 1024).toFixed(1) + "KB", src: imgUrl };
}

async function main() {
  await fs.mkdir(PHOTO_DIR, { recursive: true });
  const files = (await fs.readdir(BUSINESS_DIR)).filter((f) => f.endsWith(".md"));

  const results = [];
  // Process serially so we don't hammer sites
  for (const file of files) {
    const r = await processOne(file);
    results.push(r);
    if (r.status === "ok") console.log(`✓ ${r.slug} → ${r.size}`);
    else if (r.status !== "already-has-photo") console.log(`✗ ${r.slug || file}: ${r.status}${r.website ? " (" + r.website + ")" : ""}`);
  }

  const ok = results.filter((r) => r.status === "ok").length;
  const already = results.filter((r) => r.status === "already-has-photo").length;
  const failed = results.length - ok - already;
  console.log(`\nDone: ${ok} fetched, ${already} already had photos, ${failed} failed`);
}

main().catch((err) => { console.error(err); process.exit(1); });
