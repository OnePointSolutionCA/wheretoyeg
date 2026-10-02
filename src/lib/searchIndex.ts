import type { SearchIndexItem } from "@/components/HeroSearch";
import { getBusinesses, getCategories } from "./content";
import { SITE } from "./site";

const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

export function buildSearchIndex(): SearchIndexItem[] {
  const cats = getCategories();
  const catBySlug: Record<string, string> = Object.fromEntries(cats.map((c) => [c.slug, c.name]));
  return [
    ...cats.map((c) => ({ kind: "category" as const, name: c.name, href: `/${c.slug}`, hint: c.description })),
    ...cats.flatMap((c) =>
      (c.subcategories ?? []).map((s) => ({ kind: "category" as const, name: s.name, href: `/${c.slug}/${s.slug}`, hint: `${c.name} · in Edmonton` })),
    ),
    ...SITE.neighborhoods.map((n) => ({ kind: "neighborhood" as const, name: n, href: `/neighborhoods/${toSlug(n)}`, hint: "Neighborhood" })),
    ...getBusinesses().map((b) => ({
      kind: "business" as const,
      name: b.name,
      href: `/${b.category}/${b.slug}`,
      hint: `${catBySlug[b.category] ?? b.category} · ${b.neighborhood}`,
    })),
  ];
}
