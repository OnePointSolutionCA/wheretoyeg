import { getBlogPosts, type BlogPost } from "./blog";

export const KEYWORDS: Record<string, string[]> = {
  restaurants: ["restaurant", "food", "shawarma", "pizza", "sushi", "brunch", "burger", "where-to-eat", "mexican", "thai", "korean", "chinese", "vietnamese", "italian", "ethiopian", "pakistani", "indian"],
  bakeries: ["bakeries", "bakery", "dessert"],
  "cafes-coffee-shops": ["coffee", "cafe", "boba", "bubble-tea", "dessert"],
  barbers: ["barber"],
  "hair-salons": ["hair-salon"],
  "nail-salons": ["nail"],
  "lash-techs": ["lash"],
  "spas-esthetics": ["spa", "massage"],
  "gyms-fitness": ["gym", "yoga", "climbing"],
  "auto-repair": ["auto-repair", "collision"],
  plumbers: ["plumber"],
  electricians: ["electrician"],
  "cleaning-services": ["cleaning"],
  "grocery-markets": ["grocery", "halal-meat"],
  medical: ["dentist", "eye-care", "hearing", "chiropractic", "pharmac", "walk-in", "diagnostic", "medical", "braces"],
  photographers: ["photographer"],
  "professional-services": ["law"],
  childcare: ["daycare", "childcare"],
  catering: ["catering"],
  "activities-fun": ["things-to-do", "escape", "climbing", "activities"],
};

/** Blog posts most relevant to a category, strongest slug/tag match first, then newest. */
export function relatedPosts(category: string, limit = 3, exclude?: string): BlogPost[] {
  const kws = KEYWORDS[category] ?? [category];
  return getBlogPosts()
    .filter((p) => p.slug !== exclude)
    .map((p) => ({
      p,
      score:
        kws.filter((k) => p.slug.includes(k)).length * 2 +
        kws.filter((k) => p.tags?.some((t) => t.includes(k))).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.publishedDate.localeCompare(a.p.publishedDate))
    .slice(0, limit)
    .map((x) => x.p);
}

/** Posts whose slug carries the subcategory as a whole word ("brunch" matches best-brunch-edmonton-2026, "pho" skips photographers). */
function postsForSub(sub: string): BlogPost[] {
  return getBlogPosts().filter((p) => `-${p.slug}-`.includes(`-${sub}-`));
}

let linkIndex: Map<string, BlogPost[]> | null = null;
/** Posts that link straight to a listing path like "/restaurants/salt-and-grill", built once per process. */
function postsLinkingTo(path: string): BlogPost[] {
  if (!linkIndex) {
    linkIndex = new Map();
    for (const p of getBlogPosts()) {
      for (const [, href] of p.body.matchAll(/\]\((\/[a-z0-9-]+\/[a-z0-9-]+)\)/g)) {
        const list = linkIndex.get(href) ?? [];
        if (!list.includes(p)) list.push(p);
        linkIndex.set(href, list);
      }
    }
  }
  return linkIndex.get(path) ?? [];
}

/**
 * Guides for a subcategory or listing page: posts that mention the listing first, then posts about
 * the subcategory, then the category's usual related posts.
 */
export function relatedPostsFor(category: string, opts: { sub?: string; listingPath?: string }, limit = 3): BlogPost[] {
  const out: BlogPost[] = [];
  const add = (list: BlogPost[]) => {
    for (const p of list) if (out.length < limit && !out.some((x) => x.slug === p.slug)) out.push(p);
  };
  if (opts.listingPath) add(postsLinkingTo(opts.listingPath));
  if (opts.sub) add(postsForSub(opts.sub));
  add(relatedPosts(category, limit));
  return out;
}
