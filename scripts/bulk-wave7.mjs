#!/usr/bin/env node
/**
 * Wave 7: Fill neighborhood gaps + double down on high-impression GSC categories.
 *
 * Targets:
 * 1. Underserved neighborhoods: Beaumont, Spruce Grove, Castle Downs, Mill Woods, Windermere, Beverly
 * 2. High-impression categories: restaurants, cafes, escape rooms, climbing, dentists, auto repair, pizza, cleaning
 * 3. Queries getting impressions but 0 clicks in GSC
 */

import fs from "node:fs";
import path from "node:path";

const API_KEY = "AIzaSyAoPEJjfB2boLaH4zoO9krgc4Gdqijz3ks";
const BIZ_DIR = path.join(process.cwd(), "content/businesses");
const IMG_DIR = path.join(process.cwd(), "public/images/businesses");

const BLOCKED = /bar\b|pub\b|brew|liquor|wine\s*store|cannabis|tattoo|hookah|shisha|vape|lounge.*bar|nightclub|strip\b|adult/i;
const PORK = /pork|bacon|ham\b|prosciutto|sausage/i;

function slug(name) {
  return name.toLowerCase().replace(/['']/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function downloadPhoto(photoName, bizSlug) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${API_KEY}`;
  const outPath = path.join(IMG_DIR, `${bizSlug}.jpg`);
  if (fs.existsSync(outPath)) return `/images/businesses/${bizSlug}.jpg`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 3000) return null;
    fs.writeFileSync(outPath, buf);
    return `/images/businesses/${bizSlug}.jpg`;
  } catch { return null; }
}

function mapCategory(types) {
  const t = new Set(types || []);
  if (t.has("restaurant") || t.has("food")) return "restaurants";
  if (t.has("cafe") || t.has("coffee_shop")) return "cafes-coffee-shops";
  if (t.has("bakery")) return "bakeries";
  if (t.has("supermarket") || t.has("grocery_store")) return "grocery-markets";
  if (t.has("dentist")) return "medical";
  if (t.has("doctor") || t.has("hospital") || t.has("pharmacy") || t.has("physiotherapist") || t.has("health")) return "medical";
  if (t.has("gym") || t.has("fitness_center")) return "gyms-fitness";
  if (t.has("hair_care") || t.has("hair_salon")) return "hair-salons";
  if (t.has("beauty_salon") || t.has("spa")) return "spas-esthetics";
  if (t.has("car_repair") || t.has("car_dealer") || t.has("car_wash")) return "auto-repair";
  if (t.has("plumber")) return "plumbers";
  if (t.has("electrician")) return "electricians";
  if (t.has("lawyer") || t.has("accounting") || t.has("insurance_agency") || t.has("real_estate_agency")) return "professional-services";
  if (t.has("photographer")) return "photographers";
  return "restaurants";
}

function mapSubcategory(types, category) {
  const t = new Set(types || []);
  if (category === "restaurants") {
    if (t.has("pizza_restaurant")) return "pizza";
    if (t.has("sushi_restaurant") || t.has("japanese_restaurant")) return "japanese";
    if (t.has("chinese_restaurant")) return "chinese";
    if (t.has("indian_restaurant")) return "indian-pakistani";
    if (t.has("italian_restaurant")) return "italian";
    if (t.has("mexican_restaurant")) return "mexican";
    if (t.has("thai_restaurant")) return "thai";
    if (t.has("vietnamese_restaurant")) return "vietnamese";
    if (t.has("korean_restaurant")) return "korean";
    if (t.has("middle_eastern_restaurant")) return "middle-eastern";
    if (t.has("seafood_restaurant")) return "seafood";
    if (t.has("steak_house")) return "steakhouse";
    if (t.has("hamburger_restaurant")) return "burgers";
    if (t.has("breakfast_restaurant") || t.has("brunch_restaurant")) return "brunch";
    return null;
  }
  if (category === "medical") {
    if (t.has("dentist")) return "dentists";
    if (t.has("pharmacy")) return "pharmacies";
    if (t.has("physiotherapist")) return "physiotherapy";
    return null;
  }
  if (category === "auto-repair") {
    if (t.has("car_wash")) return "car-wash";
    return "general-repair";
  }
  return null;
}

// ---- Queries targeting neighborhood gaps + high-impression categories ----
const QUERIES = [
  // === BEAUMONT (0 businesses) ===
  { q: "restaurants in Beaumont Alberta", neighborhood: "Beaumont" },
  { q: "cafes in Beaumont Alberta", neighborhood: "Beaumont" },
  { q: "dentists in Beaumont Alberta", neighborhood: "Beaumont" },
  { q: "hair salons in Beaumont Alberta", neighborhood: "Beaumont" },
  { q: "auto repair in Beaumont Alberta", neighborhood: "Beaumont" },
  { q: "pizza in Beaumont Alberta", neighborhood: "Beaumont" },
  { q: "gyms in Beaumont Alberta", neighborhood: "Beaumont" },

  // === SPRUCE GROVE (0 businesses) ===
  { q: "restaurants in Spruce Grove Alberta", neighborhood: "Spruce Grove" },
  { q: "cafes coffee shops in Spruce Grove Alberta", neighborhood: "Spruce Grove" },
  { q: "dentists in Spruce Grove Alberta", neighborhood: "Spruce Grove" },
  { q: "hair salons in Spruce Grove Alberta", neighborhood: "Spruce Grove" },
  { q: "auto repair in Spruce Grove Alberta", neighborhood: "Spruce Grove" },
  { q: "pizza in Spruce Grove Alberta", neighborhood: "Spruce Grove" },
  { q: "medical clinics in Spruce Grove Alberta", neighborhood: "Spruce Grove" },

  // === CASTLE DOWNS (2 businesses) ===
  { q: "restaurants in Castle Downs Edmonton", neighborhood: "Castle Downs" },
  { q: "barber shops in Castle Downs Edmonton", neighborhood: "Castle Downs" },
  { q: "dentists in Castle Downs Edmonton", neighborhood: "Castle Downs" },
  { q: "pizza in Castle Downs Edmonton", neighborhood: "Castle Downs" },

  // === MILL WOODS (4 businesses) ===
  { q: "restaurants in Mill Woods Edmonton", neighborhood: "Mill Woods" },
  { q: "cafes in Mill Woods Edmonton", neighborhood: "Mill Woods" },
  { q: "halal restaurants in Mill Woods Edmonton", neighborhood: "Mill Woods" },
  { q: "dentists in Mill Woods Edmonton", neighborhood: "Mill Woods" },
  { q: "auto repair in Mill Woods Edmonton", neighborhood: "Mill Woods" },

  // === WINDERMERE (2 businesses) ===
  { q: "restaurants in Windermere Edmonton", neighborhood: "Windermere" },
  { q: "cafes in Windermere Edmonton", neighborhood: "Windermere" },
  { q: "dentists in Windermere Edmonton", neighborhood: "Windermere" },
  { q: "pizza in Windermere Edmonton", neighborhood: "Windermere" },

  // === BEVERLY (4 businesses) ===
  { q: "restaurants in Beverly Edmonton", neighborhood: "Beverly" },
  { q: "auto repair in Beverly Edmonton", neighborhood: "Beverly" },

  // === ST. ALBERT (needs more) ===
  { q: "restaurants in St Albert Alberta", neighborhood: "St. Albert" },
  { q: "cafes in St Albert Alberta", neighborhood: "St. Albert" },
  { q: "pizza in St Albert Alberta", neighborhood: "St. Albert" },

  // === SHERWOOD PARK (needs more) ===
  { q: "restaurants in Sherwood Park Alberta", neighborhood: "Sherwood Park" },
  { q: "cafes in Sherwood Park Alberta", neighborhood: "Sherwood Park" },
  { q: "dentists in Sherwood Park Alberta", neighborhood: "Sherwood Park" },

  // === HIGH-IMPRESSION GSC CATEGORY FILLS ===
  // Pizza (194 impressions) - need more pizza spots
  { q: "best pizza restaurants Edmonton Alberta" },
  { q: "halal pizza Edmonton Alberta" },
  { q: "wood fired pizza Edmonton" },

  // Breakfast/Brunch (high impressions on emerald breakfast)
  { q: "best breakfast restaurants Edmonton Alberta" },
  { q: "brunch spots Edmonton Alberta" },

  // Carpet cleaning (100+ impressions)
  { q: "carpet cleaning services Edmonton Alberta", cat: "cleaning-services" },
  { q: "commercial cleaning company Edmonton Alberta", cat: "cleaning-services" },

  // Emergency dentists (191 impressions)
  { q: "emergency dentist Edmonton Alberta", cat: "medical" },
  { q: "walk in dental clinic Edmonton Alberta", cat: "medical" },
  { q: "affordable dentist Edmonton", cat: "medical" },

  // Escape rooms / activities (317 impressions)
  { q: "go kart racing Edmonton Alberta", cat: "activities-fun" },
  { q: "paintball Edmonton Alberta", cat: "activities-fun" },
  { q: "trampoline park Edmonton Alberta", cat: "activities-fun" },
  { q: "arcade Edmonton Alberta", cat: "activities-fun" },

  // Notary (30+ impressions, no focus yet)
  { q: "notary public Edmonton Alberta", cat: "professional-services" },

  // Oil change / auto (high impressions)
  { q: "oil change Edmonton Alberta", cat: "auto-repair" },
  { q: "tire shop Edmonton Alberta", cat: "auto-repair" },

  // Hearing / audiology (97 impressions - Medicine Place territory)
  { q: "hearing aid clinic Edmonton Alberta", cat: "medical" },
  { q: "audiologist Edmonton Alberta", cat: "medical" },

  // Photography / headshots (179 impressions)
  { q: "headshot photographer Edmonton Alberta", cat: "photographers" },
  { q: "newborn photographer Edmonton Alberta", cat: "photographers" },
  { q: "family photographer Edmonton Alberta", cat: "photographers" },

  // Catering (16 impressions)
  { q: "catering services Edmonton Alberta", cat: "catering" },
  { q: "halal catering Edmonton Alberta", cat: "catering" },

  // Eye care / optometrist
  { q: "optometrist Edmonton Alberta", cat: "medical" },
  { q: "eye exam Edmonton Alberta", cat: "medical" },
];

async function searchPlaces(query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.photos,places.reviews,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri,places.primaryType",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 20, languageCode: "en", regionCode: "CA" }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
  return await res.json();
}

async function main() {
  if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

  const existing = new Set(
    fs.readdirSync(BIZ_DIR).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""))
  );

  let added = 0;
  let skipped = 0;
  let total = 0;

  for (let qi = 0; qi < QUERIES.length; qi++) {
    const { q, neighborhood, cat } = QUERIES[qi];
    console.log(`\n[${qi + 1}/${QUERIES.length}] "${q}"`);

    let result;
    try {
      result = await searchPlaces(q);
    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
      await sleep(2000);
      continue;
    }

    const places = result?.places || [];
    console.log(`  Found ${places.length} results`);

    for (const p of places) {
      total++;
      const name = p.displayName?.text;
      if (!name) continue;

      if (BLOCKED.test(name) || BLOCKED.test((p.types || []).join(" "))) {
        skipped++;
        continue;
      }

      const s = slug(name);
      if (existing.has(s)) continue;

      // Check for dupes with suffix
      let finalSlug = s;
      if (existing.has(s)) continue;
      let suffix = 2;
      while (existing.has(finalSlug)) {
        finalSlug = `${s}-${suffix++}`;
      }

      const types = p.types || [];
      const category = cat || mapCategory(types);
      const subcategory = mapSubcategory(types, category);
      const rating = p.rating || 0;
      const reviewCount = p.userRatingCount || 0;

      if (rating < 3.5 && reviewCount > 5) continue;

      const addr = p.formattedAddress || "";
      let hood = neighborhood || "Edmonton";
      if (!neighborhood) {
        if (/sherwood park/i.test(addr)) hood = "Sherwood Park";
        else if (/st\.?\s*albert/i.test(addr)) hood = "St. Albert";
        else if (/spruce grove/i.test(addr)) hood = "Spruce Grove";
        else if (/beaumont/i.test(addr)) hood = "Beaumont";
        else if (/leduc/i.test(addr)) hood = "Leduc";
        else if (/mill\s*woods/i.test(addr)) hood = "Mill Woods";
        else if (/windermere/i.test(addr)) hood = "Windermere";
        else if (/whyte|82\s*ave/i.test(addr)) hood = "Whyte Ave";
        else if (/jasper.*ave/i.test(addr)) hood = "Jasper Ave";
        else if (/downtown/i.test(addr)) hood = "Downtown";
        else if (/124\s*st/i.test(addr)) hood = "124 Street";
        else if (/castle\s*downs/i.test(addr)) hood = "Castle Downs";
      }

      // Download photo
      let photos = [];
      if (p.photos?.length > 0) {
        const photoUrl = await downloadPhoto(p.photos[0].name, finalSlug);
        if (photoUrl) photos.push(photoUrl);
      }

      // Extract reviews
      const reviews = (p.reviews || [])
        .filter((r) => r.text?.text && r.text.text.length > 30)
        .filter((r) => !PORK.test(r.text.text) && !BLOCKED.test(r.text.text))
        .slice(0, 5)
        .map((r) => ({
          name: r.authorAttribution?.displayName || "Local",
          rating: r.rating || 5,
          comment: r.text.text.replace(/\n/g, " ").slice(0, 500),
        }));

      // Build frontmatter
      let md = "---\n";
      md += `name: "${name.replace(/"/g, '\\"')}"\n`;
      md += `slug: "${finalSlug}"\n`;
      md += `category: "${category}"\n`;
      if (subcategory) md += `subcategory: "${subcategory}"\n`;
      md += `neighborhood: "${hood}"\n`;
      md += `address: "${addr.replace(/"/g, '\\"')}"\n`;
      md += `rating: ${rating}\n`;
      md += `review_count: ${reviewCount}\n`;
      md += `tier: "featured"\n`;
      if (p.nationalPhoneNumber) md += `phone: "${p.nationalPhoneNumber}"\n`;
      if (p.websiteUri) md += `website: "${p.websiteUri}"\n`;
      if (p.googleMapsUri) md += `google_maps: "${p.googleMapsUri}"\n`;
      if (photos.length > 0) {
        md += "photos:\n";
        for (const ph of photos) md += `  - "${ph}"\n`;
      }
      if (reviews.length > 0) {
        md += "reviews:\n";
        for (const r of reviews) {
          md += `  - name: "${r.name.replace(/"/g, '\\"')}"\n`;
          md += `    rating: ${r.rating}\n`;
          md += `    comment: "${r.comment.replace(/"/g, '\\"')}"\n`;
        }
      }
      md += "---\n";

      fs.writeFileSync(path.join(BIZ_DIR, `${finalSlug}.md`), md);
      existing.add(finalSlug);
      added++;
      console.log(`  + ${name} (${category}, ${hood})`);
    }

    await sleep(1500);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Total results: ${total}`);
  console.log(`Added: ${added}`);
  console.log(`Skipped (blocked/low-rated): ${skipped}`);
  console.log(`Total businesses now: ${existing.size}`);
}

main().catch(console.error);
