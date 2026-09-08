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
import { SITE } from "@/lib/site";

export async function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const c = getCategoryBySlug(params.category);
  if (!c) return {};
  const title = c.seo_title || `Best ${c.name} in Edmonton | ${c.name} near me`;
  const desc = c.seo_description || `${c.description} Find the best ${c.name.toLowerCase()} across Edmonton — hours, addresses, ratings and directions.`;
  return {
    title,
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

function slimForCard(b: any): any {
  return {
    name: b.name,
    slug: b.slug,
    category: b.category,
    subcategory: b.subcategory,
    tier: b.tier,
    logo: b.logo,
    description: b.description,
    neighborhood: b.neighborhood,
    hours: b.hours,
    photos: b.photos?.slice(0, 1) ?? [],
    rating: b.rating,
    review_count: b.review_count,
    price_range: b.price_range,
    amenities: b.amenities,
    date_listed: b.date_listed,
    address: "",
    tags: [],
    active: true,
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const c = getCategoryBySlug(params.category);
  if (!c) notFound();
  const businesses = getBusinessesByCategory(params.category);
  const subCounts = countBySubcategory(params.category);
  const neighborhoods = Array.from(new Set(businesses.map((b) => b.neighborhood))).filter(Boolean).sort();
  const amenities = Array.from(new Set(businesses.flatMap((b) => b.amenities ?? []))).sort();

  const day = Math.floor(Date.now() / 86_400_000);

  // Top Picks: 6 highest-rated, rotated daily
  const topPicks = seededShuffle(
    businesses.filter((b) => (b.rating ?? 0) >= 4.3 && (b.review_count ?? 0) >= 10),
    day
  ).slice(0, 6);

  // Rotated main listing — slimmed to only card-visible fields to cut page weight
  const rotatedBusinesses = seededShuffle(businesses, day + 999).map(slimForCard);

  const heroPhoto = `/photos/_hero/${c.slug}.jpg`;

  return (
    <>
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
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
            {businesses.length} {businesses.length === 1 ? "spot" : "spots"} listed
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
          {c.slug === "restaurants" && (
            <div className="mt-3">
              <Link
                href="/restaurants?amenity=Halal"
                className="inline-flex items-center gap-2 rounded-full border border-coral bg-coral/10 px-4 py-2 text-sm font-bold text-coral transition hover:bg-coral hover:text-white"
              >
                <span aria-hidden>🥩</span>
                Halal-only ({businesses.filter((b) => b.amenities?.includes("Halal")).length})
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Top Picks — rotates daily */}
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

      {/* OnePoint Solutions subtle CTA */}
      <section className="container-page mt-4" data-reveal="up">
        <div className="relative overflow-hidden rounded-2xl border border-coral/20 bg-gradient-to-r from-coral/5 via-white to-teal/5 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-teal">Get found by more Edmonton customers</p>
              <p className="mt-1 text-xs text-teal-500">Add your business to WhereToYEG for free. Want help growing online? <strong className="text-coral">OnePoint Solutions</strong> can manage your SEO, social media, and Google Business Profile so you can focus on what you do best.</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link href="/get-listed" className="rounded-full bg-teal px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-600">Get Listed Free</Link>
              <a href="https://onepointsolution.ca" target="_blank" rel="noreferrer" className="rounded-full border border-coral px-4 py-2 text-xs font-bold text-coral transition hover:bg-coral hover:text-white">OnePoint Solutions ↗</a>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-6" data-reveal="left">
        <div className="rounded-2xl border border-line bg-mist p-6">
          <p className="eyebrow">Also on WhereToYEG</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {getCategories().filter((x) => x.slug !== c.slug).slice(0, 10).map((x) => (
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
        Know a spot worth listing? Tell us — listings are free.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <Link href="/get-listed" className="btn-primary">Get listed</Link>
        <Link href="/contact" className="btn-ghost">Suggest a business</Link>
      </div>
    </div>
  );
}
