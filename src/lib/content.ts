import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Business, Category, Neighborhood, Subcategory } from "./types";

const ROOT = path.join(process.cwd(), "content");

function readDir(sub: string): { slug: string; data: any; body: string }[] {
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
  return readDir("businesses")
    .map(({ data, body }) => ({ ...(data as Business), description: (data as any).description ?? body.trim() }))
    .filter((b) => b.active !== false);
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

  // First pass: one per category for diversity
  for (const b of shuffled) {
    if (usedCats.has(b.category)) continue;
    picked.push(b);
    usedCats.add(b.category);
    if (picked.length >= limit) break;
  }

  // Fill remaining slots
  if (picked.length < limit) {
    for (const b of shuffled) {
      if (picked.includes(b)) continue;
      picked.push(b);
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
