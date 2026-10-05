import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { getBusinesses, getCategories } from "@/lib/content";
import { breadcrumbSchema, JsonLd } from "@/lib/schema-extra";
import { CategoryIcon } from "@/components/CategoryIcon";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All categories and services in Edmonton",
  description:
    "Every category on WhereToYEG in one place: restaurants, auto repair and body shops, medical, professional services, salons, gyms and more across Edmonton.",
  alternates: { canonical: `${SITE.url}/categories` },
};

export default function CategoriesPage() {
  const cats = getCategories();
  const businesses = getBusinesses();
  const total = businesses.length;
  const byCat: Record<string, number> = {};
  const bySub: Record<string, number> = {};
  for (const b of businesses) {
    byCat[b.category] = (byCat[b.category] ?? 0) + 1;
    if (b.subcategory) bySub[`${b.category}/${b.subcategory}`] = (bySub[`${b.category}/${b.subcategory}`] ?? 0) + 1;
  }

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "All categories" }])} />
      <section className="border-b border-line bg-gradient-to-b from-mist to-white">
        <div className="container-page py-12 sm:py-16">
          <nav className="text-xs text-teal-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-coral">Home</Link> <span className="px-1">›</span>
            <span className="font-semibold text-teal">All categories</span>
          </nav>
          <p className="eyebrow mt-4">Browse</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-6xl">
            Every category, every service.
          </h1>
          <p className="mt-4 max-w-2xl text-teal-500 sm:text-lg">
            {total.toLocaleString("en-CA")} local businesses across {cats.length} categories. Pick a category, or jump straight to the service you need.
          </p>
        </div>
      </section>

      {/* Quick jump */}
      <nav
        className="sticky top-[6.5rem] z-30 border-b border-line bg-white/90 backdrop-blur lg:top-20"
        aria-label="Jump to a category"
      >
        <div className="container-page flex gap-2 overflow-x-auto py-3" style={{ scrollbarWidth: "none" }}>
          {cats.map((c) => (
            <a key={c.slug} href={`#${c.slug}`} className="chip shrink-0">
              {c.name}
            </a>
          ))}
        </div>
      </nav>

      <section className="container-page py-10 sm:py-12">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          {cats.map((c) => {
            const subs = (c.subcategories ?? [])
              .map((s) => ({ ...s, count: bySub[`${c.slug}/${s.slug}`] ?? 0 }))
              .filter((s) => s.count > 0)
              .sort((a, b) => b.count - a.count);
            const count = byCat[c.slug] ?? 0;
            return (
              <article
                key={c.slug}
                id={c.slug}
                className="scroll-mt-44 overflow-hidden rounded-3xl border border-line bg-white shadow-card lg:scroll-mt-40"
              >
                <Link href={`/${c.slug}`} className="group relative flex h-32 items-end overflow-hidden bg-teal-900 sm:h-36">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url(/photos/_hero/${c.slug}.jpg)` }}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                  <div className="relative z-10 flex w-full items-end justify-between gap-3 p-4 text-white sm:p-5">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                        {count.toLocaleString("en-CA")} listing{count === 1 ? "" : "s"}
                      </div>
                      <h2 className="mt-0.5 font-display text-2xl font-extrabold leading-tight drop-shadow-lg sm:text-3xl">{c.name}</h2>
                    </div>
                    <span className="flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-wider text-coral-300">
                      <span className="hidden sm:inline">See all</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition group-hover:bg-coral">
                        <CategoryIcon name={c.icon} />
                      </span>
                    </span>
                  </div>
                </Link>
                {subs.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 sm:p-5">
                    {subs.map((s) => (
                      <Link key={s.slug} href={`/${c.slug}/${s.slug}`} className="chip min-h-[36px]">
                        {s.name} <span className="text-teal-300">{s.count}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
