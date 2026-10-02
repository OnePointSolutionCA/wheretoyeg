import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Business, Category, Neighborhood, Subcategory } from "./types";
import { placeLabel } from "./place";

const ROOT = path.join(process.cwd(), "content");

// Content is static per build, so production reuses parsed files instead of re-reading 1,700+ markdown files per call.
const CACHE = process.env.NODE_ENV === "production";
const dirCache = new Map<string, { slug: string; data: any; body: string }[]>();
let businessCache: Business[] | null = null;

function readDir(sub: string): { slug: string; data: any; body: string }[] {
  if (CACHE && dirCache.has(sub)) return dirCache.get(sub)!;
  const rows = readDirUncached(sub);
  if (CACHE) dirCache.set(sub, rows);
  return rows;
}

function readDirUncached(sub: string): { slug: string; data: any; body: string }[] {
  const dir = path.join(ROOT, sub);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const parsed = matter(raw);
      const slug = (parsed.data.slug as string) || file.replace(/\.md$/, "");
      return { slug, data: parsed.data, body: parsed.content };
    });
}

export function getCategories(): Category[] {
  return readDir("categories")
    .map(({ data, body }) => ({ ...(data as Category), intro: body.trim() || (data as any).intro }))
    .filter((c) => c.active !== false)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getCategories().find((c) => c.slug === slug);
}

export function getSubcategory(categorySlug: string, subSlug: string): Subcategory | undefined {
  return getCategoryBySlug(categorySlug)?.subcategories?.find((s) => s.slug === subSlug);
}

export function getBusinesses(): Business[] {
  if (CACHE && businessCache) return [...businessCache];
  const cats = new Map(getCategories().map((c) => [c.slug, c]));
  const list = readDir("businesses")
    .map(({ data, body }) => {
      const b: Business = { ...(data as Business), description: (data as any).description ?? body.trim() };
      if (Array.isArray(b.amenities)) b.amenities = Array.from(new Set(b.amenities));
      if (isAutoDescription(b.description)) {
        b.description = describeBusiness(b, cats.get(b.category));
        b.generatedDescription = true;
      }
      return b;
    })
    .filter((b) => b.active !== false);
  if (CACHE) businessCache = list;
  return [...list];
}

// Matches importer one-liners like "X — pastry in Edmonton, Edmonton. 1387 Google reviews, 4.7★."
const AUTO_DESC = /^.{1,120} — .{1,80} in .{1,60}\.( Halal-certified\.)?( [\d,]+ Google reviews, [\d.]+★\.?)?$/;

function isAutoDescription(d?: string) {
  return !d || AUTO_DESC.test(d.trim());
}

const CATEGORY_NOUN: Record<string, string> = {
  restaurants: "restaurant",
  bakeries: "bakery",
  "cafes-coffee-shops": "café",
  barbers: "barbershop",
  "hair-salons": "hair salon",
  "nail-salons": "nail salon",
  "lash-techs": "lash and brow studio",
  "spas-esthetics": "spa and esthetics studio",
  "gyms-fitness": "gym and fitness studio",
  "auto-repair": "auto repair shop",
  plumbers: "home services company",
  electricians: "electrical and HVAC contractor",
  "cleaning-services": "cleaning service",
  "grocery-markets": "grocery store",
  medical: "health clinic",
  photographers: "photography studio",
  "professional-services": "professional services firm",
  catering: "catering company",
  "activities-fun": "activity spot",
};

const WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

