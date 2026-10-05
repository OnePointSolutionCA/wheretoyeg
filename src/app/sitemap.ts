import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getBusinesses, getCategories } from "@/lib/content";
import { getBlogPosts } from "@/lib/blog";
import { COLLECTIONS } from "@/lib/collections";
import { HUB_INDEX, allHubs, duplicateCanonicals, hubHref, isRedundantSubHub } from "@/lib/areas";
import { areaSlug } from "@/lib/place";

const toSlug = areaSlug;

/** Subcategory pages with fewer listings than this are noindexed, so they stay out of the sitemap too. */
const SUB_MIN = 3;

function validDate(s?: string) {
  const d = s ? new Date(s) : null;
  return d && !isNaN(d.getTime()) ? d : undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();
  const entry = (path: string, priority: number, lastModified: Date = now): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  });

  const staticRoutes = ["/about", "/contact", "/get-listed", "/privacy", "/terms", "/categories", "/neighborhoods", "/blog", "/collections"];
  const cats = getCategories();
  const posts = getBlogPosts();
  const businesses = getBusinesses();
  const subCounts = new Map<string, number>();
  for (const b of businesses) subCounts.set(`${b.category}/${b.subcategory}`, (subCounts.get(`${b.category}/${b.subcategory}`) ?? 0) + 1);
  const dups = duplicateCanonicals();
  const hubs = allHubs(HUB_INDEX).filter((h) => !(h.sub && isRedundantSubHub(h.category, h.sub, h.area)));

  return [
    entry("", 1),
    ...staticRoutes.map((p) => entry(p, 0.5)),
    ...cats.map((c) => entry(`/${c.slug}`, 0.9)),
    ...cats.flatMap((c) =>
      (c.subcategories ?? [])
        .filter((s) => (subCounts.get(`${c.slug}/${s.slug}`) ?? 0) >= SUB_MIN)
        .map((s) => entry(`/${c.slug}/${s.slug}`, 0.7)),
    ),
    entry("/halal-restaurants", 0.8),
    ...hubs.map((h) => entry(hubHref(h.category, h.area, h.sub), h.sub ? 0.6 : 0.7)),
    ...businesses
      .filter((b) => !dups.has(b.slug))
      .map((b) => entry(`/${b.category}/${b.slug}`, 0.6, validDate(b.date_listed) ?? now)),
    ...SITE.neighborhoods.map((n) => entry(`/neighborhoods/${toSlug(n)}`, 0.7)),
    ...posts.map((p) => entry(`/blog/${p.slug}`, 0.8, validDate(p.publishedDate) ?? now)),
    ...COLLECTIONS.map((c) => entry(`/collections/${c.slug}`, 0.7)),
  ];
}
