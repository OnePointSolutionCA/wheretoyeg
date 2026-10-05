import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { breadcrumbSchema, itemListSchema, JsonLd } from "@/lib/schema-extra";
import { ListingIndex } from "@/components/ListingIndex";
import { AREA_INTRO, areaFromSlug, hubsForArea } from "@/lib/areas";
import { CATEGORY_HEADING, fitTitle, listJoin, metaDescription, nf } from "@/lib/seo";
import { FilterableList } from "@/components/FilterBar";
import { toCard } from "@/lib/slim";
import { getCategories } from "@/lib/content";
import { neighborhoodStats } from "@/lib/neighborhoods";
import { areaSlug, areaTitle, placeLabel } from "@/lib/place";

const toSlug = areaSlug;

/** Categories people search by town first, so titles lead with them when the area has enough. */
const TITLE_ORDER = ["restaurants", "activities-fun", "cafes-coffee-shops", "medical", "auto-repair", "barbers", "hair-salons", "gyms-fitness", "bakeries"];

export const revalidate = 3600;

export async function generateStaticParams() {
  return SITE.neighborhoods.map((n) => ({ slug: toSlug(n) }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const name = areaFromSlug(params.slug);
  if (!name) return {};
  const { businesses, topCategories, cover } = neighborhoodStats(name);
  const where = areaTitle(name);
  const counts = new Map(topCategories.map((c) => [c.slug, c.count]));
  const lead = TITLE_ORDER.filter((slug) => (counts.get(slug) ?? 0) >= 5).map((slug) => CATEGORY_HEADING[slug]);
  const title = fitTitle([
    `Best of ${where} | ${lead.slice(0, 3).join(", ")} & More`,
    `Best of ${where} | ${lead.slice(0, 2).join(", ")} & More`,
    `Best of ${where} | ${nf(businesses.length)} Local Businesses`,
    `Best of ${where}`,
  ].filter((t) => !/\|\s+&/.test(t)));
  const desc = metaDescription(
    [
      `The best local businesses in ${placeLabel(name)}: ${nf(businesses.length)} spots including ${listJoin(topCategories.slice(0, 3).map((c) => (CATEGORY_HEADING[c.slug] ?? c.name).toLowerCase()))}.`,
      "Ratings, hours, photos and directions.",
    ],
    ["Free to browse on WhereToYEG.", "Filter by open now."],
  );
  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical: `${SITE.url}/neighborhoods/${toSlug(name)}` },
    openGraph: { title, description: desc, images: cover ? [cover] : ["/og.png"] },
  };
}

export default function NeighborhoodPage({ params }: { params: { slug: string } }) {
  const name = areaFromSlug(params.slug);
  if (!name) notFound();
  const { businesses, topCategories, cover, avgRating, reviews, photo } = neighborhoodStats(name);
  const cats = Object.fromEntries(getCategories().map((c) => [c.slug, c.name]));
  const others = SITE.neighborhoods.filter((n) => n !== name);
  const hubs = new Map(hubsForArea(name).map((h) => [h.slug, h.href]));

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", href: "/" },
        { name: "Neighborhoods", href: "/neighborhoods" },
        { name },
      ])} />
      {businesses.length > 0 && (
        <JsonLd
          data={itemListSchema(
            `Best local businesses in ${areaTitle(name)}`,
            `/neighborhoods/${toSlug(name)}`,
            businesses.map((b) => ({ name: b.name, href: `/${b.category}/${b.slug}` })),
          )}
        />
      )}
      <section className="relative overflow-hidden bg-teal text-white">
        {cover && <Image src={cover} alt={photo ? placeLabel(name) : ""} fill priority sizes="100vw" className={"object-cover " + (photo ? "opacity-60" : "opacity-40")} />}
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
            Best local businesses in <span className="text-coral">{name}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-white/85 sm:text-lg">
            {AREA_INTRO[name] ? `${AREA_INTRO[name]} ` : ""}
            {businesses.length
              ? `We list ${nf(businesses.length)} local business${businesses.length === 1 ? "" : "es"} in ${placeLabel(name)}${topCategories.length ? `, led by ${listJoin(topCategories.slice(0, 3).map((c) => `${(CATEGORY_HEADING[c.slug] ?? c.name).toLowerCase()} (${c.count})`))}` : ""}.`
              : `We're adding listings here now.`}
          </p>
          {businesses.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
              <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">{businesses.length} spots</span>
              {avgRating > 0 && <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">★ {avgRating.toFixed(1)} avg rating</span>}
              {reviews > 0 && <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">{reviews.toLocaleString("en-CA")} Google reviews</span>}
            </div>
          )}
        </div>
        {photo && (
          <p className="absolute bottom-3 right-4 z-10 text-[10px] text-white/60">
            Photo:{" "}
            <a href={photo.source} target="_blank" rel="noreferrer" className="underline decoration-white/30 hover:text-white">{photo.credit}</a>
            {photo.licenseUrl ? (
              <>
                {" · "}
                <a href={photo.licenseUrl} target="_blank" rel="noreferrer" className="underline decoration-white/30 hover:text-white">{photo.license}</a>
              </>
            ) : (
              <> · {photo.license}</>
            )}
          </p>
        )}
      </section>

      {topCategories.length > 1 && (
        <section className="border-b border-line bg-mist">
          <div className="container-page flex items-center gap-2 overflow-x-auto py-4" style={{ scrollbarWidth: "none" }}>
            <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-teal-300">In {name}:</span>
            {topCategories.map((c) => (
              <Link key={c.slug} href={hubs.get(c.slug) ?? `/${c.slug}?neighborhood=${encodeURIComponent(name)}`} className="chip shrink-0">
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

      <ListingIndex businesses={businesses} title={`Every business in ${name}, A to Z`} showArea={false} className="container-page" />

      <section className="container-page mb-20 mt-10">
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
