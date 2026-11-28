import Image from "next/image";
import Link from "next/link";
import { Fraunces, DM_Mono } from "next/font/google";
import { neighborhoodStats } from "@/lib/neighborhoods";
import { HeroSearch } from "@/components/HeroSearch";
import { OnePointPopup } from "@/components/OnePointPopup";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { PartnersStrip } from "@/components/PartnersStrip";
import { FaqSection, type FaqEntry } from "@/components/FaqSection";
import { Carousel } from "@/components/Carousel";
import { postCategory, postCover } from "@/lib/blogMedia";
import { COLLECTIONS, getBusinessesForCollection } from "@/lib/collections";
import { SITE } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { dailyShuffle } from "@/lib/daily";
import { toCard } from "@/lib/slim";
import { pinnedFirst } from "@/lib/pin";
import { HOMEPAGE_SPONSOR_LISTINGS } from "@/lib/advertisers";
import { getDiverseFeatured, getRecentReviews, getCategories, getBusinesses, countByCategory } from "@/lib/content";
import { getBlogPosts } from "@/lib/blog";
import { areaSlug } from "@/lib/place";
import { MagMotion } from "@/components/mag/MagMotion";
import { RiverLineArt } from "@/components/mag/RiverLineArt";
import { MagLink } from "@/components/mag/MagLink";
import type { Metadata } from "next";
import "./magazine.css";

// Editorial "city magazine" homepage (preview branch redesign-magazine-home, 2026-11-28).
const serif = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  variable: "--mag-serif",
  display: "swap",
});
const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--mag-mono",
  display: "swap",
});

// Hourly so the daily rotation flips within an hour of Edmonton midnight (was 10 min, which cost a lot of Vercel cache writes).
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  // Rounded down to the hundred so the title doesn't change with every new listing.
  const count = Math.floor(getBusinesses().length / 100) * 100;
  const title = `Edmonton Business Directory | ${count.toLocaleString("en-CA")}+ Spots | ${SITE.name}`;
  const description =
    "Find the best restaurants, barbers, dentists, mechanics and things to do in Edmonton, Sherwood Park and St. Albert, with Google ratings, hours and directions.";
  return {
    title: { absolute: title },
    description,
    ...pageMeta({ path: "/", title, description }),
  };
}

/** Category photos dealt like cards in the "YEG." moment (modest stock photos already used on the site). */
const DEALT = ["restaurants", "bakeries", "grocery-markets", "barbers", "auto-repair", "home-services", "moving-storage"];
/** Lead category cards with a photo; every other category is in the index list under them. */
const LEAD_CATS = ["restaurants", "bakeries", "grocery-markets", "barbers", "auto-repair", "home-services"];
const HERO_WORDS = ["Eat.", "Fix.", "Play.", "Shop."];

const fmt = (n: number) => n.toLocaleString("en-CA");
const cardPhoto = (slug: string, w: 780 | 1040 = 780) => `/photos/_hero/opt/${slug}-m${w}.webp`;

