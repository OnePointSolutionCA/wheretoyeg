import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategories,
  getCategoryBySlug,
  getBusinessesByCategory,
  countBySubcategory,
} from "@/lib/content";
import { BusinessCard } from "@/components/BusinessCard";
import { Card3D } from "@/components/Card3D";
import { FilterableList } from "@/components/FilterBar";
import { SubcategoryPills } from "@/components/SubcategoryPills";
import { breadcrumbSchema, itemListSchema, JsonLd } from "@/lib/schema-extra";
import { ListingIndex } from "@/components/ListingIndex";
import { HUB_MIN, byRank, hubCount, hubHref, hubsForCategory } from "@/lib/areas";
import { CATEGORY_PLURAL, fitTitle, metaDescription } from "@/lib/seo";
import { FaqSection } from "@/components/FaqSection";
import { RelatedGuides } from "@/components/RelatedGuides";
import { OnePointAd } from "@/components/OnePointAd";
import { pickAdvertiser } from "@/lib/advertisers";
import { categoryFaq } from "@/lib/faq";
import { relatedPosts } from "@/lib/related";
import { SITE } from "@/lib/site";
import { toCard } from "@/lib/slim";
import { edmontonDay } from "@/lib/daily";

export const revalidate = 600;

export async function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const c = getCategoryBySlug(params.category);
  if (!c) return {};
  const count = getBusinessesByCategory(c.slug).length;
  const noun = CATEGORY_PLURAL[c.slug] ?? c.name.toLowerCase();
  const title = fitTitle([c.seo_title ?? "", `Best ${c.name} in Edmonton | ${count} Local Spots`, `Best ${c.name} in Edmonton`].filter(Boolean));
  const desc = c.seo_description
    ? metaDescription([c.seo_description])
    : metaDescription(
        [`Find the best ${noun} in Edmonton. Compare ${count} local spots by Google rating, with hours, photos and directions.`],
        ["Filter by area, price or open now.", "Free to browse."],
      );
  return {
    title: { absolute: title },
    description: desc,
    keywords: [
      ...(c.seo_keywords || []),
      `best ${c.name.toLowerCase()} Edmonton`,
      `${c.name.toLowerCase()} near me`,
      `${c.name.toLowerCase()} YEG`,
    ],
    alternates: { canonical: `${SITE.url}/${c.slug}` },
    openGraph: { title, description: desc, images: ["/og.png"] },
  };
}


function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


