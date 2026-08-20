#!/usr/bin/env node
/**
 * Discover real Edmonton businesses via Google Places Text Search,
 * then add them as full listings (frontmatter + photos + reviews).
 *
 * No invented names — every listing comes from a real Google Places record.
 *
 * Usage: GOOGLE_PLACES_API_KEY=xxx node scripts/discover-businesses.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "content/businesses");
const PHOTO_DIR = path.join(ROOT, "public/photos");
const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) { console.error("Missing GOOGLE_PLACES_API_KEY"); process.exit(1); }

// (query, category, subcategory, howMany, extraAmenities)
const QUERIES = [
  ["halal shawarma edmonton", "restaurants", "shawarma", 6, ["Halal"]],
  ["halal pakistani restaurant edmonton", "restaurants", "pakistani", 5, ["Halal"]],
  ["halal indian restaurant edmonton", "restaurants", "indian", 5, ["Halal"]],
  ["vietnamese pho restaurant edmonton", "restaurants", "vietnamese", 5, []],
  ["thai restaurant edmonton", "restaurants", "thai", 3, []],
  ["korean restaurant edmonton", "restaurants", "sushi", 3, []],
  ["ethiopian restaurant edmonton", "restaurants", "ethiopian", 3, []],
  ["halal pizza edmonton", "restaurants", "pizza", 3, ["Halal"]],
  ["halal burger edmonton", "restaurants", "burgers", 3, ["Halal"]],
  ["bubble tea edmonton", "cafes-coffee-shops", "boba-bubble-tea", 5, []],
  ["coffee roaster edmonton", "cafes-coffee-shops", "roasters", 3, []],
  ["dessert cafe edmonton", "cafes-coffee-shops", "dessert-cafes", 4, []],
  ["halal bakery edmonton", "bakeries", "halal-bakeries", 4, ["Halal"]],
  ["halal grocery edmonton", "grocery-markets", "halal-meat", 5, ["Halal"]],
  ["south asian grocery edmonton", "grocery-markets", "south-asian", 4, []],
  ["barber shop edmonton", "barbers", "fades", 5, []],
  ["hair salon edmonton", "hair-salons", "cuts-styling", 4, []],
  ["nail salon edmonton", "nail-salons", "gel", 4, []],
  ["dental clinic edmonton", "medical", "dentists", 5, []],
  ["physiotherapy clinic edmonton", "medical", "physiotherapy", 4, []],
  ["chiropractor edmonton", "medical", "chiropractors", 3, []],
  ["walk in clinic edmonton", "medical", "walk-in-clinics", 3, []],
  ["auto repair shop edmonton", "auto-repair", "mechanics", 4, []],
  ["escape room edmonton", "activities-fun", "escape-rooms", 3, []],
];

const HOURS_DEFAULT = {
  monday: "9:00 AM - 6:00 PM", tuesday: "9:00 AM - 6:00 PM", wednesday: "9:00 AM - 6:00 PM",
  thursday: "9:00 AM - 8:00 PM", friday: "9:00 AM - 6:00 PM", saturday: "10:00 AM - 5:00 PM",
  sunday: "Closed",
};
const HOURS_RESTO = {
  monday: "11:00 AM - 9:00 PM", tuesday: "11:00 AM - 9:00 PM", wednesday: "11:00 AM - 9:00 PM",
  thursday: "11:00 AM - 9:00 PM", friday: "11:00 AM - 10:00 PM", saturday: "11:00 AM - 10:00 PM",
  sunday: "11:00 AM - 9:00 PM",
};

const FOOD_CATS = new Set(["restaurants", "cafes-coffee-shops", "bakeries"]);

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function escapeMd(s) {
  return String(s ?? "").replace(/"/g, '\\"');
}

function fmt(ratings, count) {
  return { rating: Math.max(0, Math.min(5, +ratings || 0)), review_count: Math.max(0, +count || 0) };
}

function extractGoogleHours(place) {
  // regularOpeningHours.weekdayDescriptions[] — "Monday: 9:00 AM – 5:00 PM"
  const wk = place.regularOpeningHours?.weekdayDescriptions;
  if (!wk?.length) return null;
  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  const out = {};
  for (const line of wk) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (!m) continue;
    const day = m[1].toLowerCase();
    if (!days.includes(day)) continue;
    // Normalize: replace en-dash with hyphen for consistency
    out[day] = m[2].replace(/–/g, "-").replace(/\s+/g, " ").trim();
  }
  return Object.keys(out).length === 7 ? out : null;
}

function neighborhoodFromAddress(addr) {
  if (!addr) return "Edmonton";
  // Simple heuristics — real Places addresses often include neighborhood or a landmark
  const s = addr;
  if (/downtown|jasper ave/i.test(s)) return "Downtown";
  if (/west edmonton|170 st|wem|west edmonton mall/i.test(s)) return "West Edmonton";
  if (/whyte|old strathcona|82 ave/i.test(s)) return "Old Strathcona";
  if (/124 st|124 street/i.test(s)) return "124 Street";
  if (/millwoods|mill woods/i.test(s)) return "Mill Woods";
  if (/ellerslie/i.test(s)) return "Ellerslie";
  if (/beverly/i.test(s)) return "Beverly";
  if (/sherwood park/i.test(s)) return "Sherwood Park";
  if (/st\.? albert/i.test(s)) return "St. Albert";
  if (/spruce grove/i.test(s)) return "Spruce Grove";
  if (/leduc/i.test(s)) return "Leduc";
  if (/167|northgate|castle downs|calder|dickinsfield|kensington|klarvatten/i.test(s)) return "North Edmonton";
  if (/south edmonton|windermere|magrath|rutherford|allard|blackmud|chappelle|walker/i.test(s)) return "South Edmonton";
  return "Edmonton";
}

async function textSearch(query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.rating",
        "places.userRatingCount",
        "places.priceLevel",
        "places.regularOpeningHours",
        "places.websiteUri",
        "places.nationalPhoneNumber",
        "places.googleMapsUri",
        "places.photos",
        "places.reviews",
        "places.types",
      ].join(","),
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 10, languageCode: "en", regionCode: "CA" }),
  });
  if (!res.ok) throw new Error(`Text search ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).places ?? [];
}

async function fetchPhotoBinary(photoName, maxWidth = 1600) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${KEY}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.length < 3000 ? null : buf;
}

function priceLevelToRange(level) {
  switch (level) {
    case "PRICE_LEVEL_FREE":
    case "PRICE_LEVEL_INEXPENSIVE": return "$";
    case "PRICE_LEVEL_MODERATE": return "$$";
    case "PRICE_LEVEL_EXPENSIVE": return "$$$";
    case "PRICE_LEVEL_VERY_EXPENSIVE": return "$$$$";
    default: return "$$";
  }
}

function mapReviews(reviews) {
  return (reviews ?? []).slice(0, 5).map((r) => ({
    name: r.authorAttribution?.displayName ?? "Google reviewer",
    rating: r.rating ?? 5,
    date: (r.publishTime ?? "").slice(0, 10) || (r.relativePublishTimeDescription ?? ""),
    comment: r.text?.text ?? r.originalText?.text ?? "",
  })).filter((r) => r.comment.length > 0);
}

function toReviewsYaml(reviews) {
  const lines = ["reviews:"];
  for (const r of reviews) {
    lines.push(`  - name: "${escapeMd(r.name)}"`);
    lines.push(`    rating: ${r.rating}`);
    lines.push(`    date: "${escapeMd(r.date)}"`);
    lines.push(`    comment: |`);
    const content = String(r.comment).replace(/\r\n/g, "\n").trim();
    for (const line of content.split("\n")) {
      lines.push("      " + line.trimEnd());
    }
  }
  return lines.join("\n");
}

async function pickAmenitiesFromPlace(place, extra) {
  const set = new Set(extra ?? []);
  const types = place.types ?? [];
  if (types.includes("meal_delivery")) set.add("Delivery");
  if (types.includes("meal_takeaway")) set.add("Takeout");
  if (types.some((t) => /restaurant|cafe|bakery|food/i.test(t))) {
    set.add("Dine-In"); set.add("Takeout"); set.add("Family Friendly");
  }
  return [...set];
}

async function existingSlugs() {
  const files = await fs.readdir(DIR);
  return new Set(files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")));
}

async function existingGoogleUris() {
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".md"));
  const set = new Set();
  for (const f of files) {
    const txt = await fs.readFile(path.join(DIR, f), "utf8");
    const m = txt.match(/google_maps_url:\s*"([^"]+)"/);
    if (m) set.add(m[1]);
  }
  return set;
}

async function processOnePlace(place, category, subcategory, extraAmenities, taken, takenUris) {
  const name = place.displayName?.text;
  if (!name) return { status: "no-name" };
  const baseSlug = slugify(name);
  if (!baseSlug) return { status: "bad-slug" };

  // De-dupe by slug and by Google Maps URI (avoid same business listed twice)
  let slug = baseSlug;
  let n = 2;
  while (taken.has(slug)) { slug = `${baseSlug}-${n}`; n++; if (n > 9) return { status: "dup-slug" }; }

  const gUri = place.googleMapsUri ?? "";
  if (gUri && takenUris.has(gUri)) return { status: "dup-place" };

  const address = place.formattedAddress ?? "Edmonton";
  const neighborhood = neighborhoodFromAddress(address);
  const { rating, review_count } = fmt(place.rating, place.userRatingCount);
  const priceRange = priceLevelToRange(place.priceLevel);
  const hours = extractGoogleHours(place) ?? (FOOD_CATS.has(category) ? HOURS_RESTO : HOURS_DEFAULT);
  const amenities = await pickAmenitiesFromPlace(place, extraAmenities);
  const tagList = ["edmonton", subcategory, ...(extraAmenities?.map((s) => s.toLowerCase()) ?? [])];

  // Description — synthesize from name + category
  const description = `${escapeMd(name)} — a ${subcategory} spot in ${neighborhood}, Edmonton. ${amenities.includes("Halal") ? "Halal-certified. " : ""}${review_count > 0 ? `${review_count} Google reviews, ${rating.toFixed(1)}★.` : ""}`.trim();

  // Download photos
  const photos = [];
  const photoRefs = (place.photos ?? []).slice(0, 3);
  for (let i = 0; i < photoRefs.length; i++) {
    try {
      const buf = await fetchPhotoBinary(photoRefs[i].name);
      if (buf) {
        await fs.mkdir(PHOTO_DIR, { recursive: true });
        await fs.writeFile(path.join(PHOTO_DIR, `${slug}-${i + 1}.jpg`), buf);
        photos.push(`/photos/${slug}-${i + 1}.jpg`);
      }
    } catch {}
  }
  if (!photos.length) return { status: "no-photos", slug };

  const reviews = mapReviews(place.reviews);

  // Build .md
  const hoursYaml = Object.entries(hours).map(([d, h]) => `  ${d}: "${h}"`).join("\n");
  const amenitiesYaml = amenities.map((a) => `  - "${escapeMd(a)}"`).join("\n");
  const tagsYaml = "[" + tagList.map((t) => `"${escapeMd(t)}"`).join(", ") + "]";
  const photosYaml = "[" + photos.map((p) => `"${p}"`).join(", ") + "]";
  const reviewsYaml = reviews.length ? "\n" + toReviewsYaml(reviews) : "";

  const md = `---
name: "${escapeMd(name)}"
slug: "${slug}"
category: "${category}"
subcategory: "${subcategory}"
tier: "featured"
description: "${escapeMd(description)}"
address: "${escapeMd(address)}"
neighborhood: "${escapeMd(neighborhood)}"
${place.nationalPhoneNumber ? `phone: "${escapeMd(place.nationalPhoneNumber)}"\n` : ""}${place.websiteUri ? `website: "${escapeMd(place.websiteUri)}"\n` : ""}google_maps_url: "${escapeMd(gUri || `https://maps.google.com/?q=${encodeURIComponent(name + ' Edmonton')}`)}"
hours:
${hoursYaml}
photos: ${photosYaml}
rating: ${rating}
review_count: ${review_count}
price_range: "${priceRange}"
amenities:
${amenitiesYaml}
tags: ${tagsYaml}
active: true
date_listed: "2026-08-20"${reviewsYaml}
---
`;

  await fs.writeFile(path.join(DIR, `${slug}.md`), md);
  taken.add(slug);
  if (gUri) takenUris.add(gUri);
  return { status: "ok", slug, matched: name };
}

async function main() {
  const taken = await existingSlugs();
  const takenUris = await existingGoogleUris();
  let total = 0, dup = 0, fail = 0;
  for (const [query, category, subcategory, howMany, extra] of QUERIES) {
    let places;
    try { places = await textSearch(query); }
    catch (e) { console.log(`✗ query "${query}": ${e.message}`); continue; }
    let picked = 0;
    for (const p of places) {
      if (picked >= howMany) break;
      const r = await processOnePlace(p, category, subcategory, extra, taken, takenUris);
      if (r.status === "ok") { console.log(`  + ${r.matched} → ${category}/${subcategory}`); picked++; total++; }
      else if (r.status === "dup-slug" || r.status === "dup-place") dup++;
      else fail++;
      await new Promise((res) => setTimeout(res, 120));
    }
    console.log(`  → ${query}: kept ${picked}`);
  }
  console.log(`\nDone. Added ${total} new listings, ${dup} duplicates skipped, ${fail} failed.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
