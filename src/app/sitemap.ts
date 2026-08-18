import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getBusinesses, getCategories } from "@/lib/content";
import { getBlogPosts } from "@/lib/blog";

function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, "-"); }

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();
  const staticRoutes = ["", "/about", "/contact", "/get-listed", "/search", "/privacy", "/terms", "/neighborhoods", "/blog"];
  const cats = getCategories().map((c) => `/${c.slug}`);
  const subs: string[] = [];
  for (const c of getCategories()) {
    for (const s of c.subcategories ?? []) subs.push(`/${c.slug}/${s.slug}`);
  }
  const biz = getBusinesses().filter((b) => b.tier === "premium").map((b) => `/${b.category}/${b.slug}`);
  const neighborhoods = SITE.neighborhoods.map((n) => `/neighborhoods/${toSlug(n)}`);
  const blog = getBlogPosts().map((p) => `/blog/${p.slug}`);
  return [...staticRoutes, ...cats, ...subs, ...biz, ...neighborhoods, ...blog].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));
}
