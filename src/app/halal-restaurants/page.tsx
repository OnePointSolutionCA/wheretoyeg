import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusinesses, getBusinessesByCategory, getCategoryBySlug } from "@/lib/content";
import { getBlogPosts } from "@/lib/blog";
import { FilterableList } from "@/components/FilterBar";
import { FaqSection, type FaqEntry } from "@/components/FaqSection";
import { RelatedGuides } from "@/components/RelatedGuides";
import { ListingIndex } from "@/components/ListingIndex";
import { breadcrumbSchema, itemListSchema, JsonLd } from "@/lib/schema-extra";
import { byRank, hubCount, hubHref } from "@/lib/areas";
import { fitTitle, listJoin, metaDescription, nf } from "@/lib/seo";
import { toCard } from "@/lib/slim";
import { SITE } from "@/lib/site";

/** One indexable page for the site's biggest niche: every restaurant marked halal. */

export const revalidate = 3600;

const PATH = "/halal-restaurants";

function halalRestaurants() {
  return getBusinessesByCategory("restaurants")
    .filter((b) => b.amenities?.includes("Halal"))
    .sort(byRank);
}

/** One pick per brand so chain branches don't fill the list. */
function distinct<T extends { name: string }>(list: T[], n: number) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const b of list) {
    const brand = b.name.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).slice(0, 2).join(" ");
    if (seen.has(brand)) continue;
    seen.add(brand);
    out.push(b);
    if (out.length >= n) break;
  }
  return out;
}

