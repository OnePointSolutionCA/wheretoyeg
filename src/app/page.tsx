import Link from "next/link";
import { HeroSearch, type SearchIndexItem } from "@/components/HeroSearch";
import { HeroVideo } from "@/components/HeroVideo";
import { CategoryGrid } from "@/components/CategoryGrid";
import { BusinessCard } from "@/components/BusinessCard";
import { ReviewCard } from "@/components/ReviewCard";
import { SITE } from "@/lib/site";
import {
  getFeaturedBusinesses,
  getRecentReviews,
  getCategories,
  getBusinesses,
} from "@/lib/content";
import { getBlogPosts } from "@/lib/blog";

function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, "-"); }

export default function HomePage() {
  const featured = getFeaturedBusinesses(6);
  const recent = getRecentReviews(4);
  const cats = getCategories();
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.name]));
  const blog = getBlogPosts().slice(0, 3);

  // Build search index for the smart hero search
  const index: SearchIndexItem[] = [
    ...cats.map((c) => ({
      kind: "category" as const,
      name: c.name,
      href: `/${c.slug}`,
      hint: c.description,
    })),
    ...cats.flatMap((c) =>
      (c.subcategories ?? []).map((s) => ({
        kind: "category" as const,
        name: s.name,
        href: `/${c.slug}/${s.slug}`,
        hint: `${c.name} · in Edmonton`,
      })),
    ),
    ...getBusinesses().map((b) => ({
      kind: "business" as const,
      name: b.name,
      href: b.tier === "premium" ? `/${b.category}/${b.slug}` : `/${b.category}#${b.slug}`,
      hint: `${catBySlug[b.category] ?? b.category} · ${b.neighborhood}`,
    })),
    ...SITE.neighborhoods.map((n) => ({
      kind: "neighborhood" as const,
      name: n,
      href: `/neighborhoods/${toSlug(n)}`,
      hint: "Neighborhood",
    })),
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden text-white">
        <HeroVideo />
        <div className="container-page relative py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur rise">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-coral" />
              Edmonton · Alberta
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl rise-2">
              Find the best local <br className="hidden sm:block" />
              businesses in <span className="text-coral">Edmonton</span>.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-white/85 sm:text-lg rise-3">
              Your trusted shortcut to the shops, restaurants, and services worth checking out.
            </p>
            <div className="rise-3">
              <HeroSearch neighborhoods={SITE.neighborhoods} index={index} />
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2 rise-3">
              {SITE.popularSearches.slice(0, 6).map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/15"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page mt-16 sm:mt-24" data-reveal="left">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Browse</p>
            <h2 className="section-title mt-1">Everything Edmonton, one map.</h2>
          </div>
          <Link href="/search" className="hidden text-sm font-semibold text-coral hover:underline sm:block">
            Search everything →
          </Link>
        </div>
        <div className="mt-8">
          <CategoryGrid />
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="container-page mt-20" data-reveal="right">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Featured this week</p>
              <h2 className="section-title mt-1">Local spots worth checking out.</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((b) => (
              <BusinessCard key={b.slug} business={b} categoryName={catBySlug[b.category]} />
            ))}
          </div>
        </section>
      )}

      {/* BLOG */}
      {blog.length > 0 && (
        <section className="container-page mt-20" data-reveal="left">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">From the blog</p>
              <h2 className="section-title mt-1">Edmonton, worth reading about.</h2>
            </div>
            <Link href="/blog" className="hidden text-sm font-semibold text-coral hover:underline sm:block">
              All posts →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blog.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-card"
              >
                <div className="text-xs text-teal-500">
                  {new Date(p.publishedDate).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })} · {p.readingMinutes} min read
                </div>
                <h3 className="mt-2 font-display text-xl font-bold text-teal group-hover:text-coral">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-teal-500">{p.description}</p>
                <span className="mt-auto pt-4 text-xs font-bold uppercase tracking-wider text-coral">Read →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* RECENT REVIEWS */}
      {recent.length > 0 && (
        <section className="container-page mt-20" data-reveal="right">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Community</p>
              <h2 className="section-title mt-1">Latest reviews from Edmontonians.</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((r, i) => (
              <div key={i}>
                <ReviewCard review={r} />
                <Link
                  href={`/${r.business.category}/${r.business.slug}`}
                  className="mt-2 block text-xs font-semibold text-coral hover:underline"
                >
                  About {r.business.name} →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* NEIGHBORHOODS */}
      <section className="container-page mt-20" data-reveal="left">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Neighborhoods</p>
            <h2 className="section-title mt-1">Explore by where you are.</h2>
          </div>
          <Link href="/neighborhoods" className="hidden text-sm font-semibold text-coral hover:underline sm:block">
            All neighborhoods →
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SITE.neighborhoods.map((n) => (
            <Link
              key={n}
              href={`/neighborhoods/${toSlug(n)}`}
              className="group flex items-center justify-between rounded-2xl border border-line bg-white p-4 transition hover:border-teal-300 hover:shadow-card"
            >
              <span className="font-display font-semibold text-teal group-hover:text-coral">{n}</span>
              <span className="text-teal-300 transition group-hover:translate-x-1 group-hover:text-coral">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* GET LISTED CTA */}
      <section className="container-page mt-20 sm:mt-24" data-reveal="up">
        <div className="relative overflow-hidden rounded-3xl bg-teal p-10 text-white sm:p-14">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-coral/30 blur-3xl" />
            <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-teal-300/25 blur-3xl" />
          </div>
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-coral">For business owners</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
                Own a spot in Edmonton?<br /> Get it in front of locals.
              </h3>
              <p className="mt-3 max-w-xl text-white/80">
                Listings start at $25/month. No contracts, no dashboards to learn. We handle it — you show up.
              </p>
            </div>
            <Link href="/get-listed" className="btn-primary shrink-0 bg-white text-teal hover:bg-white/90">
              Get listed →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
