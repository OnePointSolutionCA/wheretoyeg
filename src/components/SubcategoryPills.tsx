import type { Subcategory } from "@/lib/types";
import { ChipGroup } from "./ChipGroup";

export function SubcategoryPills({
  categorySlug,
  subcategories,
  activeSlug,
  counts,
}: {
  categorySlug: string;
  subcategories: Subcategory[];
  activeSlug?: string;
  counts?: Record<string, number>;
}) {
  if (!subcategories?.length) return null;
  // Biggest groups first, so the chips shown before "+N more" are the useful ones.
  const subs = subcategories
    .map((s, i) => ({ s, i, n: counts?.[s.slug] ?? 0 }))
    .filter(({ s, n }) => n > 0 || activeSlug === s.slug)
    .sort((a, b) => b.n - a.n || a.i - b.i);
  return (
    <ChipGroup
      label={categorySlug === "restaurants" ? "By cuisine" : "By type"}
      chips={[
        { href: `/${categorySlug}`, label: "All", active: !activeSlug },
        ...subs.map(({ s, n }) => ({
          href: `/${categorySlug}/${s.slug}`,
          label: s.name,
          count: n || undefined,
          active: activeSlug === s.slug,
        })),
      ]}
    />
  );
}