export default function HomePage() {
  // Premium listings first (all sponsors, then other premium; the carousel shuffles this block
  // on each load so no one is stuck in front), then the daily mix of other spots.
  const listed = getBusinesses();
  const sponsors = HOMEPAGE_SPONSOR_LISTINGS
    .map((slug) => listed.find((b) => b.slug === slug))
    .filter((b): b is NonNullable<typeof b> => !!b);
  const premium = [...sponsors, ...listed.filter((b) => b.tier === "premium" && !sponsors.includes(b))];
  const premiumSlugs = new Set(premium.map((b) => b.slug));
  const featured = [...premium, ...getDiverseFeatured(30).filter((b) => !premiumSlugs.has(b.slug))].slice(0, Math.max(20, premium.length + 6));
  const recent = getRecentReviews(8);
  const onepoint = listed.find((b) => b.slug === "onepoint-solutions");
  const cats = getCategories();
  const counts = countByCategory();
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.name]));
  const allPosts = getBlogPosts();
  const guideCount = allPosts.length;
  const allBusinesses = listed;
  const totalBusinesses = allBusinesses.length;
  const areas = SITE.neighborhoods
    .map((n) => ({ name: n, count: neighborhoodStats(n, allBusinesses).businesses.length }))
    .filter((a) => a.count > 0);

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
  // OnePoint Solutions is always first in its lists (pinned: true in its listing).
  const picks = pinnedFirst([...(onepoint ? [onepoint] : []), ...topFive.filter((b) => b.slug !== onepoint?.slug)]);

  const [leadPost, ...morePosts] = allPosts;
  const leadCover = leadPost ? postCover(leadPost) : "";
  const leadCat = leadPost ? postCategory(leadPost) : undefined;
  // Seasonal guide kept on the homepage until the last market (Dec 6, 2026), unless it is already shown here.
  const seasonalPost = Date.now() > Date.parse("2026-12-07T07:00:00Z") || [leadPost, ...morePosts.slice(0, 3)].some((p) => p?.slug === "christmas-markets-edmonton-2026")
    ? undefined
    : allPosts.find((p) => p.slug === "christmas-markets-edmonton-2026");
  // Winter link to the skating category, kept on the homepage through the outdoor rink season.
  const showSkating = Date.now() < Date.parse("2027-03-16T06:00:00Z");

  const halal = allBusinesses.filter((b) => b.amenities?.includes("Halal"));
  const halalByCat = ["restaurants", "grocery-markets", "catering", "bakeries", "cafes-coffee-shops"]
    .map((slug) => ({ slug, name: catBySlug[slug], count: halal.filter((b) => b.category === slug).length }))
    .filter((x) => x.count > 0);
  const halalPool = ranked.filter((b) => b.amenities?.includes("Halal") && b.review_count >= 100 && b.rating >= 4.5).slice(0, 24);
  const halalPicks = pickVaried(dailyShuffle(halalPool, 3), 4, 2, topSlugs);
  const kosherCount = allBusinesses.filter((b) => b.amenities?.includes("Kosher") || b.amenities?.includes("Kosher Section")).length;

  const usedCovers = new Set<string>();
  const collections = COLLECTIONS.map((c) => {
    const list = getBusinessesForCollection(c, allBusinesses);
    const cover = list.find((b) => b.photos?.length && !usedCovers.has(b.photos[0]))?.photos[0] ?? list.find((b) => b.photos?.length)?.photos[0];
    if (cover) usedCovers.add(cover);
    return { ...c, count: list.length, cover };
  }).filter((c) => c.count > 0);

  const dealt = DEALT.map((slug) => cats.find((c) => c.slug === slug)).filter((c): c is NonNullable<typeof c> => !!c);
  const leadCats = LEAD_CATS.map((slug) => cats.find((c) => c.slug === slug)).filter((c): c is NonNullable<typeof c> => !!c);
  const indexCats = [...cats].sort((a, b) => a.name.localeCompare(b.name));

  const faq: FaqEntry[] = [
    { q: "How do I get my Edmonton business listed on WhereToYEG?", a: "Submit the Get Listed form. Listings are completely free, and most go live within a few days.", links: [{ label: "Get listed", href: "/get-listed" }] },
    { q: "Is WhereToYEG free?", a: "Yes. Browsing and listing are both free. We're building the most complete Edmonton business directory, and the more businesses on it, the more useful it is." },
    { q: "How do you pick which businesses appear?", a: "Every listing is a real Edmonton-area business. Ratings and review counts come from Google Maps, so they match what you'd see there." },
    { q: "Do you cover halal businesses?", a: "Yes. Filter any category by the Halal amenity, or start with the curated halal collection. We list halal restaurants, cafés, bakeries, meat markets, and caterers.", links: [{ label: "Halal restaurants", href: "/halal-restaurants" }, { label: "Halal foodie tour", href: "/collections/halal-foodie-tour" }] },
    { q: "Which Edmonton neighborhoods does the site cover?", a: `All of Edmonton plus nearby communities, including ${SITE.neighborhoods.slice(0, 6).join(", ")}, Sherwood Park, St. Albert, and Spruce Grove.`, links: [{ label: "Browse neighborhoods", href: "/neighborhoods" }] },
  ];

  const Pills = ({ copy }: { copy?: boolean }) => (
    <ul className="mag-pills__row" aria-hidden={copy ? true : undefined} data-copy={copy ? "" : undefined}>
      {areas.map((a) => (
        <li key={a.name}>
          <Link href={`/neighborhoods/${areaSlug(a.name)}`} className="mag-pill" tabIndex={copy ? -1 : undefined}>
            {a.name} <span>{fmt(a.count)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`mag ${serif.variable} ${mono.variable}`} data-mag-root>
      <OnePointPopup />
      <MagMotion />

      {/* HERO: a magazine cover. H1 is text; the giant word and the cutout are decoration. */}
      <section className="mag-hero" data-mag-hero>
        <div className="mag-wrap mag-hero__top">
          <div>
            <p className="mag-label mag-hero__kicker">
              <span>Edmonton, Alberta</span>
              <span aria-hidden="true" className="mag-dot" />
              <span>The city guide</span>
            </p>
            <h1 className="mag-h1">
              Find the best local businesses in <em>Edmonton</em>.
            </h1>
          </div>
          <dl className="mag-facts">
            {[
              [fmt(totalBusinesses), "local businesses"],
              [String(cats.length), "categories"],
              [String(guideCount), "local guides"],
              [String(SITE.neighborhoods.length), "neighborhoods"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt>{l}</dt>
                <dd>{n}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mag-hero__stage">
          <svg className="mag-giant" viewBox="0 0 1000 250" aria-hidden="true" focusable="false" data-mag-word>
            {HERO_WORDS.map((w, i) => (
              <text key={w} x="500" y="238" textAnchor="middle" className={`mag-giant__w mag-giant__w${i + 1}`}>
                {w.toUpperCase()}
              </text>
            ))}
          </svg>
          <div className="mag-hero__cutout" data-mag-cutout>
            <img
              src="/photos/_mag/muttart-cutout.webp"
              alt="The glass pyramids of the Muttart Conservatory in Edmonton"
              width={1200}
              height={477}
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>

        <div className="mag-wrap mag-hero__search">
          <div className="mag-search">
            <HeroSearch neighborhoods={SITE.neighborhoods} categories={cats.map((c) => ({ name: c.name, slug: c.slug }))} />
          </div>
          <p className="mag-popular">
            <span className="mag-label">Popular</span>
            {SITE.popularSearches.map((s) => (
              <Link key={s.href} href={s.href} className="mag-ulink">
                {s.label}
              </Link>
            ))}
          </p>
        </div>
      </section>

      {/* NEIGHBORHOOD PILL STRIP (duplicate row is aria-hidden for the loop, never inert) */}
      <section className="mag-pills" aria-labelledby="mag-areas-title">
        <div className="mag-wrap mag-pills__head">
          <h2 id="mag-areas-title" className="mag-label">Neighborhoods</h2>
          <MagLink href="/neighborhoods">See all</MagLink>
        </div>
        <div className="mag-pills__track">
          <div className="mag-pills__belt">
            <Pills />
            <Pills copy />
          </div>
        </div>
      </section>

      {/* STORY BAND + RIVER VALLEY LINE ART */}
      <section className="mag-story" aria-labelledby="mag-story-title">
        <div className="mag-wrap mag-story__text">
          <p className="mag-label" data-rise>From the river valley out</p>
          <h2 id="mag-story-title" className="mag-h2" data-rise>
            Every listing is a real place. <em>Every rating comes from Google.</em>
          </h2>
          <p className="mag-body" data-rise>
            {fmt(totalBusinesses)} Edmonton area businesses across {cats.length} categories and {SITE.neighborhoods.length} neighborhoods, from Downtown to Stony Plain. Listing is free, and the ratings and review counts match what you see on Google Maps.
          </p>
        </div>
        <RiverLineArt />
      </section>

      {/* SIGNATURE MOMENT: YEG. with category cards dealt out on scroll */}
      <section className="mag-deal" aria-labelledby="mag-deal-title" data-mag-deal>
        <div className="mag-deal__pin" data-mag-deal-pin>
          <div className="mag-wrap mag-deal__head">
            <p className="mag-label">Pick a card</p>
            <h2 id="mag-deal-title" className="mag-h2">
              Where to eat, fix and play in <em>YEG.</em>
            </h2>
          </div>
          <div className="mag-deal__table">
            <svg className="mag-deal__word" viewBox="0 0 1000 300" aria-hidden="true" focusable="false" data-mag-yeg>
              <text x="500" y="276" textAnchor="middle">YEG.</text>
            </svg>
            <ul className="mag-deal__cards">
              {dealt.map((c, i) => {
                const t = dealt.length > 1 ? (i - (dealt.length - 1) / 2) / ((dealt.length - 1) / 2) : 0;
                return (
                  <li key={c.slug} className="mag-card" style={{ "--t": t.toFixed(3), zIndex: 10 - Math.abs(Math.round(t * 3)) } as React.CSSProperties} data-mag-card data-t={t.toFixed(3)}>
                    <Link href={`/${c.slug}`}>
                      <img src={cardPhoto(c.slug)} alt="" width={780} height={600} loading="lazy" decoding="async" />
                      <span className="mag-card__label">
                        <span className="mag-card__count">{fmt(counts[c.slug]?.count ?? 0)} spots</span>
                        <span className="mag-card__name">{c.name}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* CATEGORIES: lead cards, then the full index with counts */}
      <section id="categories" className="mag-cats scroll-mt-24" aria-labelledby="mag-cats-title">
        <div className="mag-wrap">
          <div className="mag-head">
            <div>
              <p className="mag-label" data-rise>Browse</p>
              <h2 id="mag-cats-title" className="mag-h2" data-rise>
                Everything Edmonton, <em>one map.</em>
              </h2>
            </div>
            <MagLink href="/search">Search everything</MagLink>
          </div>
          <ul className="mag-cats__grid">
            {leadCats.map((c) => (
              <li key={c.slug} data-rise>
                <Link href={`/${c.slug}`} className="mag-catcard">
                  <span className="mag-catcard__img">
                    <img src={cardPhoto(c.slug, 1040)} alt="" width={1040} height={800} loading="lazy" decoding="async" />
                  </span>
                  <span className="mag-label mag-catcard__count">{fmt(counts[c.slug]?.count ?? 0)} listings</span>
                  <span className="mag-catcard__name">{c.name}</span>
                  {c.description && <span className="mag-catcard__desc">{c.description}</span>}
                  <span className="mag-ulink mag-catcard__go">Browse {c.name.toLowerCase()}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mag-index">
            <p className="mag-label">The full index</p>
            <ul className="mag-index__list">
              {indexCats.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}`} className="mag-index__row">
                    <span className="mag-index__name">{c.name}</span>
                    <span className="mag-index__dots" aria-hidden="true" />
                    <span className="mag-index__n">{counts[c.slug]?.count ? fmt(counts[c.slug].count) : "New"}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <MagLink href="/categories">Every service, A to Z</MagLink>
          </div>
        </div>
      </section>

      <div className="mag-partners">
        <PartnersStrip />
      </div>

      {/* TOP PICKS + LEAD GUIDE */}
      <section className="mag-picks" aria-labelledby="mag-picks-title">
        <div className="mag-wrap">
          <div className="mag-head">
            <div>
              <p className="mag-label" data-rise>This week</p>
              <h2 id="mag-picks-title" className="mag-h2" data-rise>
                What Edmonton is <em>reading and rating.</em>
              </h2>
            </div>
            <MagLink href="/blog">All {guideCount} guides</MagLink>
          </div>
          <div className="mag-picks__grid">
            {leadPost && (
              <Link href={`/blog/${leadPost.slug}`} className="mag-lead" data-rise>
                <span className="mag-lead__img">
                  <Image src={leadCover} alt="" fill sizes="(max-width: 1024px) 100vw, 680px" className="object-cover" />
                </span>
                <span className="mag-label mag-lead__kicker">
                  Latest guide{leadCat ? ` · ${leadCat.name}` : ""} · {leadPost.readingMinutes} min
                </span>
                <span className="mag-lead__title">{leadPost.title}</span>
                <span className="mag-lead__desc">{leadPost.description}</span>
                <span className="mag-ulink">Read the guide</span>
              </Link>
            )}
            <div className="mag-top" data-rise>
              <div className="mag-top__head">
                <h3 className="mag-h3">Top picks</h3>
                <span className="mag-label">New picks daily</span>
              </div>
              <ol className="mag-top__list">
                {picks.map((b, i) => (
                  <li key={b.slug}>
                    <Link href={`/${b.category}/${b.slug}`} className="mag-top__row">
                      <span className="mag-top__n">{i + 1}</span>
                      <span className="mag-top__img">
                        {b.photos?.[0] ? (
                          <Image src={b.photos[0]} alt="" fill sizes="56px" className="object-cover" />
                        ) : b.logo ? (
                          <Image src={b.logo} alt="" fill sizes="56px" className="mag-top__logo" />
                        ) : null}
                      </span>
                      <span className="mag-top__txt">
                        <span className="mag-top__name">{b.name}</span>
                        <span className="mag-top__meta">
                          {b.pinned ? "Pinned · " : ""}
                          {catBySlug[b.category]} · {b.neighborhood}
                        </span>
                      </span>
                      {b.rating > 0 && (
                        <span className="mag-top__rate">
                          <span>★ {Number(b.rating).toFixed(1)}</span>
                          <span>{fmt(Number(b.review_count))}</span>
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* BLOG: more from the guides */}
          {morePosts.length > 0 && (
            <div className="mag-more">
              <p className="mag-label">Also new on the blog</p>
              <ul className="mag-more__list">
                {morePosts.slice(0, 3).map((p) => (
                  <li key={p.slug} data-rise>
                    <Link href={`/blog/${p.slug}`} className="mag-more__item">
                      <span className="mag-more__img">
                        <Image src={postCover(p)} alt="" fill sizes="(max-width: 640px) 100vw, 380px" className="object-cover" />
                      </span>
                      <span className="mag-more__title">{p.title}</span>
                      <span className="mag-label">{p.readingMinutes} min read</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {(seasonalPost || showSkating) && (
                <p className="mag-popular mag-more__extra">
                  <span className="mag-label">Also</span>
                  {seasonalPost && (
                    <Link href={`/blog/${seasonalPost.slug}`} className="mag-ulink">
                      Christmas markets in Edmonton 2026
                    </Link>
                  )}
                  {showSkating && (
                    <Link href="/activities-fun/skating" className="mag-ulink">
                      Skating in Edmonton
                    </Link>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED (premium and sponsors first, shuffled per load) */}
      {featured.length > 0 && (
        <section className="mag-featured" aria-labelledby="mag-featured-title">
          <div className="mag-wrap">
            <p className="mag-label" data-rise>Featured</p>
            <h2 id="mag-featured-title" className="mag-h2" data-rise>
              Local spots <em>worth the drive.</em>
            </h2>
            <p className="mag-body">Hand picked businesses from across the city, refreshed every week.</p>
            <div className="mag-featured__row">
              <FeaturedCarousel businesses={featured.map(toCard)} categoryNames={catBySlug} shuffleFirst={premium.length} />
            </div>
          </div>
        </section>
      )}

      {/* HALAL AND KOSHER */}
      {halal.length > 0 && (
        <section className="mag-halal" aria-labelledby="mag-halal-title">
          <div className="mag-wrap mag-halal__grid">
            <div>
              <p className="mag-label" data-rise>Halal and kosher</p>
              <h2 id="mag-halal-title" className="mag-h2" data-rise>
                Halal, <em>done right.</em>
              </h2>
              <p className="mag-body" data-rise>
                Edmonton has one of the best halal food scenes in Canada. {fmt(halal.length)} listings are marked halal on WhereToYEG, from karahi houses to butcher counters.
                {kosherCount > 0 && <> Looking for kosher? {kosherCount} {kosherCount === 1 ? "spot is" : "spots are"} listed too.</>}
              </p>
              <ul className="mag-chips">
                {halalByCat.map((h) => (
                  <li key={h.slug}>
                    <Link href={h.slug === "restaurants" ? "/halal-restaurants" : `/${h.slug}?amenity=Halal`} className="mag-pill mag-pill--dark">
                      {h.name} <span>{fmt(h.count)}</span>
                    </Link>
                  </li>
                ))}
                {kosherCount > 0 && (
                  <li>
                    <Link href="/halal-restaurants#kosher" className="mag-pill mag-pill--dark">
                      Kosher spots <span>{kosherCount}</span>
                    </Link>
                  </li>
                )}
              </ul>
              <div className="mag-actions">
                <MagLink href="/collections/halal-foodie-tour">Take the Halal Foodie Tour</MagLink>
                <MagLink href="/halal-restaurants">Halal restaurants</MagLink>
              </div>
            </div>
            <ul className="mag-halal__picks">
              {halalPicks.map((b, i) => (
                <li key={b.slug} data-rise style={{ "--i": i } as React.CSSProperties}>
                  <Link href={`/${b.category}/${b.slug}`} className="mag-photo">
                    <span className="mag-photo__img">
                      <Image src={b.photos[0]} alt="" fill sizes="(max-width: 1024px) 50vw, 300px" className="object-cover" />
                    </span>
                    <span className="mag-label">{catBySlug[b.category]}</span>
                    <span className="mag-photo__name">{b.name}</span>
                    <span className="mag-photo__meta">
                      ★ {Number(b.rating).toFixed(1)} · {fmt(Number(b.review_count))} reviews
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* GUIDES: curated collections */}
      <section className="mag-guides" aria-labelledby="mag-guides-title">
        <div className="mag-wrap">
          <div className="mag-head">
            <div>
              <p className="mag-label" data-rise>Collections</p>
              <h2 id="mag-guides-title" className="mag-h2" data-rise>
                Curated for <em>the vibe.</em>
              </h2>
            </div>
            <MagLink href="/collections">All collections</MagLink>
          </div>
          <div className="mag-guides__row">
            <Carousel label="Collections" itemClassName="w-[72%] sm:w-[calc(40%-12px)] lg:w-[calc(25%-15px)]">
              {collections.map((c) => (
                <Link key={c.slug} href={`/collections/${c.slug}`} className="mag-photo mag-photo--guide">
                  <span className="mag-photo__img">
                    {c.cover && <Image src={c.cover} alt="" fill sizes="(max-width: 640px) 72vw, (max-width: 1024px) 40vw, 300px" className="object-cover" />}
                  </span>
                  <span className="mag-label">{c.count} spots · {c.headline}</span>
                  <span className="mag-photo__name">{c.title}</span>
                </Link>
              ))}
            </Carousel>
          </div>
        </div>
      </section>

      {/* REVIEWS as sticky notes (real Google reviews) */}
      {recent.length > 0 && (
        <section className="mag-notes" aria-labelledby="mag-notes-title">
          <div className="mag-wrap">
            <p className="mag-label" data-rise>Google reviews</p>
            <h2 id="mag-notes-title" className="mag-h2" data-rise>
              What Edmontonians <em>are saying.</em>
            </h2>
          </div>
          <ul className="mag-notes__row" aria-label="Recent reviews">
            {recent.map((r, i) => (
              <li key={`${r.business.slug}-${i}`} className={"mag-note" + (i % 3 === 1 ? " mag-note--brand" : "")} style={{ "--r": `${[-2, 1.5, -1, 2, -1.5, 1][i % 6]}deg` } as React.CSSProperties}>
                <p className="mag-note__stars" aria-label={`${r.rating} out of 5 stars`}>
                  {"★".repeat(Math.round(Number(r.rating) || 0))}
                </p>
                <blockquote className="mag-note__quote">{clip(r.comment, 220)}</blockquote>
                <p className="mag-label mag-note__by">
                  {r.name}
                  {r.date ? ` · ${reviewDate(r.date)}` : ""}
                </p>
                <Link href={`/${r.business.category}/${r.business.slug}`} className="mag-ulink mag-note__biz">
                  {r.business.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ (FAQPage schema comes from FaqSection) */}
      <section className="mag-faq" aria-labelledby="mag-faq-title">
        <div className="mag-wrap">
          <p className="mag-label">Questions, answered</p>
          <h2 id="mag-faq-title" className="mag-h2">
            Good <em>to know.</em>
          </h2>
        </div>
        <FaqSection title="Good to know." items={faq} className="mt-4" showHeader={false} />
      </section>

      {/* FOR BUSINESSES */}
      <section className="mag-listed" aria-labelledby="mag-listed-title">
        <div className="mag-wrap mag-listed__grid">
          <div>
            <p className="mag-label">For business owners</p>
            <h2 id="mag-listed-title" className="mag-display">
              Own a spot in Edmonton? <em>Get found.</em>
            </h2>
            <p className="mag-body">List your business for free. No contracts, no dashboards. We handle it, you show up.</p>
            <div className="mag-actions">
              <MagLink href="/get-listed" big>
                Get listed free
              </MagLink>
            </div>
          </div>
          <div className="mag-built">
            <div className="mag-built__head">
              <p className="mag-label">Who built this?</p>
              {onepoint && onepoint.rating > 0 && (
                <Link href="/professional-services/onepoint-solutions" className="mag-ulink">
                  ★ {Number(onepoint.rating).toFixed(1)} ({onepoint.review_count} Google reviews)
                </Link>
              )}
            </div>
            <img src="/logos/onepoint-horizontal-sm.webp" alt="OnePoint Solutions Marketing Agency" width={786} height={120} loading="lazy" decoding="async" className="mag-built__logo" />
            <p className="mag-body">
              WhereToYEG is powered by OnePoint Solutions, an Edmonton marketing agency. Websites with SEO and AEO built in, social media management, and ongoing SEO across Canada. Portable billboard signage in Edmonton and surrounding areas.
            </p>
            <div className="mag-actions">
              <MagLink href="https://onepointsolution.ca" external>
                Visit OnePoint Solutions
              </MagLink>
              <MagLink href="https://onepointsolution.ca/free-seo-audit/" external>
                Free SEO audit
              </MagLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function reviewDate(d: string) {
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
    const dt = new Date(d);
    if (!isNaN(dt.getTime())) return dt.toLocaleDateString("en-CA", { year: "numeric", month: "short", timeZone: "America/Edmonton" });
  }
  return d;
}

function clip(text: string | undefined, max: number) {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}
