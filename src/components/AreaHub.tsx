import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Business, Category, Subcategory } from "@/lib/types";
import { FilterableList } from "@/components/FilterBar";
import { FaqSection } from "@/components/FaqSection";
import { RelatedGuides } from "@/components/RelatedGuides";
import { ListingIndex } from "@/components/ListingIndex";
import { breadcrumbSchema, itemListSchema, JsonLd } from "@/lib/schema-extra";
import { categoryFaq, subLabel, subNoun } from "@/lib/faq";
import { relatedPosts } from "@/lib/related";
import { toCard } from "@/lib/slim";
import { SITE } from "@/lib/site";
import { areaSlug, areaTitle, placeLabel } from "@/lib/place";
import {
  AREA_INTRO,
  HUB_INDEX,
  byRank,
  isRedundantSubHub,
  hubCount,
  hubHref,
  hubsForArea,
  hubsForCategory,
  subHubsForArea,
} from "@/lib/areas";
import { CATEGORY_HEADING, CATEGORY_PLURAL, fitTitle, listJoin, metaDescription, nf } from "@/lib/seo";

type HubProps = { category: Category; sub?: Subcategory; area: string; businesses: Business[] };

function labels(c: Category, sub: Subcategory | undefined, area: string) {
  const label = sub ? subLabel(c.slug, sub.name, sub.slug) : CATEGORY_HEADING[c.slug] ?? c.name;
  const noun = sub ? subNoun(c.slug, sub.name, sub.slug) : CATEGORY_PLURAL[c.slug] ?? c.name.toLowerCase();
  const path = hubHref(c.slug, area, sub?.slug);
  return { label, noun, path, where: areaTitle(area), whereFull: placeLabel(area) };
}

/** Best few, one per brand, with enough reviews to mean something. */
function topPicks(list: Business[], n = 3) {
  const seen = new Set<string>();
  const out: Business[] = [];
  for (const b of [...list].filter((x) => x.rating > 0 && x.review_count >= 5).sort(byRank)) {
    const brand = b.name.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).slice(0, 2).join(" ");
    if (seen.has(brand)) continue;
    seen.add(brand);
    out.push(b);
    if (out.length >= n) break;
  }
  return out;
}

