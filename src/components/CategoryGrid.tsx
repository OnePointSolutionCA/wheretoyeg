import Link from "next/link";
import { getCategories, countByCategory } from "@/lib/content";
import { CategoryIcon } from "./CategoryIcon";

export function CategoryGrid() {
  const cats = getCategories();
  const counts = countByCategory();
  return (
    <div id="categories" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cats.map((c) => {
        const info = counts[c.slug];
        return (
          <Link
            key={c.slug}
            href={`/${c.slug}`}
            className="cat-card group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-lift"
          >
            <span className="cat-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mist text-teal transition-all duration-300 group-hover:scale-110 group-hover:bg-coral/10 group-hover:text-coral">
              <CategoryIcon name={c.icon} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display font-bold text-teal group-hover:text-coral">
                {c.name}
              </span>
              <span className="mt-0.5 block text-xs text-teal-500">
                {info?.count ? `${info.count} listing${info.count === 1 ? "" : "s"}` : "New category"}
                {info?.avg ? ` · ★ ${info.avg}` : ""}
              </span>
            </span>
            <ArrowIcon />
          </Link>
        );
      })}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-teal-300 transition group-hover:translate-x-1 group-hover:text-coral"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
