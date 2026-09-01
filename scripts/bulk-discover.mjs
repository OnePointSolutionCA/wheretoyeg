#!/usr/bin/env node
/**
 * Bulk discover Edmonton businesses via Google Places.
 * Run in waves: GOOGLE_PLACES_API_KEY=xxx node scripts/bulk-discover.mjs [wave]
 * wave = 1, 2, 3, 4, 5 (default: all)
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

// Wave 1: Restaurants (diverse cuisines, no bars/pubs/breweries)
const W1 = [
  ["halal chicken restaurant edmonton", "restaurants", "halal-chicken", 5, ["Halal"]],
  ["mediterranean restaurant edmonton", "restaurants", "mediterranean", 5, []],
  ["lebanese restaurant edmonton", "restaurants", "lebanese", 5, ["Halal"]],
  ["afghan restaurant edmonton", "restaurants", "afghan", 5, ["Halal"]],
  ["turkish restaurant edmonton", "restaurants", "turkish", 5, ["Halal"]],
  ["somali restaurant edmonton", "restaurants", "somali", 4, ["Halal"]],
  ["chinese restaurant edmonton", "restaurants", "chinese", 6, []],
  ["japanese ramen edmonton", "restaurants", "ramen", 4, []],
  ["sushi restaurant edmonton", "restaurants", "sushi", 5, []],
  ["mexican restaurant edmonton", "restaurants", "mexican", 5, []],
  ["italian restaurant edmonton", "restaurants", "italian", 5, []],
  ["greek restaurant edmonton", "restaurants", "greek", 4, []],
  ["filipino restaurant edmonton", "restaurants", "filipino", 4, []],
  ["caribbean restaurant edmonton", "restaurants", "caribbean", 3, []],
  ["vegan restaurant edmonton", "restaurants", "vegan", 4, []],
  ["breakfast restaurant edmonton", "restaurants", "breakfast", 5, []],
  ["family restaurant edmonton", "restaurants", "family", 5, []],
  ["steak restaurant edmonton", "restaurants", "steakhouse", 4, []],
  ["seafood restaurant edmonton", "restaurants", "seafood", 4, []],
  ["wing restaurant edmonton", "restaurants", "wings", 4, []],
  ["poutine edmonton", "restaurants", "poutine", 3, []],
  ["donair edmonton", "restaurants", "donair", 4, ["Halal"]],
  ["biryani restaurant edmonton", "restaurants", "biryani", 4, ["Halal"]],
  ["bangladeshi restaurant edmonton", "restaurants", "bangladeshi", 3, ["Halal"]],
  ["persian restaurant edmonton", "restaurants", "persian", 3, []],
  ["moroccan restaurant edmonton", "restaurants", "moroccan", 3, ["Halal"]],
  ["sudanese restaurant edmonton", "restaurants", "sudanese", 3, ["Halal"]],
  ["eritrean restaurant edmonton", "restaurants", "eritrean", 3, []],
  ["uyghur restaurant edmonton", "restaurants", "uyghur", 2, ["Halal"]],
  ["food truck edmonton", "restaurants", "food-truck", 4, []],
  ["ice cream shop edmonton", "restaurants", "ice-cream", 4, []],
];

// Wave 2: Cafes, bakeries, grocery
const W2 = [
  ["specialty coffee shop edmonton", "cafes-coffee-shops", "specialty", 5, []],
  ["tea house edmonton", "cafes-coffee-shops", "tea", 4, []],
  ["smoothie juice bar edmonton", "cafes-coffee-shops", "juice-bar", 4, []],
  ["internet cafe edmonton", "cafes-coffee-shops", "internet-cafe", 3, []],
  ["bakery edmonton pastry", "bakeries", "pastry", 5, []],
  ["cake shop edmonton", "bakeries", "cakes", 5, []],
  ["bread bakery edmonton", "bakeries", "artisan-bread", 4, []],
  ["middle eastern bakery edmonton", "bakeries", "middle-eastern", 4, ["Halal"]],
  ["halal grocery store edmonton", "grocery-markets", "halal-meat", 5, ["Halal"]],
  ["asian grocery store edmonton", "grocery-markets", "asian", 5, []],
  ["middle eastern grocery edmonton", "grocery-markets", "middle-eastern", 5, ["Halal"]],
  ["organic grocery edmonton", "grocery-markets", "organic", 4, []],
  ["indian grocery store edmonton", "grocery-markets", "indian", 4, []],
  ["african grocery store edmonton", "grocery-markets", "african", 3, []],
  ["korean grocery store edmonton", "grocery-markets", "korean", 3, []],
  ["butcher shop edmonton", "grocery-markets", "butcher", 4, []],
];

// Wave 3: Medical, wellness, fitness
const W3 = [
  ["family doctor edmonton", "medical", "family-doctors", 5, []],
  ["dentist edmonton", "medical", "dentists", 5, []],
  ["optometrist edmonton", "medical", "optometrists", 5, []],
  ["dermatologist edmonton", "medical", "dermatologists", 4, []],
  ["pediatrician edmonton", "medical", "pediatricians", 3, []],
  ["pharmacy edmonton", "medical", "pharmacies", 5, []],
  ["physiotherapy edmonton", "medical", "physiotherapy", 5, []],
  ["massage therapy clinic edmonton", "medical", "massage-therapy", 4, []],
  ["acupuncture edmonton", "medical", "acupuncture", 3, []],
  ["hearing clinic edmonton", "medical", "hearing-care", 3, []],
  ["mental health counselor edmonton", "medical", "counselling", 4, []],
  ["pilates studio edmonton", "gyms-fitness", "pilates", 4, []],
  ["martial arts edmonton", "gyms-fitness", "martial-arts", 4, []],
  ["swimming pool edmonton", "gyms-fitness", "swimming", 3, []],
  ["personal trainer edmonton", "gyms-fitness", "personal-training", 4, []],
  ["dance studio edmonton", "gyms-fitness", "dance", 4, []],
  ["spin cycling class edmonton", "gyms-fitness", "cycling", 3, []],
  ["rock climbing gym edmonton", "gyms-fitness", "climbing", 3, []],
];

// Wave 4: Beauty, grooming, home services
const W4 = [
  ["barber shop south edmonton", "barbers", "fades", 4, []],
  ["barber shop north edmonton", "barbers", "classic-cuts", 4, []],
  ["barber shop sherwood park", "barbers", "fades", 3, []],
  ["nail salon south edmonton", "nail-salons", "gel", 4, []],
  ["nail salon west edmonton", "nail-salons", "acrylic", 3, []],
  ["lash lift edmonton", "lash-techs", "lash-lifts", 4, []],
  ["brow threading edmonton", "lash-techs", "brow-services", 4, []],
  ["waxing studio edmonton", "spas-esthetics", "waxing", 4, []],
  ["laser hair removal edmonton", "spas-esthetics", "laser-hair-removal", 4, []],
  ["medspa edmonton", "spas-esthetics", "medspa", 4, []],
  ["hair salon sherwood park", "hair-salons", "cuts-styling", 4, []],
  ["hair salon st albert", "hair-salons", "cuts-styling", 3, []],
  ["hvac edmonton", "electricians", "hvac", 4, []],
  ["furnace repair edmonton", "electricians", "furnace", 4, []],
  ["garage door repair edmonton", "plumbers", "garage-door", 3, []],
  ["locksmith edmonton", "plumbers", "locksmith", 3, []],
  ["junk removal edmonton", "cleaning-services", "junk-removal", 4, []],
  ["carpet cleaning edmonton", "cleaning-services", "carpet", 4, []],
  ["window cleaning edmonton", "cleaning-services", "windows", 3, []],
];

// Wave 5: Professional services, activities, auto, catering, photographers
const W5 = [
  ["immigration consultant edmonton", "professional-services", "immigration", 4, []],
  ["financial advisor edmonton", "professional-services", "financial-advisors", 3, []],
  ["notary public edmonton", "professional-services", "notaries", 3, []],
  ["mortgage broker edmonton", "professional-services", "mortgage", 3, []],
  ["tax accountant edmonton", "professional-services", "accounting", 3, []],
  ["web designer edmonton", "professional-services", "marketing-web", 3, []],
  ["family lawyer edmonton", "professional-services", "legal", 3, []],
  ["driving school edmonton", "professional-services", "driving-school", 4, []],
  ["tutoring edmonton", "professional-services", "tutoring", 3, []],
  ["bowling alley edmonton", "activities-fun", "bowling", 3, []],
  ["go kart edmonton", "activities-fun", "karting", 3, []],
  ["trampoline park edmonton", "activities-fun", "trampoline", 3, []],
  ["paintball edmonton", "activities-fun", "paintball", 2, []],
  ["indoor playground edmonton", "activities-fun", "indoor-playground", 4, []],
  ["museum edmonton", "activities-fun", "museums", 3, []],
  ["mini golf edmonton", "activities-fun", "mini-golf", 3, []],
  ["swimming lake edmonton", "activities-fun", "outdoor", 3, []],
  ["laser tag edmonton", "activities-fun", "laser-tag", 2, []],
  ["tire shop edmonton", "auto-repair", "tires", 4, []],
  ["oil change edmonton", "auto-repair", "oil-change", 4, []],
  ["collision repair edmonton", "auto-repair", "collision", 4, []],
  ["auto body shop edmonton", "auto-repair", "body-shop", 4, []],
  ["car detailing edmonton", "auto-repair", "detailing", 4, []],
  ["transmission repair edmonton", "auto-repair", "transmission", 3, []],
  ["wedding catering edmonton", "catering", "wedding-catering", 3, []],
  ["corporate catering edmonton", "catering", "corporate-catering", 3, []],
  ["food truck catering edmonton", "catering", "food-trucks", 3, []],
  ["event photographer edmonton", "photographers", "events", 3, []],
  ["newborn photographer edmonton", "photographers", "family", 3, []],
  ["graduation photographer edmonton", "photographers", "graduation", 3, []],
];

const ALL_WAVES = { 1: W1, 2: W2, 3: W3, 4: W4, 5: W5 };

const FOOD_CATS = new Set(["restaurants", "cafes-coffee-shops", "bakeries"]);
const HOURS_DEFAULT = {
  monday: "9:00 AM - 6:00 PM", tuesday: "9:00 AM - 6:00 PM", wednesday: "9:00 AM - 6:00 PM",
  thursday: "9:00 AM - 8:00 PM", friday: "9:00 AM - 6:00 PM", saturday: "10:00 AM - 5:00 PM", sunday: "Closed",
};
const HOURS_RESTO = {
  monday: "11:00 AM - 9:00 PM", tuesday: "11:00 AM - 9:00 PM", wednesday: "11:00 AM - 9:00 PM",
  thursday: "11:00 AM - 9:00 PM", friday: "11:00 AM - 10:00 PM", saturday: "11:00 AM - 10:00 PM", sunday: "11:00 AM - 9:00 PM",
};

// Exclude bars, pubs, nightclubs, liquor stores, wineries, breweries
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

function hood(addr) {
  if (!addr) return "Edmonton";
  if (/downtown|jasper ave/i.test(addr)) return "Downtown";
  if (/west edmonton|170 st|wem/i.test(addr)) return "West Edmonton";
  if (/whyte|old strathcona|82 ave/i.test(addr)) return "Whyte Ave";
  if (/124 st/i.test(addr)) return "124 Street";
  if (/millwoods|mill woods|38 ave/i.test(addr)) return "Mill Woods";
  if (/ellerslie|summerside/i.test(addr)) return "South Edmonton";
  if (/beverly/i.test(addr)) return "Beverly";
  if (/sherwood park/i.test(addr)) return "Sherwood Park";
  if (/st\.? albert/i.test(addr)) return "St. Albert";
  if (/spruce grove/i.test(addr)) return "Spruce Grove";
  if (/leduc/i.test(addr)) return "Leduc";
  if (/beaumont/i.test(addr)) return "Beaumont";
  if (/167|northgate|castle downs|calder|dickinsfield|kensington|klarvatten|153 ave|97 st.*north/i.test(addr)) return "North Edmonton";
  if (/windermere|magrath|rutherford|allard|chappelle|walker|heritage|riverbend|terwillegar/i.test(addr)) return "South Edmonton";
  if (/bonnie doon|strathearn|holyrood|king edward/i.test(addr)) return "Edmonton";
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
  const waveArg = process.argv[2];
  const waves = waveArg ? [parseInt(waveArg)] : [1, 2, 3, 4, 5];

  const existingFiles = (await fs.readdir(DIR)).filter(f => f.endsWith(".md"));
  const taken = new Set(existingFiles.map(f => f.replace(/\.md$/, "")));
  const takenUris = new Set();
  for (const f of existingFiles) {
    const txt = await fs.readFile(path.join(DIR, f), "utf8");
    const m = txt.match(/google_maps_url:\s*"([^"]+)"/);
    if (m) takenUris.add(m[1]);
  }

  let total = 0, dup = 0, fail = 0, blocked = 0;

  for (const waveNum of waves) {
    const queries = ALL_WAVES[waveNum];
    if (!queries) { console.log(`Unknown wave ${waveNum}`); continue; }
    console.log(`\n=== WAVE ${waveNum} (${queries.length} queries) ===`);

    for (const [query, category, subcategory, howMany, extra] of queries) {
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
  }

  console.log(`\n=== DONE ===`);
  console.log(`Added: ${total} | Duplicates: ${dup} | No photos: ${fail} | Blocked (bar/pub): ${blocked}`);
  console.log(`Total businesses now: ${taken.size}`);
}

main().catch(e => { console.error(e); process.exit(1); });
