import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { breadcrumbSchema, JsonLd } from "@/lib/schema-extra";
import { FilterableList } from "@/components/FilterBar";
import { toCard } from "@/lib/slim";
import { getCategories } from "@/lib/content";
import { neighborhoodStats } from "@/lib/neighborhoods";
import { placeLabel } from "@/lib/place";
import { clip } from "@/lib/text";

function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, "-"); }

export const revalidate = 3600;

export async function generateStaticParams() {
  return SITE.neighborhoods.map((n) => ({ slug: toSlug(n) }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const name = SITE.neighborhoods.find((n) => toSlug(n) === params.slug);
  if (!name) return {};
  const { businesses, topCategories, cover } = neighborhoodStats(name);
  const desc = clip(
    `The best local businesses in ${name}, Edmonton: ${businesses.length} spots including ${topCategories.slice(0, 3).map((c) => c.name.toLowerCase()).join(", ")}. Ratings, hours, and directions on WhereToYEG.`,
    158,
  );
  return {
    title: `Best businesses in ${placeLabel(name)}`,
    description: desc,
    alternates: { canonical: `${SITE.url}/neighborhoods/${params.slug}` },
    openGraph: { title: `Best businesses in ${placeLabel(name)}`, description: desc, images: cover ? [cover] : ["/og.png"] },
  };
}

export default function NeighborhoodPage({ params }: { params: { slug: string } }) {
  const name = SITE.neighborhoods.find((n) => toSlug(n) === params.slug);
  if (!name) notFound();
  const { businesses, topCategories, cover, avgRating, reviews } = neighborhoodStats(name);
  const cats = Object.fromEntries(getCategories().map((c) => [c.slug, c.name]));
  const others = SITE.neighborhoods.filter((n) => n !== name);

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", href: "/" },
        { name: "Neighborhoods", href: "/neighborhoods" },
        { name },
      ])} />
      <section className="relative overflow-hidden bg-teal text-white">
        {cover && <Image src={cover} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/30" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-coral/20 blur-3xl" aria-hidden="true" />
        <div className="container-page relative py-14 sm:py-20" data-reveal="left">
          <nav className="flex flex-wrap items-center gap-x-1.5 text-xs text-white/70" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span aria-hidden>›</span>
            <Link href="/neighborhoods" className="hover:text-white">Neighborhoods</Link>
            <span aria-hidden>›</span>
            <span className="font-semibold text-white">{name}</span>
          </nav>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-coral-300">Neighborhood guide</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.05] tracking-tight drop-shadow-lg sm:text-6xl">
            Best of <span className="text-coral">{name}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-white/85 sm:text-lg">
            {businesses.length
              ? `${businesses.length} local business${businesses.length === 1 ? "" : "es"} in ${placeLabel(name)}${topCategories.length ? `, led by ${topCategories.slice(0, 3).map((c) => `${c.name.toLowerCase()} (${c.count})`).join(", ")}` : ""}.`
              : `${name} is on the map. We're adding listings here now.`}
          </p>
          {businesses.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
              <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">{businesses.length} spots</span>
              {avgRating > 0 && <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">★ {avgRating.toFixed(1)} avg rating</span>}
              {reviews > 0 && <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">{reviews.toLocaleString("en-CA")} Google reviews</span>}
            </div>
          )}
        </div>
      </section>

      {topCategories.length > 1 && (
        <section className="border-b border-line bg-mist">
          <div className="container-page flex items-center gap-2 overflow-x-auto py-4" style={{ scrollbarWidth: "none" }}>
            <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-teal-300">In {name}:</span>
            {topCategories.map((c) => (
              <Link key={c.slug} href={`/${c.slug}?neighborhood=${encodeURIComponent(name)}`} className="chip shrink-0">
                {c.name} <span className="text-teal-300">{c.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-10" data-reveal="right">
        {businesses.length > 0 ? (
          <FilterableList
            businesses={businesses.map(toCard)}
            categoryNames={cats}
            neighborhoods={[]}
            amenities={Array.from(new Set(businesses.flatMap((b) => b.amenities ?? []))).sort()}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-mist p-12 text-center">
            <p className="font-display text-2xl font-bold text-teal">Nothing here yet.</p>
            <p className="mt-2 text-teal-500">Know a spot in {name}? Send it our way.</p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/get-listed" className="btn-primary">List a business</Link>
              <Link href="/contact" className="btn-ghost">Suggest a spot</Link>
            </div>
          </div>
        )}
      </section>

      <section className="container-page mb-20 mt-6">
        <p className="eyebrow">Keep exploring</p>
        <h2 className="section-title mt-1">Other neighborhoods</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {others.map((n) => (
            <Link key={n} href={`/neighborhoods/${toSlug(n)}`} className="chip min-h-[40px]">{n}</Link>
          ))}
        </div>
      </section>
    </>
  );
}
