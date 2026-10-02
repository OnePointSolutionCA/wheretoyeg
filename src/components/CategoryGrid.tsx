import Link from "next/link";
import { getCategories, countByCategory } from "@/lib/content";
import { CategoryIcon } from "./CategoryIcon";

// Categories that get the big hero-photo treatment on the homepage.
// Order matters — it's the order they render.
const HERO_CATEGORY_SLUGS = [
  "restaurants",
  "cafes-coffee-shops",
  "activities-fun",
  "barbers",
  "medical",
  "nail-salons",
  "grocery-markets",
  "gyms-fitness",
];

export function CategoryGrid() {
  const allCats = getCategories();
  const counts = countByCategory();

  const heroCats = HERO_CATEGORY_SLUGS
    .map((slug) => allCats.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => !!c);

  const restCats = allCats.filter((c) => !HERO_CATEGORY_SLUGS.includes(c.slug));

  return (
    <div id="categories">
      {/* Bento: one lead tile, one tall tile, the rest fill around them */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[200px] lg:grid-cols-4">
        {heroCats.map((c, i) => {
          const info = counts[c.slug];
          const photo = `/photos/_hero/${c.slug}.jpg`;
          const lead = i === 0;
          const tall = i === 2;
          const closing = i === heroCats.length - 1 && (heroCats.length - 1) % 2 === 1;
          const placement = lead
            ? "col-span-2 aspect-[16/10] lg:row-span-2 lg:aspect-auto"
            : tall
              ? "aspect-square lg:row-span-2 lg:aspect-auto"
              : closing
                ? "col-span-2 aspect-[16/9] lg:col-span-1 lg:aspect-auto"
                : "aspect-square lg:aspect-auto";
          return (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className={"cat-hero group relative flex flex-col justify-end overflow-hidden rounded-3xl bg-teal-900 shadow-card transition-all duration-500 hover:shadow-lift " + placement}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                style={{ backgroundImage: `url(${photo})` }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
              <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition group-hover:bg-coral">
                <CategoryIcon name={c.icon} />
              </div>
              <div className={"relative z-10 text-white " + (lead ? "p-5 sm:p-7" : "p-3 sm:p-4")}>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                  {info?.count ? `${info.count} listing${info.count === 1 ? "" : "s"}` : "New category"}
                </div>
                <div className={"mt-1 font-display font-extrabold leading-tight drop-shadow-lg " + (lead ? "text-3xl sm:text-5xl" : "text-base sm:text-2xl")}>
                  {c.name}
                </div>
                {lead && <p className="mt-2 hidden max-w-md text-sm text-white/80 sm:block">{c.description}</p>}
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-coral-300 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                  Explore <span aria-hidden>→</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Compact list of remaining categories */}
      {restCats.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-teal-500">More categories</p>
          <div className="flex flex-wrap gap-2">
            {restCats.map((c) => {
              const info = counts[c.slug];
              return (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-teal transition hover:border-teal-300 hover:bg-mist hover:text-coral"
                >
                  <span>{c.name}</span>
                  {info?.count ? (
                    <span className="text-xs font-normal text-teal-300 group-hover:text-coral/70">({info.count})</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
