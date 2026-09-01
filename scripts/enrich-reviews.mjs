#!/usr/bin/env node
/**
 * Batch-fetch Google reviews for businesses missing them.
 * GOOGLE_PLACES_API_KEY=xxx node scripts/enrich-reviews.mjs [limit]
 * Default limit: 120 businesses
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/gg/Desktop/WheretoYEG";
const DIR = path.join(ROOT, "content/businesses");
const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) { console.error("Missing GOOGLE_PLACES_API_KEY"); process.exit(1); }

const LIMIT = parseInt(process.argv[2] || "120");

function esc(s) { return String(s ?? "").replace(/"/g, '\\"'); }

async function findPlace(name, addr) {
  const query = `${name} ${addr.includes("Edmonton") ? "" : "Edmonton"}`;
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.reviews,places.rating,places.userRatingCount",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1, languageCode: "en", regionCode: "CA" }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.places?.[0] ?? null;
}

function formatReviews(reviews) {
  return (reviews ?? []).slice(0, 5).map(r => ({
    name: r.authorAttribution?.displayName ?? "Google reviewer",
    rating: r.rating ?? 5,
    date: (r.publishTime ?? "").slice(0, 10),
    comment: (r.text?.text ?? "").replace(/\r\n/g, "\n").trim(),
  })).filter(r => r.comment.length > 10);
}

function reviewsToYaml(reviews) {
  const lines = ["reviews:"];
  for (const r of reviews) {
    lines.push(`  - name: "${esc(r.name)}"`);
    lines.push(`    rating: ${r.rating}`);
    lines.push(`    comment: |`);
    for (const line of r.comment.split("\n")) lines.push("      " + line.trimEnd());
  }
  return lines.join("\n");
}

async function main() {
  const files = (await fs.readdir(DIR)).filter(f => f.endsWith(".md"));

  // Find businesses with no reviews or rating 0
  const candidates = [];
  for (const f of files) {
    const txt = await fs.readFile(path.join(DIR, f), "utf8");
    const hasReviews = /^reviews:/m.test(txt);
    const ratingMatch = txt.match(/^rating:\s*([\d.]+)/m);
    const rating = parseFloat(ratingMatch?.[1] ?? "0");
    const nameMatch = txt.match(/^name:\s*"([^"]+)"/m);
    const addrMatch = txt.match(/^address:\s*"([^"]+)"/m);
    if (!nameMatch) continue;

    // Prioritize: no reviews at all, then low review count
    const countMatch = txt.match(/^review_count:\s*(\d+)/m);
    const count = parseInt(countMatch?.[1] ?? "0");

    const reviewLines = (txt.match(/^  - name:/gm) || []).length;
    if (!hasReviews || count === 0 || reviewLines < 3) {
      candidates.push({ file: f, name: nameMatch[1], addr: addrMatch?.[1] ?? "Edmonton", rating, count, reviewLines, txt });
    }
  }

  // Sort: 0 reviews first, then by name
  candidates.sort((a, b) => a.count - b.count || a.name.localeCompare(b.name));

  const batch = candidates.slice(0, LIMIT);
  console.log(`Found ${candidates.length} businesses needing reviews. Processing ${batch.length}...\n`);

  let enriched = 0, skipped = 0, failed = 0;

  for (const biz of batch) {
    try {
      const place = await findPlace(biz.name, biz.addr);
      if (!place?.reviews?.length) { skipped++; continue; }

      const reviews = formatReviews(place.reviews);
      if (reviews.length === 0) { skipped++; continue; }

      const newRating = place.rating ?? biz.rating;
      const newCount = place.userRatingCount ?? biz.count;

      let txt = biz.txt;

      // Update rating and review_count
      txt = txt.replace(/^rating:\s*[\d.]+/m, `rating: ${newRating}`);
      txt = txt.replace(/^review_count:\s*\d+/m, `review_count: ${newCount}`);

      // Add or replace reviews block
      if (/^reviews:/m.test(txt)) {
        // Replace existing reviews section (from "reviews:" to the next top-level key or end of frontmatter)
        txt = txt.replace(/^reviews:[\s\S]*?(?=^[a-z_]+:|^---\s*$)/m, reviewsToYaml(reviews) + "\n");
      } else {
        // Insert before the closing ---
        txt = txt.replace(/^---\s*$/m, reviewsToYaml(reviews) + "\n---");
      }

      await fs.writeFile(path.join(DIR, biz.file), txt);
      enriched++;
      console.log(`  + ${biz.name}: ${reviews.length} reviews, ${newRating}★ (${newCount})`);

      // Rate limit
      await new Promise(r => setTimeout(r, 120));
    } catch (e) {
      failed++;
      console.log(`  ✗ ${biz.name}: ${e.message}`);
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Enriched: ${enriched} | Skipped (no reviews found): ${skipped} | Failed: ${failed}`);
}

main().catch(e => { console.error(e); process.exit(1); });
