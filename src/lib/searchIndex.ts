import type { SearchIndexItem } from "@/components/HeroSearch";
import { getBusinesses, getCategories } from "./content";
import { SITE } from "./site";
import { SPONSORED_LISTINGS } from "./advertisers";

import { areaSlug } from "./place";

const toSlug = areaSlug;

export function buildSearchIndex(): SearchIndexItem[] {
  const cats = getCategories();
  const catBySlug: Record<string, string> = Object.fromEntries(cats.map((c) => [c.slug, c.name]));
  return [
    ...cats.map((c) => ({ kind: "category" as const, name: c.name, href: `/${c.slug}`, hint: c.description })),
    ...cats.flatMap((c) =>
      (c.subcategories ?? []).map((s) => ({ kind: "category" as const, name: s.name, href: `/${c.slug}/${s.slug}`, hint: `${c.name} · in Edmonton` })),
    ),
    ...SITE.neighborhoods.map((n) => ({ kind: "neighborhood" as const, name: n, href: `/neighborhoods/${toSlug(n)}`, hint: "Neighborhood" })),
    ...getBusinesses().map((b) => {
      const terms = SPONSORED_LISTINGS.get(b.slug);
      const hint = `${catBySlug[b.category] ?? b.category} · ${b.neighborhood}`;
      return terms
        ? { kind: "business" as const, name: b.name, href: `/${b.category}/${b.slug}`, hint, terms }
        : { kind: "business" as const, name: b.name, href: `/${b.category}/${b.slug}`, hint };
    }),
  ];
}
