import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getBusinesses, getCategories } from "@/lib/content";
import { getBlogPosts } from "@/lib/blog";
import { COLLECTIONS } from "@/lib/collections";
import { HUB_INDEX, allHubs, duplicateCanonicals, hubHref, isRedundantSubHub } from "@/lib/areas";
import { areaSlug } from "@/lib/place";
import type { Business } from "@/lib/types";

const toSlug = areaSlug;

/** Subcategory pages with fewer listings than this are noindexed, so they stay out of the sitemap too. */
const SUB_MIN = 3;

/** Last real copy change on the plain static pages (about, contact, legal). Bump it when one of them changes. */
const STATIC_LASTMOD = "2026-10-04";

/**
 * A frontmatter date as "YYYY-MM-DD", or undefined when it is missing, malformed or in the future.
 * gray-matter hands back a Date for unquoted YAML dates and a string for quoted ones; both work.
 */
function day(value: unknown, today: string): string | undefined {
  const raw = value instanceof Date ? value.toISOString() : typeof value === "string" ? value.trim() : "";
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!m) return undefined;
  const d = new Date(`${m[1]}T00:00:00Z`);
  if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== m[1]) return undefined;
  return m[1] <= today ? m[1] : undefined;
}

/** Newest of a set of "YYYY-MM-DD" dates (they sort as strings); undefined when none are known. */
function newest(dates: (string | undefined)[]): string | undefined {
  let out: string | undefined;
  for (const d of dates) if (d && (!out || d > out)) out = d;
  return out;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const today = new Date().toISOString().slice(0, 10);
  // No lastmod at all beats a made-up one, so pages without a known date simply leave it out.
  const entry = (path: string, priority: number, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency: "weekly",
    priority,
  });

  const staticRoutes = ["/about", "/contact", "/get-listed", "/privacy", "/terms"];
  const cats = getCategories();
  const posts = getBlogPosts();
  const businesses = getBusinesses();
  const subCounts = new Map<string, number>();
  for (const b of businesses) subCounts.set(`${b.category}/${b.subcategory}`, (subCounts.get(`${b.category}/${b.subcategory}`) ?? 0) + 1);
  const dups = duplicateCanonicals();
  const hubs = allHubs(HUB_INDEX).filter((h) => !(h.sub && isRedundantSubHub(h.category, h.sub, h.area)));

  // A listing changes when it is added; the daily refresh does not write a date of its own.
  const listed = new Map<Business, string | undefined>(businesses.map((b) => [b, day(b.date_listed, today)]));
  const newestOf = (list: Business[]) => newest(list.map((b) => listed.get(b)));
  const allListings = newestOf(businesses);
  const postDate = (p: { publishedDate: unknown }) => day(p.publishedDate, today);
  const newestPost = newest(posts.map(postDate));

  // Hub pages take the newest date among the listings they show.
  const group = (key: (b: Business) => string | undefined) => {
    const m = new Map<string, Business[]>();
    for (const b of businesses) {
      const k = key(b);
      if (!k) continue;
      const list = m.get(k);
      if (list) list.push(b);
      else m.set(k, [b]);
    }
    return (k: string) => newestOf(m.get(k) ?? []);
  };
  const byCategory = group((b) => b.category);
  const bySub = group((b) => (b.subcategory ? `${b.category}/${b.subcategory}` : undefined));
  const byArea = group((b) => b.neighborhood);
  const byCatArea = group((b) => `${b.category}|${b.neighborhood}`);
  const bySubArea = group((b) => (b.subcategory ? `${b.category}/${b.subcategory}|${b.neighborhood}` : undefined));
  const halal = newestOf(businesses.filter((b) => b.category === "restaurants" && b.amenities?.includes("Halal")));

  return [
    entry("", 1, newest([allListings, newestPost])),
    ...staticRoutes.map((p) => entry(p, 0.5, STATIC_LASTMOD)),
    entry("/categories", 0.5, allListings),
    entry("/neighborhoods", 0.5, allListings),
    entry("/blog", 0.5, newestPost),
    entry("/collections", 0.5, allListings),
    ...cats.map((c) => entry(`/${c.slug}`, 0.9, byCategory(c.slug))),
    ...cats.flatMap((c) =>
      (c.subcategories ?? [])
        .filter((s) => (subCounts.get(`${c.slug}/${s.slug}`) ?? 0) >= SUB_MIN)
        .map((s) => entry(`/${c.slug}/${s.slug}`, 0.7, bySub(`${c.slug}/${s.slug}`))),
    ),
    entry("/halal-restaurants", 0.8, halal),
    ...hubs.map((h) =>
      entry(
        hubHref(h.category, h.area, h.sub),
        h.sub ? 0.6 : 0.7,
        h.sub ? bySubArea(`${h.category}/${h.sub}|${h.area}`) : byCatArea(`${h.category}|${h.area}`),
      ),
    ),
    ...businesses
      .filter((b) => !dups.has(b.slug))
      .map((b) => entry(`/${b.category}/${b.slug}`, 0.6, listed.get(b))),
    ...SITE.neighborhoods.map((n) => entry(`/neighborhoods/${toSlug(n)}`, 0.7, byArea(n))),
    ...posts.map((p) => entry(`/blog/${p.slug}`, 0.8, postDate(p))),
    ...COLLECTIONS.map((c) => entry(`/collections/${c.slug}`, 0.7, newestOf(businesses.filter(c.match)))),
  ];
}
