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
  const all = getBusinesses()
    .filter((b) => b.tier !== "basic" && b.rating > 0)
    .sort(rankBusinesses);
  const picked: Business[] = [];
  const usedCats = new Set<string>();
  for (const b of all) {
    if (!usedCats.has(b.category)) {
      picked.push(b);
      usedCats.add(b.category);
    }
    if (picked.length >= limit) break;
  }
  if (picked.length < limit) {
    for (const b of all) {
      if (!picked.includes(b)) {
        picked.push(b);
        if (picked.length >= limit) break;
      }
    }
  }
  return picked;
}

export function getRecentReviews(limit = 4) {
  // For each business, take its single most recent review — this way one
  // business can't dominate the whole "latest reviews" strip.
  const perBusiness = getBusinesses()
    .flatMap((b) => {
      const reviews = (b.reviews ?? [])
        .filter((r) => (r.comment ?? "").length > 40)
        .sort((a, b) => b.date.localeCompare(a.date));
      return reviews[0] ? [{ ...reviews[0], business: b }] : [];
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  // Prefer a variety of categories in the first N picks
  const picked: typeof perBusiness = [];
  const seenCats = new Set<string>();
  for (const r of perBusiness) {
    if (seenCats.has(r.business.category)) continue;
    picked.push(r);
    seenCats.add(r.business.category);
    if (picked.length >= limit) break;
  }
  if (picked.length < limit) {
    for (const r of perBusiness) {
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
