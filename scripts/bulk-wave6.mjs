#!/usr/bin/env node
/**
 * Supplemental wave 6 — fill remaining gaps to 1000+.
 * GOOGLE_PLACES_API_KEY=xxx node scripts/bulk-wave6.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/gg/Desktop/WheretoYEG";
const DIR = path.join(ROOT, "content/businesses");
const PHOTO_DIR = path.join(ROOT, "public/photos");
const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) { console.error("Missing GOOGLE_PLACES_API_KEY"); process.exit(1); }

function slugify(s) { return s.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60); }
function esc(s) { return String(s ?? "").replace(/"/g, '\\"'); }

const QUERIES = [
  // More restaurants — diverse cuisines & neighborhoods
  ["shawarma edmonton", "restaurants", "shawarma", 5, ["Halal"]],
  ["pizza restaurant edmonton", "restaurants", "pizza", 5, []],
  ["thai restaurant edmonton", "restaurants", "thai", 5, []],
  ["vietnamese pho edmonton", "restaurants", "pho", 5, []],
  ["bubble tea edmonton", "cafes-coffee-shops", "bubble-tea", 5, []],
  ["korean bbq edmonton", "restaurants", "korean-bbq", 4, []],
  ["burger restaurant edmonton", "restaurants", "burgers", 5, []],
  ["fried chicken restaurant edmonton", "restaurants", "fried-chicken", 4, []],
  ["dim sum edmonton", "restaurants", "dim-sum", 3, []],
  ["dessert cafe edmonton", "cafes-coffee-shops", "desserts", 4, []],
  ["fast food halal edmonton", "restaurants", "halal-fast-food", 4, ["Halal"]],
  ["buffet restaurant edmonton", "restaurants", "buffet", 4, []],
  ["soup dumpling edmonton", "restaurants", "dumplings", 3, []],
  ["falafel edmonton", "restaurants", "falafel", 3, ["Halal"]],
  ["jamaican food edmonton", "restaurants", "jamaican", 3, []],

  // More grocery & specialty
  ["farmers market edmonton", "grocery-markets", "farmers-market", 4, []],
  ["health food store edmonton", "grocery-markets", "health-food", 3, []],

  // More medical
  ["walk in clinic edmonton", "medical", "walk-in-clinic", 5, []],
  ["chiropractor edmonton south", "medical", "chiropractors", 4, []],
  ["chiropractor edmonton north", "medical", "chiropractors", 3, []],
  ["veterinarian edmonton", "medical", "veterinarians", 5, []],

  // More fitness
  ["crossfit gym edmonton", "gyms-fitness", "crossfit", 4, []],
  ["yoga studio edmonton south", "gyms-fitness", "yoga", 4, []],
  ["boxing gym edmonton", "gyms-fitness", "boxing", 3, []],

  // More beauty
  ["hair extensions edmonton", "hair-salons", "extensions", 3, []],
  ["facial treatment edmonton", "spas-esthetics", "facials", 4, []],
  ["tattoo shop edmonton", "spas-esthetics", "tattoo", 4, []],

  // More home services
  ["painting company edmonton", "cleaning-services", "painting", 4, []],
  ["moving company edmonton", "cleaning-services", "moving", 4, []],
  ["landscaping edmonton", "cleaning-services", "landscaping", 4, []],
  ["pest control edmonton", "cleaning-services", "pest-control", 3, []],
  ["electrician residential edmonton", "electricians", "residential", 4, []],
  ["plumber emergency edmonton", "plumbers", "emergency", 4, []],
  ["roofing company edmonton", "plumbers", "roofing", 4, []],

  // More professional services
  ["real estate agent edmonton", "professional-services", "real-estate", 4, []],
  ["insurance broker edmonton", "professional-services", "insurance", 3, []],
  ["printing shop edmonton", "professional-services", "printing", 3, []],
  ["pet grooming edmonton", "professional-services", "pet-grooming", 4, []],
  ["daycare edmonton", "professional-services", "childcare", 4, []],

  // More activities
  ["escape room edmonton", "activities-fun", "escape-rooms", 4, []],
  ["axe throwing edmonton", "activities-fun", "axe-throwing", 3, []],
  ["virtual reality arcade edmonton", "activities-fun", "vr-arcade", 3, []],
  ["skating rink edmonton", "activities-fun", "skating", 3, []],

  // More auto
  ["car wash edmonton", "auto-repair", "car-wash", 4, []],
  ["windshield repair edmonton", "auto-repair", "windshield", 3, []],

  // More catering
  ["indian catering edmonton", "catering", "indian-catering", 3, ["Halal"]],
  ["middle eastern catering edmonton", "catering", "middle-eastern-catering", 3, ["Halal"]],

  // More photographers
  ["wedding photographer edmonton", "photographers", "wedding", 4, []],
  ["headshot photographer edmonton", "photographers", "headshots", 3, []],
];

const FOOD_CATS = new Set(["restaurants", "cafes-coffee-shops", "bakeries"]);
const BLOCKED_TYPES = new Set(["bar", "night_club", "liquor_store", "wine_bar"]);
function isBlocked(place) {
  const types = place.types ?? [];
  if (types.some(t => BLOCKED_TYPES.has(t))) return true;
  const name = (place.displayName?.text ?? "").toLowerCase();
  if (/\b(bar|pub|brewery|brewpub|taproom|winery|wine bar|liquor|lounge)\b/i.test(name)) return true;
  return false;
}

function extractHours(place) {
  const wk = place.regularOpeningHours?.weekdayDescriptions;
  if (!wk?.length) return null;
  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  const out = {};
  for (const line of wk) { const m = line.match(/^(\w+):\s*(.+)$/); if (!m) continue; const d = m[1].toLowerCase(); if (days.includes(d)) out[d] = m[2].replace(/–/g, "-").trim(); }
  return Object.keys(out).length === 7 ? out : null;
}

const HOURS_DEFAULT = {
  monday: "9:00 AM - 6:00 PM", tuesday: "9:00 AM - 6:00 PM", wednesday: "9:00 AM - 6:00 PM",
  thursday: "9:00 AM - 8:00 PM", friday: "9:00 AM - 6:00 PM", saturday: "10:00 AM - 5:00 PM", sunday: "Closed",
};
const HOURS_RESTO = {
  monday: "11:00 AM - 9:00 PM", tuesday: "11:00 AM - 9:00 PM", wednesday: "11:00 AM - 9:00 PM",
  thursday: "11:00 AM - 9:00 PM", friday: "11:00 AM - 10:00 PM", saturday: "11:00 AM - 10:00 PM", sunday: "11:00 AM - 9:00 PM",
};

function hood(addr) {
  if (!addr) return "Edmonton";
  if (/downtown|jasper ave/i.test(addr)) return "Downtown";
  if (/west edmonton|170 st|wem/i.test(addr)) return "West Edmonton";
  if (/whyte|old strathcona|82 ave/i.test(addr)) return "Whyte Ave";
  if (/124 st/i.test(addr)) return "124 Street";
  if (/millwoods|mill woods|38 ave/i.test(addr)) return "Mill Woods";
  if (/ellerslie|summerside/i.test(addr)) return "South Edmonton";
  if (/sherwood park/i.test(addr)) return "Sherwood Park";
  if (/st\.? albert/i.test(addr)) return "St. Albert";
  if (/spruce grove/i.test(addr)) return "Spruce Grove";
  if (/leduc/i.test(addr)) return "Leduc";
  if (/beaumont/i.test(addr)) return "Beaumont";
  if (/167|northgate|castle downs|calder|153 ave|97 st.*north/i.test(addr)) return "North Edmonton";
  if (/windermere|magrath|rutherford|allard|chappelle|walker|heritage|riverbend|terwillegar/i.test(addr)) return "South Edmonton";
  return "Edmonton";
}

function mapReviews(reviews) {
  return (reviews ?? []).slice(0, 5).map(r => ({
    name: r.authorAttribution?.displayName ?? "Google reviewer",
    rating: r.rating ?? 5,
    date: (r.publishTime ?? "").slice(0, 10),
    comment: r.text?.text ?? "",
  })).filter(r => r.comment.length > 10);
}

function toReviewsYaml(reviews) {
  const lines = ["reviews:"];
  for (const r of reviews) {
    lines.push(`  - name: "${esc(r.name)}"`);
    lines.push(`    rating: ${r.rating}`);
    lines.push(`    date: "${r.date}"`);
    lines.push(`    comment: |`);
    for (const line of r.comment.replace(/\r\n/g, "\n").trim().split("\n")) lines.push("      " + line.trimEnd());
  }
  return lines.join("\n");
}

function priceLevel(level) {
  switch (level) {
    case "PRICE_LEVEL_FREE": case "PRICE_LEVEL_INEXPENSIVE": return "$";
    case "PRICE_LEVEL_MODERATE": return "$$";
    case "PRICE_LEVEL_EXPENSIVE": return "$$$";
    case "PRICE_LEVEL_VERY_EXPENSIVE": return "$$$$";
    default: return "$$";
  }
}

async function textSearch(query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.regularOpeningHours,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri,places.photos,places.reviews,places.types",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 10, languageCode: "en", regionCode: "CA" }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).places ?? [];
}

async function fetchPhoto(photoName) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&key=${KEY}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.length < 3000 ? null : buf;
}

async function main() {
  const existingFiles = (await fs.readdir(DIR)).filter(f => f.endsWith(".md"));
  const taken = new Set(existingFiles.map(f => f.replace(/\.md$/, "")));
  const takenUris = new Set();
  for (const f of existingFiles) {
    const txt = await fs.readFile(path.join(DIR, f), "utf8");
    const m = txt.match(/google_maps_url:\s*"([^"]+)"/);
    if (m) takenUris.add(m[1]);
  }

  let total = 0, dup = 0, fail = 0, blocked = 0;

  for (const [query, category, subcategory, howMany, extra] of QUERIES) {
    let places;
    try { places = await textSearch(query); }
    catch (e) { console.log(`  ✗ query "${query}": ${e.message}`); continue; }

    let picked = 0;
    for (const p of places) {
      if (picked >= howMany) break;
      if (isBlocked(p)) { blocked++; continue; }

      const name = p.displayName?.text;
      if (!name) continue;
      let slug = slugify(name);
      if (!slug) continue;

      let n = 2;
      while (taken.has(slug)) { slug = `${slugify(name)}-${n}`; n++; if (n > 9) break; }
      if (n > 9) { dup++; continue; }

      const gUri = p.googleMapsUri ?? "";
      if (gUri && takenUris.has(gUri)) { dup++; continue; }

      const addr = p.formattedAddress ?? "Edmonton";
      if (!/edmonton|sherwood park|st\.? albert|spruce grove|leduc|beaumont|fort sask/i.test(addr)) continue;

      const nh = hood(addr);
      const rating = Math.max(0, Math.min(5, +(p.rating || 0)));
      const count = Math.max(0, +(p.userRatingCount || 0));
      const hours = extractHours(p) ?? (FOOD_CATS.has(category) ? HOURS_RESTO : HOURS_DEFAULT);
      const amenities = [...new Set(extra ?? [])];
      const types = p.types ?? [];
      if (types.includes("meal_delivery")) amenities.push("Delivery");
      if (types.includes("meal_takeaway")) amenities.push("Takeout");
      if (FOOD_CATS.has(category) && !amenities.includes("Dine-In")) { amenities.push("Dine-In"); amenities.push("Takeout"); amenities.push("Family Friendly"); }

      const photos = [];
      const photoRefs = (p.photos ?? []).slice(0, 3);
      for (let i = 0; i < photoRefs.length; i++) {
        try {
          const buf = await fetchPhoto(photoRefs[i].name);
          if (buf) {
            await fs.mkdir(PHOTO_DIR, { recursive: true });
            await fs.writeFile(path.join(PHOTO_DIR, `${slug}-${i+1}.jpg`), buf);
            photos.push(`/photos/${slug}-${i+1}.jpg`);
          }
        } catch {}
      }
      if (!photos.length) { fail++; continue; }

      const reviews = mapReviews(p.reviews);
      const desc = `${esc(name)} — ${subcategory.replace(/-/g, " ")} in ${nh}, Edmonton.${amenities.includes("Halal") ? " Halal-certified." : ""} ${count > 0 ? `${count} Google reviews, ${rating.toFixed(1)}★.` : ""}`.trim();
      const hoursYaml = Object.entries(hours).map(([d,h]) => `  ${d}: "${h}"`).join("\n");
      const amenYaml = amenities.map(a => `  - "${esc(a)}"`).join("\n");
      const photosYaml = "[" + photos.map(ph => `"${ph}"`).join(", ") + "]";
      const reviewsYaml = reviews.length ? "\n" + toReviewsYaml(reviews) : "";
      const tags = `["edmonton", "${subcategory}"${extra?.length ? extra.map(e => `, "${e.toLowerCase()}"`).join("") : ""}]`;

      const md = `---
name: "${esc(name)}"
slug: "${slug}"
category: "${category}"
subcategory: "${subcategory}"
tier: "featured"
description: "${desc}"
address: "${esc(addr)}"
neighborhood: "${esc(nh)}"
${p.nationalPhoneNumber ? `phone: "${esc(p.nationalPhoneNumber)}"\n` : ""}${p.websiteUri ? `website: "${esc(p.websiteUri)}"\n` : ""}google_maps_url: "${esc(gUri || `https://maps.google.com/?q=${encodeURIComponent(name + ' Edmonton')}`)}"
hours:
${hoursYaml}
photos: ${photosYaml}
rating: ${rating}
review_count: ${count}
price_range: "${priceLevel(p.priceLevel)}"
amenities:
${amenYaml}
tags: ${tags}
active: true
date_listed: "2026-08-30"${reviewsYaml}
---
`;
      await fs.writeFile(path.join(DIR, `${slug}.md`), md);
      taken.add(slug);
      if (gUri) takenUris.add(gUri);
      total++;
      picked++;
      console.log(`  + ${name} → ${category}/${subcategory}`);
      await new Promise(r => setTimeout(r, 100));
    }
    console.log(`  → "${query}": kept ${picked}/${howMany}`);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Added: ${total} | Duplicates: ${dup} | No photos: ${fail} | Blocked: ${blocked}`);
  console.log(`Total businesses now: ${taken.size}`);
}

main().catch(e => { console.error(e); process.exit(1); });