export default function CategoryPage({ params }: { params: { category: string } }) {
  const c = getCategoryBySlug(params.category);
  if (!c) notFound();
  const businesses = getBusinessesByCategory(params.category);
  const subCounts = countBySubcategory(params.category);
  const neighborhoods = Array.from(new Set(businesses.map((b) => b.neighborhood))).filter(Boolean).sort();
  const amenities = Array.from(new Set(businesses.flatMap((b) => b.amenities ?? []))).sort();

  const day = edmontonDay();

  // Top Picks: 6 highest-rated, rotated daily. Pinned listings always lead.
  const topPicks = [
    ...businesses.filter((b) => b.pinned),
    ...seededShuffle(
      businesses.filter((b) => !b.pinned && (b.rating ?? 0) >= 4.3 && (b.review_count ?? 0) >= 10),
      day
    ),
  ].slice(0, 6);

  // Rotated main listing, slimmed to only card-visible fields to cut page weight
  const rotatedBusinesses = seededShuffle(businesses, day + 999).map(toCard);

  const heroPhoto = `/photos/_hero/${c.slug}.jpg`;
  const rated = businesses.filter((b) => b.rating > 0 && b.review_count > 0);
  const avgRating = rated.length ? rated.reduce((s, b) => s + Number(b.rating), 0) / rated.length : 0;
  const totalReviews = rated.reduce((s, b) => s + Number(b.review_count), 0);
  const halalCount = businesses.filter((b) => b.amenities?.includes("Halal")).length;
  const areaHubs = hubsForCategory(c.slug);
  const noun = CATEGORY_PLURAL[c.slug] ?? c.name.toLowerCase();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", href: "/" },
        { name: c.name },
      ])} />
      <JsonLd
        data={itemListSchema(
          `Best ${c.name} in Edmonton`,
          `/${c.slug}`,
          [...businesses].sort(byRank).map((b) => ({ name: b.name, href: `/${b.category}/${b.slug}` })),
        )}
      />
      {/* Photo hero */}
      <section className="relative overflow-hidden text-white">
        {heroPhoto ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroPhoto})` }}
            aria-hidden="true"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-teal to-teal-900" aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-coral/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-teal-300/15 blur-3xl" />

        <div className="container-page relative py-16 sm:py-24" data-reveal="left">
          <nav className="text-xs text-white/70">
            <Link href="/" className="transition hover:text-white">Home</Link> <span className="px-1">›</span>{" "}
            <span className="font-semibold text-white">{c.name}</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight drop-shadow-lg sm:text-6xl">
            Best {c.name}<br className="hidden sm:block" /> <span className="text-coral">in Edmonton</span>
          </h1>
          <p className="mt-4 max-w-2xl text-white/85 sm:text-lg">{c.description}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
            <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
              {businesses.length} {businesses.length === 1 ? "spot" : "spots"} listed
            </span>
            {avgRating > 0 && <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">★ {avgRating.toFixed(1)} avg rating</span>}
            {totalReviews > 0 && <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">{totalReviews.toLocaleString("en-CA")} Google reviews</span>}
            {halalCount > 0 && <span className="rounded-full bg-coral/90 px-3 py-1.5">{halalCount} halal</span>}
          </div>
        </div>
      </section>

      {/* Subcategory chips + intro */}
      <section className="border-b border-line bg-mist">
        <div className="container-page py-6">
          {c.intro && <p className="mb-4 max-w-2xl text-teal-500">{c.intro}</p>}
          {c.subcategories && c.subcategories.length > 0 && (
            <SubcategoryPills
              categorySlug={c.slug}
              subcategories={c.subcategories}
              counts={subCounts}
            />
          )}
          {areaHubs.length > 0 && (
            <div className="mt-3 flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-teal-300">By area:</span>
              {areaHubs.map((x) => (
                <Link key={x.area} href={x.href} className="chip shrink-0">
                  {x.area} <span className="text-teal-300">{x.count}</span>
                </Link>
              ))}
            </div>
          )}
          {c.slug === "restaurants" && (
            <div className="mt-3">
              <Link
                href="/halal-restaurants"
                className="inline-flex items-center gap-2 rounded-full border border-coral bg-coral/10 px-4 py-2 text-sm font-bold text-coral transition hover:bg-coral hover:text-white"
              >
                <span aria-hidden>🥩</span>
                Halal-only ({businesses.filter((b) => b.amenities?.includes("Halal")).length})
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Top Picks, rotates daily */}
      {topPicks.length >= 3 && (
        <section className="container-page mt-10" data-reveal="right">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Today&apos;s top picks</p>
              <h2 className="section-title mt-1">Worth checking out right now</h2>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topPicks.map((b) => (
              <Card3D key={b.slug}>
                <BusinessCard business={b} categoryName={c.name} />
              </Card3D>
            ))}
          </div>
        </section>
      )}

      {/* Divider */}
      {topPicks.length >= 3 && (
        <div className="container-page mt-10">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">All {c.name}</span>
            <div className="h-px flex-1 bg-line" />
          </div>
        </div>
      )}

      <section className="container-page py-10" data-reveal="right">
        {rotatedBusinesses.length > 0 ? (
          <FilterableList
            businesses={rotatedBusinesses}
            categoryName={c.name}
            neighborhoods={neighborhoods}
            amenities={amenities}
          />
        ) : (
          <EmptyState categoryName={c.name} />
        )}
      </section>

      <ListingIndex businesses={businesses} title={`Every listing in ${c.name}, A to Z`} className="container-page" />

      <div className="mt-16 bg-mist pb-14 pt-2 sm:pb-20">
        <RelatedGuides posts={relatedPosts(c.slug)} title="Related Edmonton guides" />
        <FaqSection
          title={`${c.name} in Edmonton: FAQ`}
          items={categoryFaq(c, businesses, {
            noun,
            areaHref: (n) => (hubCount(c.slug, n) >= HUB_MIN ? hubHref(c.slug, n) : undefined),
            ...(c.slug === "restaurants" ? { halalHref: "/halal-restaurants" } : {}),
          })}
        />
      </div>

      {/* Sponsored: OnePoint Solutions display ad */}
      <section className="container-page mt-12" data-reveal="up">
        <OnePointAd placement="category-footer" variant="banner" advertiser={pickAdvertiser({ category: c.slug })} />
      </section>

      <section className="container-page mt-6" data-reveal="left">
        <div className="rounded-2xl border border-line bg-mist p-6">
          <p className="eyebrow">Also on WhereToYEG</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {getCategories().filter((x) => x.slug !== c.slug).map((x) => (
              <Link key={x.slug} href={`/${x.slug}`} className="chip">
                {x.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function EmptyState({ categoryName }: { categoryName: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-mist p-12 text-center">
      <p className="font-display text-2xl font-bold text-teal">
        We&apos;re adding {categoryName} to the map.
      </p>
      <p className="mt-2 text-teal-500">
        Know a spot worth listing? Tell us, listings are free.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <Link href="/get-listed" className="btn-primary">Get listed</Link>
        <Link href="/contact" className="btn-ghost">Suggest a business</Link>
      </div>
    </div>
  );
}
