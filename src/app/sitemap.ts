import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getBusinesses, getCategories } from "@/lib/content";
import { getBlogPosts } from "@/lib/blog";
import { COLLECTIONS } from "@/lib/collections";

function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, "-"); }

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

  const staticRoutes = ["/about", "/contact", "/get-listed", "/privacy", "/terms", "/neighborhoods", "/blog", "/collections"];
  const cats = getCategories();
  const posts = getBlogPosts();
  const businesses = getBusinesses();
  const filled = new Set(businesses.map((b) => `${b.category}/${b.subcategory}`));

  return [
    entry("", 1),
    ...staticRoutes.map((p) => entry(p, 0.5)),
    ...cats.map((c) => entry(`/${c.slug}`, 0.9)),
    ...cats.flatMap((c) =>
      (c.subcategories ?? []).filter((s) => filled.has(`${c.slug}/${s.slug}`)).map((s) => entry(`/${c.slug}/${s.slug}`, 0.7)),
    ),
    ...businesses.map((b) => entry(`/${b.category}/${b.slug}`, 0.6, validDate(b.date_listed) ?? now)),
    ...SITE.neighborhoods.map((n) => entry(`/neighborhoods/${toSlug(n)}`, 0.7)),
    ...posts.map((p) => entry(`/blog/${p.slug}`, 0.8, validDate(p.publishedDate) ?? now)),
    ...COLLECTIONS.map((c) => entry(`/collections/${c.slug}`, 0.7)),
  ];
}
