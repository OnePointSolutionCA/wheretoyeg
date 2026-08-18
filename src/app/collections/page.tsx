import type { Metadata } from "next";
import Link from "next/link";
import { COLLECTIONS } from "@/lib/collections";
import { getBusinesses } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Curated Collections — Edmonton Spots for Every Vibe | WhereToYEG",
  description: "Late-night eats, weekend brunch, date night, halal foodie tour, self-care Saturdays, hidden gems — the WhereToYEG curated collections.",
  alternates: { canonical: `${SITE.url}/collections` },
};

export default function CollectionsIndexPage() {
  const all = getBusinesses();

  return (
    <>
      <section className="border-b border-line bg-mist">
        <div className="container-page py-12">
          <nav className="text-xs text-teal-500">
            <Link href="/" className="hover:text-coral">Home</Link> <span className="px-1">›</span>{" "}
            <span className="font-semibold text-teal">Collections</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
            Perfect for<span className="text-coral">…</span>
          </h1>
          <p className="mt-3 max-w-2xl text-teal-500">
            Curated groups of Edmonton spots for a specific vibe or moment. Late-night eats, weekend brunch, self-care Saturdays — the way locals actually plan a day.
          </p>
        </div>
      </section>

      <section className="container-page mt-10 mb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS
            .map((c) => ({ c, count: all.filter(c.match).length }))
            .filter((t) => t.count > 0)
            .map(({ c, count }) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className={
                  "collection-tile group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lift " +
                  c.gradient
                }
              >
                <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-transform duration-500 group-hover:scale-125" />
                <div className="pointer-events-none absolute -bottom-10 -left-6 h-52 w-52 rounded-full bg-white/8 blur-3xl transition-transform duration-500 group-hover:scale-110" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "20px 20px",
                  }}
                  aria-hidden="true"
                />

                <div className="relative z-10 flex items-start justify-between">
                  <span className="text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">{c.emoji}</span>
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                    {count} {count === 1 ? "spot" : "spots"}
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">{c.title}</div>
                  <div className="mt-1 text-sm font-medium text-white/85">{c.headline}</div>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white/95">
                    Explore <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}
