#!/usr/bin/env node
/**
 * Round 2: harder attempts for businesses still without photos.
 *
 * 1. Retry OG-image fetch with different UAs + longer timeout
 * 2. If no website, fall back to a bundled category stock photo
 *    (photos live in /public/photos/_stock/{category}.jpg)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUSINESS_DIR = path.join(ROOT, "content/businesses");
const PHOTO_DIR = path.join(ROOT, "public/photos");
const STOCK_DIR = path.join(PHOTO_DIR, "_stock");

// Category → stock photo filename (must exist in /public/photos/_stock/)
const CATEGORY_STOCK = {
  "restaurants": "restaurant.jpg",
  "cafes-coffee-shops": "cafe.jpg",
  "bakeries": "bakery.jpg",
  "grocery-markets": "grocery.jpg",
  "barbers": "barber.jpg",
  "hair-salons": "salon.jpg",
  "lash-techs": "lash.jpg",
  "nail-salons": "nails.jpg",
  "spas-esthetics": "spa.jpg",
  "medical": "clinic.jpg",
  "gyms-fitness": "gym.jpg",
  "auto-repair": "auto.jpg",
  "cleaning-services": "cleaning.jpg",
  "photographers": "photography.jpg",
  "plumbers": "plumber.jpg",
  "electricians": "electrician.jpg",
  "catering": "catering.jpg",
  "henna-artists": "henna.jpg",
  "professional-services": "office.jpg",
};

const UAS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  "Mozilla/5.0 (compatible; Twitterbot/1.0)",
];

async function fetchText(url, ua) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      headers: { "User-Agent": ua, "Accept": "text/html,*/*", "Accept-Language": "en-US" },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

async function fetchBinary(url, ua) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(url, {
      headers: { "User-Agent": ua, "Referer": new URL(url).origin },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 3000) return null;
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
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return absUrl(base, m[1]);
  }
  return null;
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
  return { fields };
}

function setPhotosField(text, photoPath) {
  const lines = text.split("\n");
  const photosIdx = lines.findIndex((l) => /^photos:\s*\[\]\s*$/.test(l));
  if (photosIdx >= 0) {
    lines[photosIdx] = `photos: ["${photoPath}"]`;
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
  const website = (fields.website ?? "").replace(/^"|"$/g, "");
  const category = (fields.category ?? "").replace(/^"|"$/g, "");
  const existingPhotos = (fields.photos ?? "").trim();

  if (existingPhotos && existingPhotos !== "[]" && !existingPhotos.startsWith("[]")) {
    return { slug, status: "already-has-photo" };
  }

  // 1) Try website with rotating UAs
  if (website) {
    for (const ua of UAS) {
      const html = await fetchText(website, ua);
      if (!html) continue;
      const imgUrl = extractOgImage(html, website);
      if (!imgUrl) continue;
      const buf = await fetchBinary(imgUrl, ua);
      if (!buf) continue;
      let ext = ".jpg";
      const em = imgUrl.match(/\.(jpg|jpeg|png|webp)(?:\?|$)/i);
      if (em) ext = "." + em[1].toLowerCase();
      const localPath = `/photos/${slug}${ext}`;
      await fs.writeFile(path.join(PHOTO_DIR, `${slug}${ext}`), buf);
      await fs.writeFile(filePath, setPhotosField(raw, localPath));
      return { slug, status: "ok-website", size: (buf.length / 1024).toFixed(1) + "KB", ua: ua.slice(0, 30) };
    }
  }

  // 2) Fallback to bundled category stock
  const stockName = CATEGORY_STOCK[category];
  if (stockName) {
    const stockDisk = path.join(STOCK_DIR, stockName);
    try {
      await fs.access(stockDisk);
      await fs.writeFile(filePath, setPhotosField(raw, `/photos/_stock/${stockName}`));
      return { slug, status: "ok-stock", stock: stockName };
    } catch {
      return { slug, status: "stock-missing", stock: stockName };
    }
  }

  return { slug, status: "no-fallback" };
}

async function main() {
  const files = (await fs.readdir(BUSINESS_DIR)).filter((f) => f.endsWith(".md"));
  let ok = 0, already = 0, fail = 0;
  for (const file of files) {
    const r = await processOne(file);
    if (r.status.startsWith("ok")) { console.log(`✓ ${r.slug} → ${r.status}${r.stock ? " (" + r.stock + ")" : ""}${r.size ? " " + r.size : ""}`); ok++; }
    else if (r.status === "already-has-photo") { already++; }
    else { console.log(`✗ ${r.slug || file}: ${r.status}`); fail++; }
  }
  console.log(`\nDone: ${ok} new, ${already} already had photos, ${fail} failed`);
}

main().catch((e) => { console.error(e); process.exit(1); });
