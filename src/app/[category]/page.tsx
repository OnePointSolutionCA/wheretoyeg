import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategories,
  getCategoryBySlug,
  getBusinessesByCategory,
  countBySubcategory,
} from "@/lib/content";
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

export default function CategoryPage({ params }: { params: { category: string } }) {
  const c = getCategoryBySlug(params.category);
  if (!c) notFound();
  const businesses = getBusinessesByCategory(params.category);
  const subCounts = countBySubcategory(params.category);
  const neighborhoods = Array.from(new Set(businesses.map((b) => b.neighborhood))).filter(Boolean).sort();
  const amenities = Array.from(new Set(businesses.flatMap((b) => b.amenities ?? []))).sort();

  // Prefer the curated editorial hero image for the category over any
  // individual business's storefront shot.
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
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
        {/* Ambient orbs */}
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

      <section className="container-page py-10" data-reveal="right">
        {businesses.length > 0 ? (
          <FilterableList
            businesses={businesses}
            categoryName={c.name}
            neighborhoods={neighborhoods}
            amenities={amenities}
          />
        ) : (
          <EmptyState categoryName={c.name} />
        )}
      </section>

      <section className="container-page" data-reveal="left">
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
        We're adding {categoryName} to the map.
      </p>
      <p className="mt-2 text-teal-500">
        Know a spot worth listing? Tell us — or list your own for $25/month.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <Link href="/get-listed" className="btn-primary">Get listed</Link>
        <Link href="/contact" className="btn-ghost">Suggest a business</Link>
      </div>
    </div>
  );
}
