import type { Business, Category } from "./types";
import { getBlogPosts, type BlogPost } from "./blog";
import { getBusinesses, getCategories } from "./content";
import { KEYWORDS } from "./related";

const LINK = /\]\(\/([a-z0-9-]+)\/([a-z0-9-]+)\)/g;

let lookup: Map<string, Business> | null = null;
let lookupAt = 0;
function businessByPath() {
  if (!lookup || (process.env.NODE_ENV !== "production" && Date.now() - lookupAt > 30_000)) {
    lookupAt = Date.now();
    lookup = new Map(getBusinesses().map((b) => [`${b.category}/${b.slug}`, b]));
  }
  return lookup;
}

/** Active businesses linked from a post, in the order they're mentioned. */
export function postBusinesses(p: BlogPost): Business[] {
  const map = businessByPath();
  const seen = new Set<string>();
  const out: Business[] = [];
  for (const [, cat, slug] of p.body.matchAll(LINK)) {
    const key = `${cat}/${slug}`;
    const b = map.get(key);
    if (b && !seen.has(key)) {
      seen.add(key);
      out.push(b);
    }
  }
  return out;
}

/** The category a post is mostly about: keyword match on slug/tags, then linked-business majority. */
export function postCategory(p: BlogPost): Category | undefined {
  const cats = getCategories();
  const linked = postBusinesses(p).map((b) => b.category);
  let best: Category | undefined;
  let bestScore = 0;
  for (const c of cats) {
    const kws = KEYWORDS[c.slug] ?? [c.slug];
    const score =
      kws.filter((k) => p.slug.includes(k)).length * 3 +
      kws.filter((k) => p.tags?.some((t) => t.includes(k))).length +
      linked.filter((x) => x === c.slug).length;
    if (score > bestScore) {
      best = c;
      bestScore = score;
    }
  }
  return best;
}

const heroFor = (p: BlogPost) => {
  const cat = postCategory(p);
  return cat ? `/photos/_hero/${cat.slug}.jpg` : "/photos/_hero/restaurants.jpg";
};

const score = (b: Business) => {
  const v = Number(b.review_count) || 0;
  return ((Number(b.rating) || 0) * v + 4.3 * 50) / (v + 50);
};

/** Candidate cover photos for a post, best first: its own featured places, then top places in its sub-topic, then its category. */
function coverCandidates(p: BlogPost, ranked: Business[]): string[] {
  const own = postBusinesses(p).flatMap((b) => b.photos?.slice(0, 2) ?? []);
  const cat = postCategory(p);
  if (!cat) return own;
  const words = `${p.slug} ${(p.tags ?? []).join(" ")}`.toLowerCase();
  const pool = ranked.filter((b) => b.category === cat.slug);
  const topical = pool.filter((b) => b.subcategory && words.includes(b.subcategory.split("-")[0]));
  return [...own, ...topical.map((b) => b.photos[0]), ...pool.map((b) => b.photos[0])];
}

let coverCache: { at: number; map: Map<string, string> } | null = null;

/** One cover per guide, unique across the whole blog; newest guides pick first. */
function coverMap(): Map<string, string> {
  const ttl = process.env.NODE_ENV === "production" ? Infinity : 30_000;
  if (coverCache && Date.now() - coverCache.at < ttl) return coverCache.map;
  const ranked = getBusinesses()
    .filter((b) => b.photos?.length && b.rating > 0)
    .sort((a, b) => score(b) - score(a));
  const used = new Set<string>();
  const map = new Map<string, string>();
  for (const p of getBlogPosts()) {
    const pick = coverCandidates(p, ranked).find((x) => !used.has(x)) ?? heroFor(p);
    used.add(pick);
    map.set(p.slug, pick);
  }
  coverCache = { at: Date.now(), map };
  return map;
}

export function postCover(p: BlogPost): string {
  return coverMap().get(p.slug) ?? heroFor(p);
}

export function distinctCovers(posts: BlogPost[]): Map<string, string> {
  return new Map(posts.map((p) => [p.slug, postCover(p)]));
}
