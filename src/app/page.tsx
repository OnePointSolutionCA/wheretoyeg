import Image from "next/image";
import Link from "next/link";
import { neighborhoodStats } from "@/lib/neighborhoods";
import { AreaTile } from "@/components/AreaTile";
import { HeroSearch } from "@/components/HeroSearch";
import { HeroVideo } from "@/components/HeroVideo";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { HomeIntro } from "@/components/HomeIntro";
import { FaqSection, type FaqEntry } from "@/components/FaqSection";
import { postCategory, postCover } from "@/lib/blogMedia";
import { COLLECTIONS, getBusinessesForCollection } from "@/lib/collections";
import { Carousel } from "@/components/Carousel";
import { Marquee } from "@/components/home/Marquee";
import { SectionHead } from "@/components/home/SectionHead";
import { SITE } from "@/lib/site";
import { dailyShuffle } from "@/lib/daily";
import { toCard } from "@/lib/slim";
import {
  getDiverseFeatured,
  getRecentReviews,
  getCategories,
  getBusinesses,
} from "@/lib/content";
import { getBlogPosts } from "@/lib/blog";
import type { Metadata } from "next";

function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, "-"); }

// Short window so the daily rotation flips within minutes of Edmonton midnight.
export const revalidate = 600;

export const metadata: Metadata = {
  alternates: { canonical: `${SITE.url}/` },
};