function listJoin(items: string[]) {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function describeHours(hours?: Business["hours"]) {
  if (!hours || WEEK.some((d) => !hours[d])) return "";
  const closed = WEEK.filter((d) => /closed/i.test(hours[d]));
  if (closed.length === 0) return "Open 7 days a week.";
  if (closed.length > 3) return "";
  return `Closed ${listJoin(closed.map((d) => d[0].toUpperCase() + d.slice(1)))}.`;
}

function describeBusiness(b: Business, cat?: Category) {
  const sub = cat?.subcategories?.find((s) => s.slug === b.subcategory)?.name;
  const noun = CATEGORY_NOUN[b.category] ?? "local business";
  const article = /^[aeiou]/i.test(noun) ? "an" : "a";
  const parts = [`${b.name} is ${article} ${noun} in ${placeLabel(b.neighborhood)}${sub ? `, listed on WhereToYEG under ${sub}` : ""}.`];
  const rating = Number(b.rating);
  const reviews = Number(b.review_count);
  if (rating > 0 && reviews > 0) {
    parts.push(`It holds a ${rating.toFixed(1)}-star rating from ${reviews.toLocaleString("en-CA")} Google review${reviews === 1 ? "" : "s"}.`);
  }
  if (/halal-certified/i.test(b.description ?? "")) parts.push("Halal-certified.");
  else if (b.amenities?.includes("Halal")) parts.push("Marked halal.");
  const highlights = (b.amenities ?? []).filter((a) => a !== "Halal");
  if (highlights.length) parts.push(`Highlights: ${highlights.slice(0, 5).join(", ")}.`);
  const hours = describeHours(b.hours);
  if (hours) parts.push(hours);
  if (b.address) parts.push(`Find it at ${b.address}.`);
  return parts.join(" ");
}

export function getBusiness(slug: string): Business | undefined {
  return getBusinesses().find((b) => b.slug === slug);
}

export function getBusinessesByCategory(categorySlug: string): Business[] {
  return getBusinesses()
    .filter((b) => b.category === categorySlug)
    .sort(rankBusinesses);
}

export function getBusinessesBySubcategory(categorySlug: string, subSlug: string): Business[] {
  return getBusinesses()
    .filter((b) => b.category === categorySlug && b.subcategory === subSlug)
    .sort(rankBusinesses);
}

export function getBusinessesByNeighborhood(nSlug: string): Business[] {
  return getBusinesses().filter(
    (b) => b.neighborhood?.toLowerCase().replace(/\s+/g, "-") === nSlug,
  );
}

export function getFeaturedBusinesses(limit = 8): Business[] {
  return getBusinesses()
    .filter((b) => b.tier !== "basic")
    .sort(rankBusinesses)
    .slice(0, limit);
}

export function getDiverseFeatured(limit = 12): Business[] {
  const day = Math.floor(Date.now() / 86_400_000);
  const seed = day;

  const all = getBusinesses()
    .filter((b) => b.tier !== "basic" && b.rating > 0);

  // Seeded shuffle so the order changes daily but stays stable within one day
  function seededShuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    let s = seed;
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const shuffled = seededShuffle(all);
  const picked: Business[] = [];
  const usedCats = new Set<string>();
  const usedSlugs = new Set<string>();

  // Premium businesses always appear first
  for (const b of shuffled) {
    if (b.tier !== "premium") continue;
    picked.push(b);
    usedSlugs.add(b.slug);
    usedCats.add(b.category);
    if (picked.length >= limit) break;
  }

  // Fill one per category for diversity
  if (picked.length < limit) {
    for (const b of shuffled) {
      if (usedSlugs.has(b.slug) || usedCats.has(b.category)) continue;
      picked.push(b);
      usedSlugs.add(b.slug);
      usedCats.add(b.category);
      if (picked.length >= limit) break;
    }
  }

  // Fill remaining slots
  if (picked.length < limit) {
    for (const b of shuffled) {
      if (usedSlugs.has(b.slug)) continue;
      picked.push(b);
      usedSlugs.add(b.slug);
      if (picked.length >= limit) break;
    }
  }

  return picked;
}

export function getRecentReviews(limit = 4) {
  const day = Math.floor(Date.now() / 86_400_000);
  let s = day;
  const perBusiness = getBusinesses()
    .flatMap((b) => {
      const reviews = (b.reviews ?? [])
        .filter((r) => (r.comment ?? "").length > 40);
      return reviews[0] ? [{ ...reviews[0], business: b }] : [];
    })
    .filter((r) => (r.rating ?? 0) >= 4);

  // Seeded shuffle for daily rotation
  const arr = [...perBusiness];
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  const picked: typeof perBusiness = [];
  const seenCats = new Set<string>();
  for (const r of arr) {
    if (seenCats.has(r.business.category)) continue;
    picked.push(r);
    seenCats.add(r.business.category);
    if (picked.length >= limit) break;
  }
  if (picked.length < limit) {
    for (const r of arr) {
      if (picked.includes(r)) continue;
      picked.push(r);
      if (picked.length >= limit) break;
    }
  }
  return picked;
}

export function getNeighborhoods(): Neighborhood[] {
  return readDir("neighborhoods").map(({ data }) => data as Neighborhood);
}

export function getNeighborhood(slug: string) {
  return getNeighborhoods().find((n) => n.slug === slug);
}

export function countByCategory() {
  const businesses = getBusinesses();
  const counts: Record<string, { count: number; avg: number }> = {};
  for (const b of businesses) {
    counts[b.category] ??= { count: 0, avg: 0 };
    counts[b.category].count++;
    counts[b.category].avg += b.rating || 0;
  }
  for (const k in counts) {
    counts[k].avg = counts[k].count ? +(counts[k].avg / counts[k].count).toFixed(1) : 0;
  }
  return counts;
}

export function countBySubcategory(categorySlug: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const b of getBusinesses()) {
    if (b.category !== categorySlug || !b.subcategory) continue;
    counts[b.subcategory] = (counts[b.subcategory] ?? 0) + 1;
  }
  return counts;
}

function tierRank(t: string) {
  return t === "premium" ? 0 : t === "featured" ? 1 : 2;
}
function rankBusinesses(a: Business, b: Business) {
  const t = tierRank(a.tier) - tierRank(b.tier);
  if (t !== 0) return t;
  return (b.rating ?? 0) - (a.rating ?? 0);
}
