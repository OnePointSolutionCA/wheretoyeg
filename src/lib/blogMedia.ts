import type { Business, Category } from "./types";
import type { BlogPost } from "./blog";
import { getBusinesses, getCategories } from "./content";
import { KEYWORDS } from "./related";

const LINK = /\]\(\/([a-z0-9-]+)\/([a-z0-9-]+)\)/g;

let lookup: Map<string, Business> | null = null;
function businessByPath() {
  if (!lookup || process.env.NODE_ENV !== "production") {
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

/** Cover image: first featured business photo not in `exclude`, else the category hero. */
export function postCover(p: BlogPost, exclude?: Set<string>): string {
  const photos = postBusinesses(p).flatMap((b) => b.photos?.slice(0, 2) ?? []);
  const photo = photos.find((x) => !exclude?.has(x)) ?? (exclude ? undefined : photos[0]);
  if (photo) return photo;
  const cat = postCategory(p);
  return cat ? `/photos/_hero/${cat.slug}.jpg` : "/photos/_hero/restaurants.jpg";
}

/** Covers for a list of posts, avoiding repeats where another photo is available. */
export function distinctCovers(posts: BlogPost[]): Map<string, string> {
  const used = new Set<string>();
  const out = new Map<string, string>();
  for (const p of posts) {
    const c = postCover(p, used);
    used.add(c);
    out.set(p.slug, c);
  }
  return out;
}
