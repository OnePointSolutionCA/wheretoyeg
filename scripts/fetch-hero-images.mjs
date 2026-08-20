#!/usr/bin/env node
/**
 * Download professional editorial hero images per category.
 * Uses Unsplash direct-CDN URLs — stable, free, no API key required.
 * Saves to /public/photos/_hero/{category-slug}.jpg
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public/photos/_hero");

// Curated professional Unsplash photos, one per category.
// URL format: https://images.unsplash.com/photo-{id}?w=1600&h=900&fit=crop&auto=format&q=80
const HEROES = {
  "restaurants":         "photo-1517248135467-4c7edcad34c4", // fine dining plated
  "cafes-coffee-shops":  "photo-1495474472287-4d71bcdd2085", // latte art overhead
  "bakeries":            "photo-1509440159596-0249088772ff", // pastries display
  "grocery-markets":     "photo-1542838132-92c53300491e",    // colourful produce
  "barbers":             "photo-1622286342621-4bd786c2447c", // barber tools closeup
  "hair-salons":         "photo-1560066984-138dadb4c035",    // hair salon chair
  "nail-salons":         "photo-1604654894610-df63bc536371", // nails clean shot
  "lash-techs":          "photo-1583241800698-e8ab01830a07", // lash treatment
  "spas-esthetics":      "photo-1544161515-4ab6ce6db874",    // spa stones
  "medical":             "photo-1666214280557-f1b5022eb634", // clinic corridor clean
  "gyms-fitness":        "photo-1534438327276-14e5300c3a48", // gym weights
  "auto-repair":         "photo-1486262715619-67b85e0b08d3", // mechanic engine
  "cleaning-services":   "photo-1581578731548-c64695cc6952", // clean bathroom
  "photographers":       "photo-1516035069371-29a1b244cc32", // camera bokeh
  "plumbers":            "photo-1621905251189-08b45d6a269e", // pipes
  "electricians":        "photo-1558618666-fcd25c85cd64",    // electrical work
  "catering":            "photo-1555244162-803834f70033",    // catered plates
  "henna-artists":       "photo-1583842761829-a9a2b2ba0ce6", // henna hand
  "activities-fun":      "photo-1522163182402-834f871fd851", // climbing indoor
  "professional-services": "photo-1497366216548-37526070297c", // modern office
};

// Fallback keywords for loremflickr if a specific Unsplash id fails
const FALLBACK_KEYWORDS = {
  "restaurants": "restaurant,fine-dining,plated",
  "cafes-coffee-shops": "cafe,latte-art,coffee",
  "bakeries": "bakery,pastry,artisan",
  "grocery-markets": "grocery,produce,market",
  "barbers": "barbershop,haircut",
  "hair-salons": "hair-salon,stylist",
  "nail-salons": "manicure,nails",
  "lash-techs": "eyelash,lashes",
  "spas-esthetics": "spa,relax",
  "medical": "clinic,medical",
  "gyms-fitness": "gym,fitness,weights",
  "auto-repair": "mechanic,car-repair",
  "cleaning-services": "cleaning,housekeeping",
  "photographers": "camera,photography,studio",
  "plumbers": "plumber,pipes",
  "electricians": "electrician,wiring",
  "catering": "catering,buffet",
  "henna-artists": "henna,mehndi",
  "activities-fun": "adventure,indoor,climbing",
  "professional-services": "office,professional",
};

async function fetchBinary(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, { redirect: "follow", signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length < 3000 ? null : buf;
  } catch { return null; }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  let ok = 0, fail = 0;
  for (const [slug, unsplashId] of Object.entries(HEROES)) {
    const disk = path.join(OUT_DIR, `${slug}.jpg`);
    const url = `https://images.unsplash.com/${unsplashId}?w=2000&h=1000&fit=crop&auto=format&q=80`;
    let buf = await fetchBinary(url);
    let source = "unsplash";
    if (!buf) {
      // Fallback to loremflickr
      const kw = FALLBACK_KEYWORDS[slug] ?? slug;
      buf = await fetchBinary(`https://loremflickr.com/1600/900/${kw}`);
      source = "loremflickr";
    }
    if (!buf) { console.log(`✗ ${slug}: all sources failed`); fail++; continue; }
    await fs.writeFile(disk, buf);
    console.log(`✓ ${slug} → ${source} (${(buf.length / 1024).toFixed(1)}KB)`);
    ok++;
  }
  console.log(`\nDone: ${ok} downloaded, ${fail} failed`);
}

main().catch((e) => { console.error(e); process.exit(1); });