export default function HomePage() {
  const featured = getDiverseFeatured(20);
  const recent = getRecentReviews(8);
  const cats = getCategories();
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.name]));
  const allPosts = getBlogPosts();
  const guideCount = allPosts.length;
  const allBusinesses = getBusinesses();
  const totalBusinesses = allBusinesses.length;
  const areaTiles = SITE.neighborhoods.map((n) => ({ name: n, ...neighborhoodStats(n, allBusinesses) }));
  const FEATURED_AREAS = ["Downtown", "Whyte Ave", "West Edmonton", "124 Street", "Sherwood Park", "St. Albert", "Mill Woods", "Windermere", "Spruce Grove", "Beaumont"];
  const featuredAreas = FEATURED_AREAS.map((n) => areaTiles.find((a) => a.name === n)).filter((a): a is (typeof areaTiles)[number] => !!a);
  const otherAreas = areaTiles.filter((a) => !FEATURED_AREAS.includes(a.name));
  const score = (b: (typeof allBusinesses)[number]) => {
    const v = Number(b.review_count) || 0;
    return ((Number(b.rating) || 0) * v + 4.3 * 60) / (v + 60);
  };
  const ranked = allBusinesses.filter((b) => b.photos?.length && b.rating > 0).sort((a, b) => score(b) - score(a));
  const brandOf = (b: (typeof ranked)[number]) => b.name.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).slice(0, 2).join(" ");
  /** Picks n from a pool, at most `perCategory` per category and one per brand (chains share review counts). */
  const pickVaried = (pool: typeof ranked, n: number, perCategory: number, exclude = new Set<string>()) => {
    const out: typeof ranked = [];
    const perCat = new Map<string, number>();
    const brands = new Set<string>();
    for (const b of pool) {
      const c = perCat.get(b.category) ?? 0;
      if (c >= perCategory || brands.has(brandOf(b)) || exclude.has(b.slug)) continue;
      perCat.set(b.category, c + 1);
      brands.add(brandOf(b));
      out.push(b);
      if (out.length >= n) break;
    }
    return out;
  };

  // Rotating spots draw a fresh set every Edmonton day from the best-reviewed places, so quality stays high.
  const TOP_CATS = ["restaurants", "cafes-coffee-shops", "bakeries", "activities-fun", "barbers", "spas-esthetics", "grocery-markets", "hair-salons"];
  const topPool = ranked.filter((b) => TOP_CATS.includes(b.category) && b.review_count >= 100 && b.rating >= 4.5).slice(0, 40);
  const topFive = pickVaried(dailyShuffle(topPool, 1), 5, 1).sort((a, b) => score(b) - score(a));
  const topSlugs = new Set(topFive.map((b) => b.slug));

  const activityPool = ranked.filter((b) => b.category === "activities-fun" && b.review_count >= 30 && b.rating >= 4.3).slice(0, 24);
  const mosaic: typeof ranked = [];
  const seenSubs = new Set<string>();
  for (const b of dailyShuffle(activityPool, 2)) {
    const sub = b.subcategory ?? "other";
    if (seenSubs.has(sub) || topSlugs.has(b.slug)) continue;
    seenSubs.add(sub);
    mosaic.push(b);
    if (mosaic.length >= 5) break;
  }
  if (mosaic.length < 5) mosaic.push(...pickVaried(activityPool, 5 - mosaic.length, 9, new Set([...topSlugs, ...mosaic.map((b) => b.slug)])));

  const [leadPost, ...morePosts] = allPosts;
  const leadCover = leadPost ? postCover(leadPost) : "";
  const leadCat = leadPost ? postCategory(leadPost) : undefined;

  const halal = allBusinesses.filter((b) => b.amenities?.includes("Halal"));
  const halalByCat = ["restaurants", "grocery-markets", "catering", "bakeries", "cafes-coffee-shops"]
    .map((slug) => ({ slug, name: catBySlug[slug], count: halal.filter((b) => b.category === slug).length }))
    .filter((x) => x.count > 0);
  const halalPool = ranked.filter((b) => b.amenities?.includes("Halal") && b.review_count >= 100 && b.rating >= 4.5).slice(0, 24);
  const halalPicks = pickVaried(dailyShuffle(halalPool, 3), 4, 2, topSlugs);

  const usedCovers = new Set<string>();
  const collections = COLLECTIONS.map((c) => {
    const list = getBusinessesForCollection(c, allBusinesses);
    const cover = list.find((b) => b.photos?.length && !usedCovers.has(b.photos[0]))?.photos[0] ?? list.find((b) => b.photos?.length)?.photos[0];
    if (cover) usedCovers.add(cover);
    return { ...c, count: list.length, cover };
  }).filter((c) => c.count > 0);

  const ticker = [
    { label: "Shawarma", href: "/restaurants/shawarma" },
    { label: "Skin fades", href: "/barbers" },
    { label: "Pho", href: "/restaurants/vietnamese" },
    { label: "Karahi", href: "/restaurants/pakistani" },
    { label: "Lash lifts", href: "/lash-techs" },
    { label: "Dim sum", href: "/restaurants/chinese" },
    { label: "Escape rooms", href: "/activities-fun" },
    { label: "Biryani", href: "/restaurants/indian" },
    { label: "Boba", href: "/cafes-coffee-shops" },
    { label: "Halal butchers", href: "/grocery-markets?amenity=Halal" },
    { label: "Weekend brunch", href: "/collections/brunch-spots" },
    { label: "Climbing gyms", href: "/blog/best-climbing-gyms-edmonton-2026" },
  ];

  const faq: FaqEntry[] = [
    { q: "How do I get my Edmonton business listed on WhereToYEG?", a: "Submit the Get Listed form. Listings are completely free, and most go live within a few days.", links: [{ label: "Get listed", href: "/get-listed" }] },
    { q: "Is WhereToYEG free?", a: "Yes. Browsing and listing are both free. We're building the most complete Edmonton business directory, and the more businesses on it, the more useful it is." },
    { q: "How do you pick which businesses appear?", a: "Every listing is a real Edmonton-area business. Ratings and review counts come from Google Maps, so they match what you'd see there." },
    { q: "Do you cover halal businesses?", a: "Yes. Filter any category by the Halal amenity, or start with the curated halal collection. We list halal restaurants, cafés, bakeries, meat markets, and caterers.", links: [{ label: "Halal restaurants", href: "/restaurants?amenity=Halal" }, { label: "Halal foodie tour", href: "/collections/halal-foodie-tour" }] },
    { q: "Which Edmonton neighborhoods does the site cover?", a: `All of Edmonton plus nearby communities, including ${SITE.neighborhoods.slice(0, 6).join(", ")}, Sherwood Park, St. Albert, and Spruce Grove.`, links: [{ label: "Browse neighborhoods", href: "/neighborhoods" }] },
  ];

  return (
    <>
      <HomeIntro />
      {/* HERO */}
      <section className="hero relative text-white">
        <HeroVideo />
        {/* Floating 3D orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="orb absolute top-16 right-[10%] h-32 w-32 rounded-full bg-coral/20 blur-2xl sm:h-48 sm:w-48" />
          <div className="orb-2 absolute bottom-20 left-[5%] h-40 w-40 rounded-full bg-teal-300/15 blur-2xl sm:h-56 sm:w-56" />
          <div className="orb-3 absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-xl sm:h-36 sm:w-36" />
        </div>
        <div className="container-page relative py-24 sm:py-32">
          <div className="hero-copy mx-auto max-w-3xl text-center">
            <span className="hero-eyebrow inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur rise">
              <span className="glow-pulse inline-block h-1.5 w-1.5 rounded-full bg-coral" />
              Edmonton · Alberta
            </span>
            <h1 className="hero-h1 mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl rise-2">
              Find the best local <br className="hidden sm:block" />
              businesses in <span className="text-coral">Edmonton</span>.
            </h1>
            <p className="hero-sub mx-auto mt-4 max-w-xl text-white/85 sm:text-lg rise-3">
              Your trusted shortcut to the shops, restaurants, and services worth checking out.
            </p>
            <div className="hero-foot rise-3">
              <HeroSearch neighborhoods={SITE.neighborhoods} />
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Popular:</span>
                {SITE.popularSearches.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/20"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
            <dl className="hero-foot rise-3 mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-y-4 border-t border-white/15 pt-6 sm:grid-cols-4">
              {[
                [totalBusinesses.toLocaleString("en-CA"), "local businesses"],
                [String(cats.length), "categories"],
                [String(guideCount), "local guides"],
                [String(SITE.neighborhoods.length), "neighborhoods"],
              ].map(([n, l]) => (
                <div key={l} className="text-center">
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-2xl font-extrabold sm:text-3xl">{n}</dd>
                  <dd className="text-xs font-semibold uppercase tracking-wider text-white/65">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <Marquee items={ticker} />

      {/* 01 CATEGORIES */}
      <section id="categories" className="container-page mt-16 scroll-mt-24 sm:mt-24" data-reveal="up">
        <SectionHead index="01" kicker="Browse" title="Everything Edmonton," accent="one map." href="/search" linkLabel="Search everything" />
        <div className="mt-10">
          <CategoryGrid />
        </div>
      </section>

      {/* 02 THIS WEEK */}
      {leadPost && (
        <section className="container-page mt-24 sm:mt-32" data-reveal="up">
          <SectionHead index="02" kicker="This week" title="What Edmonton is" accent="reading & rating." href="/blog" linkLabel={`All ${guideCount} guides`} />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
            <Link href={`/blog/${leadPost.slug}`} className="group relative flex min-h-[420px] min-w-0 flex-col justify-end overflow-hidden rounded-3xl bg-teal text-white shadow-card sm:min-h-[520px]">
              <Image src={leadCover} alt="" fill sizes="(max-width: 1024px) 100vw, 700px" className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/0" aria-hidden="true" />
              <div className="relative p-6 sm:p-10">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]">
                  <span className="rounded-full bg-coral px-2.5 py-1 text-white">Latest guide</span>
                  {leadCat && <span className="text-white/75">{leadCat.name}</span>}
                </div>
                <h3 className="mt-4 max-w-xl font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">{leadPost.title}</h3>
                <p className="mt-3 max-w-lg text-white/80">{leadPost.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">
                  Read the guide <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                  <span className="font-normal text-white/60">· {leadPost.readingMinutes} min</span>
                </span>
              </div>
            </Link>

            <div className="flex min-w-0 flex-col rounded-3xl border border-line bg-white p-5 shadow-card sm:p-8">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-xl font-extrabold text-teal">Today&apos;s top rated</h3>
                <span className="text-xs font-semibold text-teal-300">New picks daily</span>
              </div>
              <ol className="mt-4 flex-1 divide-y divide-line">
                {topFive.map((b, i) => (
                  <li key={b.slug}>
                    <Link href={`/${b.category}/${b.slug}`} className="group flex items-center gap-4 py-3.5">
                      <span className="w-8 shrink-0 font-editorial text-4xl font-medium italic leading-none text-coral">{i + 1}</span>
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mist">
                        <Image src={b.photos[0]} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-teal transition group-hover:text-coral">{b.name}</span>
                        <span className="block truncate text-xs text-teal-300">{catBySlug[b.category]} · {b.neighborhood}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm font-bold text-teal">★ {Number(b.rating).toFixed(1)}</span>
                        <span className="block text-[11px] text-teal-300">{Number(b.review_count).toLocaleString("en-CA")}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              {morePosts.length > 0 && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-300">Also new on the blog</p>
                  <ul className="mt-2 space-y-1.5">
                    {morePosts.slice(0, 2).map((p) => (
                      <li key={p.slug}>
                        <Link href={`/blog/${p.slug}`} className="group flex items-start gap-2 text-sm font-semibold leading-snug text-teal hover:text-coral">
                          <span aria-hidden className="mt-0.5 text-coral">→</span>
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 03 FEATURED */}
      {featured.length > 0 && (
        <section className="mt-24 bg-mist py-16 sm:mt-32 sm:py-24" data-reveal="up">
          <div className="container-page">
            <SectionHead index="03" kicker="Featured" title="Local spots" accent="worth the drive." intro="Hand-picked businesses from across the city, refreshed every week." />
            <div className="mt-10">
              <FeaturedCarousel businesses={featured.map(toCard)} categoryNames={catBySlug} />
            </div>
          </div>
        </section>
      )}

      {/* 04 HALAL */}
      {halal.length > 0 && (
        <section className="grain relative overflow-hidden bg-gradient-to-br from-[#2a1410] via-[#5a2316] to-teal-900 py-16 text-white sm:py-24" data-reveal="up">
          <div className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-coral/25 blur-3xl" aria-hidden="true" />
          <div className="container-page relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
            <div>
              <SectionHead index="04" kicker="Halal spotlight" title="Halal," accent="done right." tone="dark" />
              <p className="mt-5 max-w-md text-lg text-white/80">
                Edmonton has one of the best halal food scenes in Canada. {halal.length} listings are marked halal on WhereToYEG, from karahi houses to butcher counters.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {halalByCat.map((h) => (
                  <Link key={h.slug} href={`/${h.slug}?amenity=Halal`} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white hover:text-teal">
                    {h.name} <span className="text-white/60">{h.count}</span>
                  </Link>
                ))}
              </div>
              <Link href="/collections/halal-foodie-tour" className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-coral px-6 text-sm font-bold text-white shadow-lift transition hover:bg-coral-500">
                Take the Halal Foodie Tour <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {halalPicks.map((b, i) => (
                <Link
                  key={b.slug}
                  href={`/${b.category}/${b.slug}`}
                  className={"group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl bg-black/30 shadow-lift " + (i % 2 === 1 ? "sm:translate-y-8" : "")}
                >
                  <Image src={b.photos[0]} alt="" fill sizes="(max-width: 1024px) 50vw, 320px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden="true" />
                  <div className="relative p-4">
                    <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal">{catBySlug[b.category]}</span>
                    <div className="mt-2 font-display text-lg font-extrabold leading-tight">{b.name}</div>
                    <div className="text-xs text-white/75">★ {Number(b.rating).toFixed(1)} · {Number(b.review_count).toLocaleString("en-CA")} reviews</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 05 THINGS TO DO */}
      {mosaic.length >= 5 && (
        <section className="container-page mt-24 sm:mt-32" data-reveal="up">
          <SectionHead index="05" kicker="Things to do" title="Bored?" accent="Not for long." intro="Climbing gyms, escape rooms, VR, padel, and racing sims. Edmonton's rainy-day and date-night scene, ranked." href="/activities-fun" linkLabel="All activities" />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[220px] lg:grid-cols-4">
            {mosaic.map((b, i) => (
              <Link
                key={b.slug}
                href={`/${b.category}/${b.slug}`}
                className={
                  "group relative flex flex-col justify-end overflow-hidden rounded-3xl bg-teal text-white shadow-card transition-all duration-500 hover:shadow-lift " +
                  (i === 0 ? "col-span-2 aspect-[16/10] lg:row-span-2 lg:aspect-auto" : "aspect-square lg:aspect-auto")
                }
              >
                <Image src={b.photos[0]} alt="" fill sizes={i === 0 ? "(max-width: 1024px) 100vw, 600px" : "(max-width: 1024px) 50vw, 300px"} className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" aria-hidden="true" />
                <div className={"relative " + (i === 0 ? "p-6 sm:p-8" : "p-4")}>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                    ★ {Number(b.rating).toFixed(1)} <span className="font-normal text-white/75">({Number(b.review_count).toLocaleString("en-CA")})</span>
                  </span>
                  <div className={"mt-2 font-display font-extrabold leading-tight drop-shadow-lg " + (i === 0 ? "text-3xl sm:text-4xl" : "text-lg sm:text-xl")}>{b.name}</div>
                  <div className="text-sm text-white/80">{b.neighborhood}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 06 COLLECTIONS */}
      <section className="mt-24 bg-mist py-16 sm:mt-32 sm:py-24" data-reveal="up">
        <div className="container-page">
          <SectionHead index="06" kicker="Collections" title="Curated for" accent="the vibe." href="/collections" linkLabel="All collections" />
          <div className="mt-10">
            <Carousel label="Collections" itemClassName="w-[72%] sm:w-[calc(40%-12px)] lg:w-[calc(25%-15px)]">
              {collections.map((c) => (
                <Link key={c.slug} href={`/collections/${c.slug}`} className={"group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br text-white shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-lift " + c.gradient}>
                  {c.cover && <Image src={c.cover} alt="" fill sizes="(max-width: 640px) 72vw, (max-width: 1024px) 40vw, 300px" className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/0" aria-hidden="true" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-teal">{c.count} spots</span>
                  <div className="relative p-5">
                    <div className="font-editorial text-sm italic text-white/80">{c.headline}</div>
                    <div className="mt-1 font-display text-2xl font-extrabold leading-tight">{c.title}</div>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-coral-300">
                      Explore <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </Carousel>
          </div>
        </div>
      </section>

      {/* 07 REVIEWS */}
      {recent.length > 0 && (
        <section className="grain relative overflow-hidden bg-teal py-16 text-white sm:py-24" data-reveal="up">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-coral/20 blur-3xl" aria-hidden="true" />
          <div className="container-page relative">
            <SectionHead index="07" kicker="Verified Google reviews" title="What Edmontonians" accent="are saying." tone="dark" />
            <div className="mt-10">
              <ReviewCarousel tone="dark" reviews={recent.map((r) => ({ ...r, business: { name: r.business.name, slug: r.business.slug, category: r.business.category } }))} />
            </div>
          </div>
        </section>
      )}

      {/* 08 NEIGHBORHOODS */}
      <section className="container-page mt-24 sm:mt-32" data-reveal="up">
        <SectionHead index="08" kicker="Neighborhoods" title="Explore by" accent="where you are." href="/neighborhoods" linkLabel="All neighborhoods" />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[230px] lg:grid-cols-4">
          {featuredAreas.map((a, i) => (
            <AreaTile
              key={a.name}
              name={a.name}
              href={`/neighborhoods/${toSlug(a.name)}`}
              count={a.businesses.length}
              photo={a.photo}
              fallback={a.cover}
              tags={a.topCategories.map((c) => c.name)}
              size={i < 2 ? "lg" : "md"}
              className={i < 2 ? "col-span-2 aspect-[16/10] lg:row-span-2 lg:aspect-auto" : "aspect-square lg:aspect-auto"}
            />
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-teal-300">Also:</span>
          {otherAreas.map((a) => (
            <Link key={a.name} href={`/neighborhoods/${toSlug(a.name)}`} className="chip">
              {a.name} <span className="text-teal-300">{a.businesses.length}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 09 FAQ */}
      <div className="mt-24 bg-mist py-16 sm:mt-32 sm:py-24">
        <div className="container-page">
          <SectionHead index="09" kicker="Questions, answered" title="Good" accent="to know." />
        </div>
        <FaqSection title="Good to know." items={faq} className="mt-4" showHeader={false} />
      </div>

      {/* 10 FOR BUSINESSES */}
      <section className="container-page mt-20 sm:mt-24" data-reveal="up">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="grain relative overflow-hidden rounded-3xl bg-teal p-8 text-white sm:p-12">
            <div className="pointer-events-none absolute -left-16 -top-24 h-72 w-72 rounded-full bg-coral/30 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-teal-300/25 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral-300">For business owners</p>
              <h3 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                Own a spot in Edmonton? <span className="font-editorial font-medium italic text-coral-300">Get found.</span>
              </h3>
              <p className="mt-4 max-w-md text-white/80">List your business for free. No contracts, no dashboards. We handle it, you show up.</p>
              <Link href="/get-listed" className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-teal transition hover:bg-coral hover:text-white">
                Get listed free <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-white via-mist to-white p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-coral/10 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">Who built this?</p>
                <span className="text-xs font-bold text-coral">★ 5.0 <span className="font-normal text-teal-500">(26 reviews)</span></span>
              </div>
              <img src="/logos/onepoint-horizontal.png" alt="OnePoint Solutions Marketing Agency" className="mt-5 w-48" />
              <p className="mt-4 text-sm leading-relaxed text-teal-500">
                WhereToYEG is powered by OnePoint Solutions, an Edmonton-based marketing agency. Websites with SEO and AEO built in, social media management, and ongoing SEO across Canada. Portable billboard signage in Edmonton and surrounding areas.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Websites", "SEO", "Social Media", "Signage"].map((s) => (
                  <span key={s} className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">{s}</span>
                ))}
              </div>
            </div>
            <div className="relative mt-6 flex flex-wrap gap-3">
              <a href="https://onepointsolution.ca" target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-coral px-5 text-sm font-bold text-white transition hover:bg-coral-500">
                Visit OnePoint Solutions <span aria-hidden>↗</span>
              </a>
              <a href="https://onepointsolution.ca/free-seo-audit/" target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-teal bg-white px-5 text-sm font-bold text-teal transition hover:bg-mist">
                Free SEO audit
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