export function areaHubMetadata({ category: c, sub, area, businesses }: HubProps): Metadata {
  const { label, noun, path, where, whereFull } = labels(c, sub, area);
  const n = businesses.length;
  const title = fitTitle([
    `Best ${label} in ${where} | ${n} Local Spots | WhereToYEG`,
    `Best ${label} in ${where} | ${n} Local Spots`,
    `Best ${label} in ${where} (${n} Spots)`,
    `${label} in ${where} | ${n} Spots`,
    `${label} in ${where}`,
  ]);
  const picks = topPicks(businesses);
  const description = metaDescription(
    [
      `Looking for ${noun} in ${whereFull}? Compare ${n} local ${n === 1 ? "spot" : "spots"} ranked by Google rating, with hours, photos and directions.`,
      picks.length >= 2 ? `Top rated right now: ${listJoin(picks.map((b) => b.name))}.` : "",
    ],
    ["Filter by price, rating or open now.", "Filter by rating or open now.", "Filter by open now.", "Free to browse.", "No sign up."],
  );
  const canonical = sub && isRedundantSubHub(c.slug, sub.slug, area) ? hubHref(c.slug, area) : path;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE.url}${canonical}` },
    openGraph: { title, description, images: [`/photos/_hero/${c.slug}.jpg`] },
    ...(n < HUB_INDEX ? { robots: { index: false, follow: true } } : {}),
  };
}

export function AreaHub({ category: c, sub, area, businesses }: HubProps) {
  const { label, noun, path, where, whereFull } = labels(c, sub, area);
  const ranked = [...businesses].sort(byRank);
  const n = ranked.length;
  const picks = topPicks(ranked);
  const rated = ranked.filter((b) => b.rating > 0 && b.review_count > 0);
  const avg = rated.length ? rated.reduce((s, b) => s + Number(b.rating), 0) / rated.length : 0;
  const reviews = rated.reduce((s, b) => s + Number(b.review_count), 0);
  const halal = ranked.filter((b) => b.amenities?.includes("Halal")).length;
  const amenities = Array.from(new Set(ranked.flatMap((b) => b.amenities ?? []))).sort();

  // Subcategory mix inside this area, for the intro and the chips.
  const subNames = new Map((c.subcategories ?? []).map((s) => [s.slug, s.name]));
  const subMix = !sub
    ? [...ranked.reduce((m, b) => (b.subcategory ? m.set(b.subcategory, (m.get(b.subcategory) ?? 0) + 1) : m), new Map<string, number>())]
        .sort((a, b) => b[1] - a[1])
        .filter(([slug]) => subNames.has(slug))
    : [];
  const subHubs = sub ? subHubsForArea(c.slug, area).filter((s) => s.slug !== sub.slug) : subHubsForArea(c.slug, area);
  const otherAreas = hubsForCategory(c.slug, sub?.slug).filter((x) => x.area !== area);
  const otherCats = hubsForArea(area).filter((x) => x.slug !== c.slug);
  const parentHub = sub && hubCount(c.slug, area) >= 3 ? hubHref(c.slug, area) : undefined;
  const cityPath = sub ? `/${c.slug}/${sub.slug}` : `/${c.slug}`;
  const areaPage = `/neighborhoods/${areaSlug(area)}`;

  const intro = [
    AREA_INTRO[area],
    `We list ${nf(n)} ${noun} in ${whereFull}, ranked by Google rating and review volume.`,
    picks.length >= 2
      ? `Top rated right now: ${listJoin(picks.map((b) => `${b.name} (${Number(b.rating).toFixed(1)}★, ${nf(b.review_count)} reviews)`))}.`
      : "",
    subMix.length >= 2
      ? `Most common here: ${listJoin(subMix.slice(0, 3).map(([slug, count]) => `${subNames.get(slug)} (${count})`))}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: c.name, href: `/${c.slug}` },
    ...(sub ? [{ name: sub.name, href: `/${c.slug}/${sub.slug}` }] : []),
    { name: area },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd
        data={itemListSchema(
          `Best ${label} in ${where}`,
          path,
          ranked.map((b) => ({ name: b.name, href: `/${b.category}/${b.slug}` })),
        )}
      />

      <section className="relative overflow-hidden bg-teal text-white">
        <Image src={`/photos/_hero/${c.slug}.jpg`} alt="" fill priority sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35" aria-hidden="true" />
        <div className="container-page relative py-14 sm:py-20" data-reveal="left">
          <nav className="flex flex-wrap items-center gap-x-1.5 text-xs text-white/70" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span aria-hidden>›</span>
            <Link href={`/${c.slug}`} className="hover:text-white">{c.name}</Link>
            {sub && (
              <>
                <span aria-hidden>›</span>
                <Link href={`/${c.slug}/${sub.slug}`} className="hover:text-white">{sub.name}</Link>
              </>
            )}
            <span aria-hidden>›</span>
            <span className="font-semibold text-white">{area}</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight drop-shadow-lg sm:text-6xl">
            Best {label}
            <br className="hidden sm:block" /> <span className="text-coral">in {where}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-white/85 sm:text-lg">{intro}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
            <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">{n} {n === 1 ? "spot" : "spots"}</span>
            {avg > 0 && <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">★ {avg.toFixed(1)} avg rating</span>}
            {reviews > 0 && <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">{nf(reviews)} Google reviews</span>}
            {halal > 0 && <span className="rounded-full bg-coral/90 px-3 py-1.5">{halal} halal</span>}
          </div>
        </div>
      </section>

      {(subHubs.length > 0 || parentHub) && (
        <section className="border-b border-line bg-mist">
          <div className="container-page flex items-center gap-2 overflow-x-auto py-4" style={{ scrollbarWidth: "none" }}>
            <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-teal-300">In {area}:</span>
            {parentHub && (
              <Link href={parentHub} className="chip shrink-0">
                All {(CATEGORY_HEADING[c.slug] ?? c.name).toLowerCase()} <span className="text-teal-300">{hubCount(c.slug, area)}</span>
              </Link>
            )}
            {subHubs.map((s) => (
              <Link key={s.slug} href={s.href} className="chip shrink-0">
                {s.name} <span className="text-teal-300">{s.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-10" data-reveal="right">
        <FilterableList businesses={ranked.map(toCard)} categoryName={c.name} neighborhoods={[]} amenities={amenities} />
      </section>

      <ListingIndex businesses={ranked} title={`${label} in ${where}, A to Z`} showArea={false} className="container-page" />

      <section className="container-page mt-12">
        <div className="grid gap-6 lg:grid-cols-2">
          {otherAreas.length > 0 && (
            <div className="rounded-2xl border border-line bg-mist p-6">
              <p className="eyebrow">{label} nearby</p>
              <h2 className="mt-1 font-display text-xl font-bold text-teal">{label} in other areas</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {otherAreas.map((x) => (
                  <Link key={x.area} href={x.href} className="chip">
                    {x.area} <span className="text-teal-300">{x.count}</span>
                  </Link>
                ))}
                <Link href={cityPath} className="chip">All of Edmonton</Link>
              </div>
            </div>
          )}
          <div className="rounded-2xl border border-line bg-mist p-6">
            <p className="eyebrow">More in {area}</p>
            <h2 className="mt-1 font-display text-xl font-bold text-teal">Other local spots in {where}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {otherCats.map((x) => (
                <Link key={x.slug} href={x.href} className="chip">
                  {CATEGORY_HEADING[x.slug] ?? x.name} <span className="text-teal-300">{x.count}</span>
                </Link>
              ))}
              <Link href={areaPage} className="chip">Everything in {area}</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-12 bg-mist pb-14 pt-2 sm:pb-20">
        <RelatedGuides posts={relatedPosts(c.slug)} title="Related Edmonton guides" />
        <FaqSection
          title={`${label} in ${where}: FAQ`}
          items={categoryFaq(c, ranked, { noun, basePath: path, place: area, placeFull: whereFull })}
        />
      </div>
    </>
  );
}
