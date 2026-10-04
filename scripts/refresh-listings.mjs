#!/usr/bin/env node
/**
 * Refresh business listings from Google Places API (New).
 * Updates: rating, review_count, hours, reviews, phone, website.
 *
 * Each run refreshes an even share of what's left of Google's free monthly
 * Text Search allowance (see places-budget.mjs), so it never costs money.
 * Slugs listed in refresh-priority.json go first; then active listings are
 * cycled in order via a cursor in places-usage.json.
 *
 * Requires: GOOGLE_PLACES_API_KEY env var.
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=xxx node scripts/refresh-listings.mjs
 *
 * Flags:
 *   --batch=N     Max listings per run (default 30, under the 32 a day Text Search quota)
 *   --slug=x      Refresh only one business
 *   --dry         Print changes without writing
 *   --all         Refresh all businesses (ignore batching)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addUsage, daysLeftInMonth, freeLeft, loadUsage, saveUsage } from "./places-budget.mjs";
import { googleHours } from "./google-hours.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUSINESS_DIR = path.join(ROOT, "content/businesses");
const PRIORITY_FILE = path.join(ROOT, "scripts/refresh-priority.json");

async function readPriority() {
  try { return JSON.parse(await fs.readFile(PRIORITY_FILE, "utf8")); } catch { return []; }
}
const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY env var.");
  process.exit(1);
}

const ARGS = process.argv.slice(2);
const DRY = ARGS.includes("--dry");
const ALL = ARGS.includes("--all");
const ONLY = ARGS.find((a) => a.startsWith("--slug="))?.split("=")[1];
const BATCH = parseInt(ARGS.find((a) => a.startsWith("--batch="))?.split("=")[1] ?? "30", 10);

const DAYS_MAP = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const HOURS_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Hours-only lookups skip reviews, so Google bills them under a cheaper SKU with its own free allowance.
const FULL_MASK =
  "places.id,places.displayName,places.rating,places.userRatingCount," +
  "places.regularOpeningHours,places.reviews,places.nationalPhoneNumber," +
  "places.websiteUri";
const HOURS_MASK = "places.id,places.displayName,places.regularOpeningHours";

async function textSearch(query, hoursOnly = false) {
  addUsage(hoursOnly ? "hours" : "search");
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": hoursOnly ? HOURS_MASK : FULL_MASK,
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 3,
      languageCode: "en",
    }),
  });
  if (!res.ok) throw new Error(`Text search ${res.status}: ${(await res.text()).slice(0, 300)}`);
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
      if ((p.userRatingCount ?? 0) > 0) score += 5;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.p;
}

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]+?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  return { fmRaw: m[1], body: m[2] };
}

function peekField(fmRaw, key) {
  for (const l of fmRaw.split("\n")) {
    const m = l.match(new RegExp(`^${key}:\\s*(.*)$`));
    if (m) return m[1].replace(/^"|"$/g, "").trim();
  }
  return "";
}

function escapeYaml(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatComment(s) {
  const trimmed = String(s).trim().replace(/\r\n/g, "\n");
  const indent = "      ";
  return trimmed.split("\n").map((line) => indent + line.trimEnd()).join("\n");
}

function updateScalarField(fmRaw, key, value) {
  const lines = fmRaw.split("\n");
  const idx = lines.findIndex((l) => new RegExp(`^${key}:`).test(l));
  const formatted = typeof value === "string" ? `${key}: "${escapeYaml(value)}"` : `${key}: ${value}`;
  if (idx === -1) {
    lines.push(formatted);
  } else {
    lines[idx] = formatted;
  }
  return lines.join("\n");
}


function updateHoursBlock(fmRaw, hours) {
  if (!hours) return fmRaw;
  const lines = fmRaw.split("\n");
  const idx = lines.findIndex((l) => /^hours:\s*$/.test(l));

  const hoursLines = ["hours:"];
  for (const day of HOURS_KEYS) {
    hoursLines.push(`  ${day}: "${escapeYaml(hours[day] ?? "Closed")}"`);
  }

  if (idx === -1) {
    return [...lines, ...hoursLines].join("\n");
  }

  let end = idx + 1;
  while (end < lines.length && (lines[end].startsWith("  ") || lines[end] === "")) {
    if (lines[end] !== "" && !lines[end].match(/^\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday):/)) break;
    end++;
  }
  return [...lines.slice(0, idx), ...hoursLines, ...lines.slice(end)].join("\n");
}

function updateReviewsBlock(fmRaw, gReviews) {
  if (!gReviews?.length) return fmRaw;
  const reviews = gReviews.slice(0, 5).map((r) => ({
    name: r.authorAttribution?.displayName ?? "Google reviewer",
    rating: r.rating ?? 5,
    comment: r.text?.text ?? r.originalText?.text ?? "",
  })).filter((r) => r.comment.length > 0);
  if (!reviews.length) return fmRaw;

  const yamlLines = ["reviews:"];
  for (const r of reviews) {
    yamlLines.push(`  - name: "${escapeYaml(r.name)}"`);
    yamlLines.push(`    rating: ${r.rating}`);
    yamlLines.push(`    comment: |`);
    yamlLines.push(formatComment(r.comment));
  }
  const yaml = yamlLines.join("\n");

  const lines = fmRaw.split("\n");
  const idx = lines.findIndex((l) => /^reviews:\s*($|\[)/.test(l));
  if (idx === -1) return fmRaw.trimEnd() + "\n" + yaml;

  let end = idx + 1;
  while (end < lines.length && (lines[end].startsWith(" ") || lines[end] === "" || lines[end].startsWith("\t"))) end++;
  return [...lines.slice(0, idx), ...yaml.split("\n"), ...lines.slice(end)].join("\n");
}

async function processOne(file, hoursOnly = false) {
  const filePath = path.join(BUSINESS_DIR, file);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = parseFrontmatter(raw);
  if (!parsed) return { file, status: "no-frontmatter" };

  const slug = peekField(parsed.fmRaw, "slug") || file.replace(/\.md$/, "");
  const name = peekField(parsed.fmRaw, "name");
  const address = peekField(parsed.fmRaw, "address");

  if (ONLY && slug !== ONLY) return { slug, status: "skipped-filter" };

  const query = address && !/^edmonton$/i.test(address.trim())
    ? `${name} ${address}`
    : `${name} Edmonton`;

  let places;
  try {
    places = await textSearch(query, hoursOnly);
  } catch (e) {
    return { slug, status: "search-error", error: e.message };
  }
  if (!places.length) return { slug, status: "no-match" };

  const best = pickBestMatch(places, name);
  if (!best) return { slug, status: "no-match" };

  let fm = parsed.fmRaw;
  const changes = [];

  if (hoursOnly) {
    const hours = googleHours(best.regularOpeningHours);
    if (!hours) return { slug, status: "no-changes", matched: best.displayName?.text };
    if (!DRY) await fs.writeFile(filePath, `---\n${updateHoursBlock(fm, hours)}\n---\n${parsed.body}`);
    return { slug, status: "ok", changes: ["hours"], matched: best.displayName?.text };
  }

  const oldRating = parseFloat(peekField(fm, "rating")) || 0;
  const oldCount = parseInt(peekField(fm, "review_count")) || 0;
  const newRating = best.rating ?? oldRating;
  const newCount = best.userRatingCount ?? oldCount;

  if (newRating !== oldRating) {
    fm = updateScalarField(fm, "rating", newRating);
    changes.push(`rating ${oldRating}→${newRating}`);
  }
  if (newCount !== oldCount) {
    fm = updateScalarField(fm, "review_count", newCount);
    changes.push(`reviews ${oldCount}→${newCount}`);
  }

  const hours = googleHours(best.regularOpeningHours);
  if (hours) {
    fm = updateHoursBlock(fm, hours);
    changes.push("hours");
  }

  if (best.reviews?.length) {
    fm = updateReviewsBlock(fm, best.reviews);
    changes.push(`${Math.min(5, best.reviews.length)} reviews`);
  }

  if (!changes.length) return { slug, status: "no-changes", matched: best.displayName?.text };

  const newFile = `---\n${fm}\n---\n${parsed.body}`;
  if (!DRY) await fs.writeFile(filePath, newFile);

  return { slug, status: "ok", changes, matched: best.displayName?.text };
}

async function main() {
  const allFiles = (await fs.readdir(BUSINESS_DIR)).filter((f) => f.endsWith(".md")).sort();
  const total = allFiles.length;

  let files;
  let hoursOnlyFiles = new Set();
  if (ONLY) {
    files = allFiles;
  } else if (ALL) {
    files = allFiles;
    console.log(`Refreshing all ${total} businesses...\n`);
  } else {
    const active = [];
    for (const f of allFiles) {
      const raw = await fs.readFile(path.join(BUSINESS_DIR, f), "utf8");
      if (!/^active:\s*false/m.test(raw)) active.push(f);
    }
    const left = freeLeft("search");
    const rotation = Math.min(BATCH, active.length, Math.floor(left / daysLeftInMonth()));
    // Listings queued in refresh-priority.json (suspected wrong hours) get an hours-only
    // lookup in whatever room the daily quota has left after the rotation.
    const activeSet = new Set(active);
    const queued = (await readPriority()).filter((s) => activeSet.has(`${s}.md`));
    const first = queued.slice(0, Math.max(0, Math.min(BATCH - rotation, freeLeft("hours")))).map((s) => `${s}.md`);
    if (!rotation && !first.length) {
      console.log(`Free Google allowance used up for now (${left} full searches left this month). Skipping to stay free.`);
      return;
    }
    const usage = loadUsage();
    const start = (usage.refreshCursor ?? 0) % active.length;
    hoursOnlyFiles = new Set(first);
    files = [...first, ...[...active.slice(start), ...active.slice(0, start)].slice(0, rotation)];
    if (!DRY) {
      saveUsage({ ...loadUsage(), refreshCursor: (start + rotation) % active.length });
      await fs.writeFile(PRIORITY_FILE, JSON.stringify(queued.slice(first.length), null, 0) + "\n");
    }
    console.log(`Refreshing ${rotation} listings from #${start + 1} and checking hours for ${first.length} queued (${left} full searches left this month)\n`);
  }

  let ok = 0, noChange = 0, fail = 0;
  for (const file of files) {
    const r = await processOne(file, hoursOnlyFiles.has(file));
    if (r.status === "ok") {
      console.log(`  ✓ ${r.slug} → ${r.changes.join(", ")} (${r.matched})`);
      ok++;
    } else if (r.status === "no-changes") {
      noChange++;
    } else if (r.status === "skipped-filter") {
      /* silent */
    } else {
      console.log(`  ✗ ${r.slug || file}: ${r.status}${r.error ? " — " + r.error : ""}`);
      fail++;
    }
    await new Promise((res) => setTimeout(res, 200));
  }

  console.log(`\nDone: ${ok} updated, ${noChange} unchanged, ${fail} failed`);
  if (DRY) console.log("(dry run — no files changed)");
}

main().catch((e) => { console.error(e); process.exit(1); });
