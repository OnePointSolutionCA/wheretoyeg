import Link from "next/link";
import { getCategories, countByCategory, getBusinessesByCategory } from "@/lib/content";
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
      {/* Hero photo tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {heroCats.map((c) => {
          const info = counts[c.slug];
          const businesses = getBusinessesByCategory(c.slug)
            .filter((b) => b.photos?.[0])
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.review_count ?? 0) - (a.review_count ?? 0));
          const photo = businesses[0]?.photos?.[0];

          return (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="cat-hero group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-teal-900 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:aspect-[3/4]"
            >
              {photo ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${photo})` }}
                  aria-hidden="true"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-teal to-teal-900" aria-hidden="true" />
              )}
              {/* Dark gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

              {/* Icon top-right */}
              <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm">
                <CategoryIcon name={c.icon} />
              </div>

              {/* Text bottom-left */}
              <div className="relative z-10 p-4 text-white">
                <div className="font-display text-xl font-extrabold leading-tight drop-shadow-lg sm:text-2xl">{c.name}</div>
                <div className="mt-1 text-xs font-medium text-white/85">
                  {info?.count ? `${info.count} listing${info.count === 1 ? "" : "s"}` : "New category"}
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
