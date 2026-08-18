import Link from "next/link";
import type { Subcategory } from "@/lib/types";

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
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <div className="flex min-w-max items-center gap-2">
        <Link
          href={`/${categorySlug}`}
          className={"chip " + (!activeSlug ? "chip--active" : "")}
        >
          All
        </Link>
        {subcategories.filter((s) => (counts?.[s.slug] ?? 0) > 0 || activeSlug === s.slug).map((s) => {
          const c = counts?.[s.slug];
          const active = activeSlug === s.slug;
          return (
            <Link
              key={s.slug}
              href={`/${categorySlug}/${s.slug}`}
              className={"chip " + (active ? "chip--active" : "")}
            >
              {s.name}
              {c ? <span className={"ml-1 " + (active ? "text-white/70" : "text-teal-300")}>{c}</span> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
