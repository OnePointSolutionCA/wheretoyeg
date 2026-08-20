import Link from "next/link";
import { HeroSearch, type SearchIndexItem } from "@/components/HeroSearch";
import { HeroVideo } from "@/components/HeroVideo";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { ReviewCard } from "@/components/ReviewCard";
import { FloatingCube } from "@/components/FloatingCube";
import { CollectionTiles } from "@/components/CollectionTiles";
import { faqSchema, JsonLd } from "@/lib/schema-extra";
import { SITE } from "@/lib/site";
import {
  getDiverseFeatured,
  getRecentReviews,
  getCategories,
  getBusinesses,
} from "@/lib/content";
import { getBlogPosts } from "@/lib/blog";

function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, "-"); }

export default function HomePage() {
  const featured = getDiverseFeatured(12);
  const recent = getRecentReviews(4);
  const cats = getCategories();
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.name]));
  const blog = getBlogPosts().slice(0, 3);
  const activities = getBusinesses()
    .filter((b) => b.category === "activities-fun")
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.review_count ?? 0) - (a.review_count ?? 0))
    .slice(0, 6);

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
      href: `/${b.category}/${b.slug}`,
      hint: `${catBySlug[b.category] ?? b.category} · ${b.neighborhood}`,
    })),
    ...SITE.neighborhoods.map((n) => ({
      kind: "neighborhood" as const,
      name: n,
      href: `/neighborhoods/${toSlug(n)}`,
      hint: "Neighborhood",
    })),
  ];

  const faq = faqSchema([
    { q: "How do I get my Edmonton business listed on WhereToYEG?", a: "Head to /get-listed and submit the form. Plans start at $25/month and get you on the site within a few days. No contracts." },
    { q: "Is WhereToYEG free for visitors?", a: "Yes. Browsing categories, businesses, reviews, and blog guides is completely free. Business listings are what fund the site." },
    { q: "How do you pick which businesses appear?", a: "Every listing is a real Edmonton business we've verified. Ratings and reviews are pulled from Google Maps so they match what you'd see there." },
    { q: "Do you cover halal businesses?", a: "Yes — filter any category by the Halal amenity, or visit /collections/halal-foodie-tour for a curated list. We have restaurants, cafes, bakeries, meat markets, and catering." },
    { q: "Which Edmonton neighborhoods does the site cover?", a: "All of them — Downtown, Whyte Ave, 124 Street, West Edmonton, South Edmonton, North Edmonton, Sherwood Park and everywhere in between. Browse by neighborhood at /neighborhoods." },
  ]);

  return (
    <>
      <JsonLd data={faq} />
      {/* HERO */}
      <section className="relative text-white">
        <HeroVideo />
        {/* Floating 3D orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="orb absolute top-16 right-[10%] h-32 w-32 rounded-full bg-coral/20 blur-2xl sm:h-48 sm:w-48" />
          <div className="orb-2 absolute bottom-20 left-[5%] h-40 w-40 rounded-full bg-teal-300/15 blur-2xl sm:h-56 sm:w-56" />
          <div className="orb-3 absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-xl sm:h-36 sm:w-36" />
        </div>
        <div className="container-page relative py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur rise">
              <span className="glow-pulse inline-block h-1.5 w-1.5 rounded-full bg-coral" />
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
      <section id="categories" className="container-page mt-16 sm:mt-24 scroll-mt-24" data-reveal="left">
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
          <div className="mt-8">
            <FeaturedCarousel businesses={featured} categoryNames={catBySlug} />
          </div>
        </section>
      )}

      <FloatingCube />

      {/* THINGS TO DO */}
      {activities.length > 0 && (
        <section className="container-page mt-16 sm:mt-20" data-reveal="right">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">🎯 Things to do</p>
              <h2 className="section-title mt-1">Bored? Not for long.</h2>
              <p className="mt-2 max-w-xl text-teal-500">
                Climbing gyms, escape rooms, padel courts, arcades, and karting. Edmonton's rainy-day and date-night activity scene, ranked.
              </p>
            </div>
            <Link href="/activities-fun" className="hidden text-sm font-semibold text-coral hover:underline sm:block">
              All activities →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((b) => (
              <Link
                key={b.slug}
                href={`/${b.category}/${b.slug}`}
                className="activity-tile group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-teal shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                {b.photos?.[0] && (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${b.photos[0]})` }}
                    aria-hidden="true"
                  />
                )}
                {/* Dark gradient overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                <div className="relative z-10 p-5 text-white">
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                    ★ {b.rating.toFixed(1)}
                    <span className="font-normal text-white/80">({b.review_count})</span>
                  </div>
                  <div className="font-display text-2xl font-extrabold leading-tight drop-shadow-lg">{b.name}</div>
                  <div className="mt-1 text-sm text-white/85">{b.neighborhood}</div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-coral">
                    Book it <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CURATED COLLECTIONS */}
      <section className="container-page mt-16 sm:mt-20" data-reveal="left">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Perfect for…</p>
            <h2 className="section-title mt-1">Curated for the vibe.</h2>
          </div>
          <Link href="/collections" className="hidden text-sm font-semibold text-coral hover:underline sm:block">
            All collections →
          </Link>
        </div>
        <div className="mt-8">
          <CollectionTiles limit={8} />
        </div>
      </section>

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
