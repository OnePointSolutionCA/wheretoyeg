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

  return (
    <>
      <section className="border-b border-line bg-mist">
        <div className="container-page py-12" data-reveal="left">
          <nav className="text-xs text-teal-500">
            <Link href="/" className="hover:text-coral">Home</Link> <span className="px-1">›</span>{" "}
            <span className="font-semibold text-teal">{c.name}</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
            Best {c.name} in Edmonton
          </h1>
          <p className="mt-3 max-w-2xl text-teal-500">{c.description}</p>
          {c.intro && <p className="mt-4 max-w-2xl text-teal-500">{c.intro}</p>}
          {c.subcategories && c.subcategories.length > 0 && (
            <div className="mt-6">
              <SubcategoryPills
                categorySlug={c.slug}
                subcategories={c.subcategories}
                counts={subCounts}
              />
            </div>
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