export function generateMetadata(): Metadata {
  const list = halalRestaurants();
  const n = list.length;
  const title = fitTitle([
    `Halal Restaurants in Edmonton | ${n} Spots Ranked | WhereToYEG`,
    `Halal Restaurants in Edmonton | ${n} Spots Ranked by Reviews`,
    `Halal Restaurants in Edmonton | ${n} Spots Ranked`,
  ]);
  const description = metaDescription(
    [
      `Find halal restaurants in Edmonton: shawarma, Pakistani, Afghan, burgers, pizza and more. Compare ${n} spots by Google rating, with hours and directions.`,
    ],
    ["Free to browse.", "Updated as new reviews come in."],
  );
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE.url}${PATH}` },
    openGraph: { title, description, images: ["/photos/_hero/restaurants.jpg"] },
  };
}

export default function HalalRestaurantsPage() {
  const cat = getCategoryBySlug("restaurants");
  if (!cat) notFound();
  const list = halalRestaurants();
  const n = list.length;
  const all = getBusinesses();
  const subNames = new Map((cat.subcategories ?? []).map((s) => [s.slug, s.name]));

  const cuisines = [...list.reduce((m, b) => (b.subcategory ? m.set(b.subcategory, (m.get(b.subcategory) ?? 0) + 1) : m), new Map<string, number>())]
    .filter(([slug]) => subNames.has(slug))
    .sort((a, b) => b[1] - a[1]);
  const areas = [...list.reduce((m, b) => (SITE.neighborhoods.includes(b.neighborhood) ? m.set(b.neighborhood, (m.get(b.neighborhood) ?? 0) + 1) : m), new Map<string, number>())]
    .sort((a, b) => b[1] - a[1]);

  const rated = list.filter((b) => b.rating > 0 && b.review_count > 0);
  const avg = rated.length ? rated.reduce((s, b) => s + Number(b.rating), 0) / rated.length : 0;
  const reviews = rated.reduce((s, b) => s + Number(b.review_count), 0);
  const top = distinct(list.filter((b) => b.review_count >= 20), 3);
  const sunday = list.filter((b) => b.hours?.sunday && !/closed/i.test(b.hours.sunday));
  const halalMeat = all.filter((b) => b.category === "grocery-markets" && b.subcategory === "halal-meat");
  const halalBakeries = all.filter((b) => b.category === "bakeries" && b.amenities?.includes("Halal"));
  const amenities = Array.from(new Set(list.flatMap((b) => b.amenities ?? []))).sort();
  const guides = getBlogPosts().filter((p) => p.slug.includes("halal") || p.tags?.includes("halal")).slice(0, 3);

  const faq: FaqEntry[] = [
    ...(top.length >= 2
      ? [{
          q: "What are the best halal restaurants in Edmonton?",
          a: `Ranked by Google rating and review volume, the top halal restaurants on WhereToYEG right now are ${listJoin(top.map((b) => `${b.name} (${Number(b.rating).toFixed(1)}★, ${nf(b.review_count)} reviews)`))}. Ratings refresh as new reviews come in.`,
          links: top.map((b) => ({ label: b.name, href: `/${b.category}/${b.slug}` })),
        }]
      : []),
    {
      q: "How many halal restaurants are in Edmonton?",
      a: `WhereToYEG lists ${nf(n)} restaurants marked halal across Edmonton and nearby towns${cuisines.length >= 3 ? `. The most common are ${listJoin(cuisines.slice(0, 3).map(([slug, c]) => `${subNames.get(slug)} (${c})`))}` : ""}.`,
      links: cuisines.slice(0, 4).map(([slug]) => ({ label: `Halal ${subNames.get(slug)}`, href: `/restaurants/${slug}?amenity=Halal` })),
    },
    ...(sunday.length >= 3
      ? [{
          q: "Which halal restaurants are open on Sunday?",
          a: `${nf(sunday.length)} of the halal restaurants listed here show Sunday hours, including ${listJoin(distinct(sunday, 3).map((b) => `${b.name} (${b.hours.sunday})`))}. Hours change, so check the listing or call ahead.`,
          links: distinct(sunday, 3).map((b) => ({ label: b.name, href: `/${b.category}/${b.slug}` })),
        }]
      : []),
    {
      q: "Is every restaurant on this page halal certified?",
      a: "Every restaurant here is marked halal on WhereToYEG. Halal status and suppliers can change, so if certification matters to you, confirm it with the restaurant directly before you go.",
    },
    ...(halalMeat.length >= 2
      ? [{
          q: "Where can I buy halal meat in Edmonton?",
          a: `We list ${nf(halalMeat.length)} halal butchers and meat shops in and around Edmonton. Our halal meat market guide covers what each one is known for.`,
          links: [
            { label: "Halal butchers", href: "/grocery-markets/halal-meat" },
            { label: "Halal meat market guide", href: "/blog/halal-meat-markets-edmonton" },
          ],
        }]
      : []),
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", href: "/" },
          { name: "Restaurants", href: "/restaurants" },
          { name: "Halal Restaurants" },
        ])}
      />
      <JsonLd data={itemListSchema("Halal restaurants in Edmonton", PATH, list.map((b) => ({ name: b.name, href: `/${b.category}/${b.slug}` })))} />

      <section className="relative overflow-hidden bg-teal text-white">
        <Image src="/photos/_hero/restaurants.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35" aria-hidden="true" />
        <div className="container-page relative py-14 sm:py-20" data-reveal="left">
          <nav className="flex flex-wrap items-center gap-x-1.5 text-xs text-white/70" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span aria-hidden>›</span>
            <Link href="/restaurants" className="hover:text-white">Restaurants</Link>
            <span aria-hidden>›</span>
            <span className="font-semibold text-white">Halal</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight drop-shadow-lg sm:text-6xl">
            Halal Restaurants
            <br className="hidden sm:block" /> <span className="text-coral">in Edmonton</span>
          </h1>
          <p className="mt-4 max-w-2xl text-white/85 sm:text-lg">
            Every restaurant on this page is marked halal on WhereToYEG. We rank them by Google rating and review volume, so the places
            people keep going back to sit at the top.
            {cuisines.length >= 3 &&
              ` The biggest groups here are ${listJoin(cuisines.slice(0, 3).map(([slug]) => subNames.get(slug) ?? slug))}.`}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
            <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">{n} spots</span>
            {avg > 0 && <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">★ {avg.toFixed(1)} avg rating</span>}
            {reviews > 0 && <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">{nf(reviews)} Google reviews</span>}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-mist">
        <div className="container-page space-y-3 py-5">
          <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-teal-300">By cuisine:</span>
            {cuisines.map(([slug, count]) => (
              <Link key={slug} href={`/restaurants/${slug}?amenity=Halal`} className="chip shrink-0">
                {subNames.get(slug)} <span className="text-teal-300">{count}</span>
              </Link>
            ))}
          </div>
          {areas.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-teal-300">By area:</span>
              {areas.map(([area, count]) => (
                <Link
                  key={area}
                  href={hubCount("restaurants", area) >= 3 ? `${hubHref("restaurants", area)}?amenity=Halal` : `/restaurants?amenity=Halal&neighborhood=${encodeURIComponent(area)}`}
                  className="chip shrink-0"
                >
                  {area} <span className="text-teal-300">{count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-10" data-reveal="right">
        <FilterableList
          businesses={list.map(toCard)}
          categoryName="Restaurants"
          neighborhoods={Array.from(new Set(list.map((b) => b.neighborhood))).filter(Boolean).sort()}
          amenities={amenities}
        />
      </section>

      <ListingIndex businesses={list} title="Halal restaurants in Edmonton, A to Z" className="container-page" />

      <section className="container-page mt-12">
        <div className="rounded-2xl border border-line bg-mist p-6">
          <p className="eyebrow">More halal in Edmonton</p>
          <h2 className="mt-1 font-display text-xl font-bold text-teal">Butchers, bakeries and caterers</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {halalMeat.length > 0 && <Link href="/grocery-markets/halal-meat" className="chip">Halal butchers <span className="text-teal-300">{halalMeat.length}</span></Link>}
            {halalBakeries.length > 0 && <Link href="/bakeries?amenity=Halal" className="chip">Halal bakeries <span className="text-teal-300">{halalBakeries.length}</span></Link>}
            <Link href="/catering/halal-catering" className="chip">Halal catering</Link>
            <Link href="/collections/halal-foodie-tour" className="chip">Halal foodie tour</Link>
            <Link href="/blog/halal-food-guide-edmonton-2026" className="chip">Halal food guide</Link>
          </div>
        </div>
      </section>

      <div className="mt-12 bg-mist pb-14 pt-2 sm:pb-20">
        <RelatedGuides posts={guides} title="Halal guides for Edmonton" />
        <FaqSection title="Halal restaurants in Edmonton: FAQ" items={faq} />
      </div>
    </>
  );
}
