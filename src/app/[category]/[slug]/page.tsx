import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getBusinesses,
  getBusiness,
  getCategories,
  getCategoryBySlug,
  getBusinessesByCategory,
  getBusinessesBySubcategory,
  getSubcategory,
  countBySubcategory,
} from "@/lib/content";
import { StarRating } from "@/components/StarRating";
import { OpenNowBadge } from "@/components/OpenNowBadge";
import { BusinessGallery } from "@/components/BusinessGallery";
import { BusinessHours } from "@/components/BusinessHours";
import { QuickActions, MobileActionBar } from "@/components/QuickActions";
import { CheckIcon, ClockIcon, GlobeIcon, InfoIcon, MailIcon, NavIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { ReviewCard } from "@/components/ReviewCard";
import { BusinessCard } from "@/components/BusinessCard";
import { RelatedGuides } from "@/components/RelatedGuides";
import { relatedPosts } from "@/lib/related";
import { FilterableList } from "@/components/FilterBar";
import { SubcategoryPills } from "@/components/SubcategoryPills";
import { businessSchema } from "@/lib/schema";
import { breadcrumbSchema, JsonLd } from "@/lib/schema-extra";
import { deliveryLinks } from "@/lib/delivery";
import { SITE } from "@/lib/site";
import { placeLabel } from "@/lib/place";
import { clip } from "@/lib/text";

const FOOD_CATEGORIES = new Set(["restaurants", "cafes-coffee-shops", "bakeries", "catering", "grocery-markets"]);

/**
 * The [category]/[slug] route serves two things:
 *   1. Subcategory listing pages, e.g. /medical/pharmacies or /restaurants/burgers
 *   2. Premium business detail pages, e.g. /barbers/fades-by-mike
 *
 * We check the subcategory first; if no match, we look for a business by slug.
 */

export const revalidate = 3600;

export async function generateStaticParams() {
  const params: { category: string; slug: string }[] = [];
  // Subcategory URLs
  for (const c of getCategories()) {
    for (const s of c.subcategories ?? []) {
      params.push({ category: c.slug, slug: s.slug });
    }
  }
  // Business detail URLs (every business, not just premium)
  for (const b of getBusinesses()) {
    params.push({ category: b.category, slug: b.slug });
  }
  return params;
}

export async function generateMetadata({ params }: { params: { category: string; slug: string } }): Promise<Metadata> {
  const cat = getCategoryBySlug(params.category);
  if (!cat) return {};
  const sub = getSubcategory(params.category, params.slug);
  if (sub) {
    const title = `Best ${sub.name} in Edmonton | ${sub.name} near me`;
    const desc = `Find the best ${sub.name.toLowerCase()} in Edmonton. Local, hand-picked ${cat.name.toLowerCase()} listings — hours, addresses, ratings and directions.`;
    return {
      title,
      description: desc,
      keywords: [
        `best ${sub.name.toLowerCase()} Edmonton`,
        `${sub.name.toLowerCase()} near me Edmonton`,
        `${sub.name.toLowerCase()} YEG`,
        `top ${sub.name.toLowerCase()} Edmonton`,
      ],
      alternates: { canonical: `${SITE.url}/${cat.slug}/${sub.slug}` },
      openGraph: { title, description: desc, images: ["/og.png"] },
    };
  }
  const b = getBusiness(params.slug);
  if (!b) return {};
  const subName = b.subcategory
    ? cat.subcategories?.find((s) => s.slug === b.subcategory)?.name
    : undefined;
  const service = subName || cat.name;
  const place = placeLabel(b.neighborhood);
  const title = `${b.name} — ${service} in ${place}`;
  const desc = clip(
    b.description.startsWith(b.name) ? b.description : `${b.name}: ${service.toLowerCase()} in ${place}. ${b.description}`,
    158,
  );
  return {
    title,
    description: desc,
    keywords: [
      `${b.name} Edmonton`,
      `${service} Edmonton`,
      `${service} near me`,
      `best ${service.toLowerCase()} Edmonton`,
      `${placeLabel(b.neighborhood)} ${service.toLowerCase()}`,
    ],
    alternates: { canonical: `${SITE.url}/${b.category}/${b.slug}` },
    openGraph: {
      title,
      description: desc,
      type: "website",
      images: b.photos?.[0] ? [b.photos[0]] : b.logo ? [b.logo] : ["/og.png"],
    },
  };
}

export default function CategoryOrBusinessPage({ params }: { params: { category: string; slug: string } }) {
  const cat = getCategoryBySlug(params.category);
  if (!cat) notFound();

  // Subcategory view?
  const sub = getSubcategory(params.category, params.slug);
  if (sub) return <SubcategoryView category={cat} sub={sub} />;

  // Business detail view?
  const b = getBusiness(params.slug);
  if (b && b.category === params.category) return <BusinessView business={b} category={cat} />;

  notFound();
}

// ---------------- Subcategory view ----------------

function SubcategoryView({ category: c, sub }: { category: ReturnType<typeof getCategoryBySlug> & {}; sub: { name: string; slug: string } }) {
  const businesses = getBusinessesBySubcategory(c.slug, sub.slug);
  const subCounts = countBySubcategory(c.slug);
  const neighborhoods = Array.from(new Set(businesses.map((b) => b.neighborhood))).filter(Boolean).sort();
  const amenities = Array.from(new Set(businesses.flatMap((b) => b.amenities ?? []))).sort();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", href: "/" },
        { name: c.name, href: `/${c.slug}` },
        { name: sub.name },
      ])} />
      <section className="border-b border-line bg-mist">
        <div className="container-page py-12" data-reveal="left">
          <nav className="text-xs text-teal-500">
            <Link href="/" className="hover:text-coral">Home</Link> <span className="px-1">›</span>{" "}
            <Link href={`/${c.slug}`} className="hover:text-coral">{c.name}</Link>{" "}
            <span className="px-1">›</span>{" "}
            <span className="font-semibold text-teal">{sub.name}</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
            Best {sub.name} in Edmonton
          </h1>
          <p className="mt-3 max-w-2xl text-teal-500">
            {sub.name} across Edmonton — filtered from {c.name.toLowerCase()} listed on WhereToYEG.
          </p>
          {c.subcategories && (
            <div className="mt-6">
              <SubcategoryPills
                categorySlug={c.slug}
                subcategories={c.subcategories}
                activeSlug={sub.slug}
                counts={subCounts}
              />
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-10">
        {businesses.length > 0 ? (
          <FilterableList
            businesses={businesses}
            categoryName={c.name}
            neighborhoods={neighborhoods}
            amenities={amenities}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-mist p-12 text-center">
            <p className="font-display text-2xl font-bold text-teal">
              No {sub.name.toLowerCase()} listed yet.
            </p>
            <p className="mt-2 text-teal-500">Know one worth adding? Send it our way.</p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/get-listed" className="btn-primary">Get listed</Link>
              <Link href={`/${c.slug}`} className="btn-ghost">See all {c.name}</Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

// ---------------- Business detail view ----------------

const card = "rounded-2xl border border-line bg-white shadow-card";

function BusinessView({ business: b, category: cat }: { business: ReturnType<typeof getBusiness> & {}; category: ReturnType<typeof getCategoryBySlug> & {} }) {
  const subName = b.subcategory
    ? cat.subcategories?.find((s) => s.slug === b.subcategory)?.name
    : undefined;
  const others = getBusinessesByCategory(cat.slug).filter((x) => x.slug !== b.slug);
  const similar = [
    ...others.filter((x) => b.subcategory && x.subcategory === b.subcategory),
    ...others.filter((x) => x.neighborhood === b.neighborhood && x.subcategory !== b.subcategory),
    ...others,
  ]
    .filter((x, i, arr) => arr.findIndex((y) => y.slug === x.slug) === i)
    .slice(0, 3);
  const place = placeLabel(b.neighborhood);
  const delivery = deliveryLinks(b);
  const socials = [
    b.instagram && { label: "Instagram", href: b.instagram },
    b.facebook && { label: "Facebook", href: b.facebook },
    b.tiktok && { label: "TikTok", href: b.tiktok },
  ].filter(Boolean) as { label: string; href: string }[];

  const breadcrumbLinks = [
    { name: "Home", href: "/" },
    { name: cat.name, href: `/${b.category}` },
    ...(subName && b.subcategory ? [{ name: subName, href: `/${b.category}/${b.subcategory}` }] : []),
    { name: b.name },
  ];

  return (
    <>
      <JsonLd data={businessSchema(b)} />
      <JsonLd data={breadcrumbSchema(breadcrumbLinks)} />

      {/* HEADER */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-mist to-white">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-coral/10 blur-3xl" aria-hidden="true" />
        <div className="container-page relative pb-8 pt-6 sm:pb-10 sm:pt-8">
          <nav className="flex flex-wrap items-center gap-x-1.5 text-xs text-teal-300" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-coral">Home</Link>
            <span aria-hidden>›</span>
            <Link href={`/${b.category}`} className="hover:text-coral">{cat.name}</Link>
            {subName && b.subcategory && (
              <>
                <span aria-hidden>›</span>
                <Link href={`/${b.category}/${b.subcategory}`} className="hover:text-coral">{subName}</Link>
              </>
            )}
            <span aria-hidden>›</span>
            <span className="font-semibold text-teal">{b.name}</span>
          </nav>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-start gap-4 sm:gap-5">
              {b.logo && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-line bg-white shadow-card sm:h-24 sm:w-24">
                  <Image src={b.logo} alt="" fill sizes="96px" className="object-contain p-2" />
                </div>
              )}
              <div className="min-w-0">
                <p className="eyebrow flex flex-wrap items-center gap-2">
                  {subName ?? cat.name}
                  {b.tier === "premium" && <span className="badge-premium">Premium</span>}
                </p>
                <h1 className="mt-1.5 font-display text-3xl font-extrabold leading-tight tracking-tight text-teal sm:text-5xl">
                  {b.name}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  {b.rating > 0 && b.review_count > 0 ? (
                    <a href="#reviews" className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-line bg-white px-3 shadow-sm transition hover:border-teal-300">
                      <StarRating value={b.rating} count={b.review_count} compact />
                      <span className="font-bold text-teal">{b.rating.toFixed(1)}</span>
                      <span className="text-teal-300">({b.review_count.toLocaleString("en-CA")})</span>
                    </a>
                  ) : (
                    <StarRating value={0} />
                  )}
                  <span className="inline-flex min-h-[32px] items-center rounded-full border border-line bg-white px-3 font-semibold text-teal shadow-sm">{b.price_range}</span>
                  <span className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-line bg-white px-3 text-teal shadow-sm">
                    <PinIcon size={14} className="text-coral" /> {place}
                  </span>
                  <span className="inline-flex min-h-[32px] items-center rounded-full border border-line bg-white px-3 shadow-sm">
                    <OpenNowBadge hours={b.hours} />
                  </span>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <QuickActions b={b} />
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="container-page mt-6 sm:mt-8">
        <BusinessGallery photos={b.photos} name={b.name} logo={b.logo} categoryName={cat.name} slug={b.slug} />
      </section>

      {/* BODY */}
      <section className="container-page mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <div className="min-w-0 space-y-8">
          <div className={card + " p-6 sm:p-8"}>
            <h2 className="font-display text-2xl font-bold text-teal">About {b.name}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-teal-500">{b.description}</p>

            {b.amenities?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-teal-300">Amenities & features</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {b.amenities.map((a) => (
                    <li key={a} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-sm font-medium text-teal">
                      <CheckIcon className="text-coral" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {b.tags?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {b.tags.map((t) => (
                  <span key={t} className="text-xs text-teal-300">#{t}</span>
                ))}
              </div>
            )}

            {FOOD_CATEGORIES.has(b.category) && (
              <p className="mt-6 flex gap-2.5 border-t border-line pt-5 text-sm text-teal-500">
                <InfoIcon className="mt-0.5 shrink-0 text-teal-300" />
                <span>Have dietary needs or allergies? Call ahead to confirm ingredients and preparation. Menus can change without notice.</span>
              </p>
            )}
          </div>

          <div id="reviews" className="scroll-mt-28">
            <div className={card + " flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"}>
              <div className="flex items-center gap-5">
                <div className="font-display text-6xl font-extrabold leading-none tracking-tight text-teal">
                  {b.rating > 0 ? b.rating.toFixed(1) : "—"}
                </div>
                <div>
                  {b.rating > 0 && b.review_count > 0 && <StarRating value={b.rating} count={b.review_count} size={18} compact />}
                  <div className="mt-1.5 font-semibold text-teal">
                    {b.review_count > 0 ? `${b.review_count.toLocaleString("en-CA")} Google review${b.review_count === 1 ? "" : "s"}` : "No reviews yet"}
                  </div>
                  <div className="mt-0.5 text-xs text-teal-300">Ratings from Google Maps</div>
                </div>
              </div>
              {b.google_maps_url && (
                <div className="flex flex-wrap gap-2">
                  <a href={b.google_maps_url} target="_blank" rel="noreferrer" className="btn-primary min-h-[44px] text-sm">
                    Read all reviews
                  </a>
                  <a href={b.google_maps_url} target="_blank" rel="noreferrer" className="btn-ghost min-h-[44px] text-sm">
                    Write a review
                  </a>
                </div>
              )}
            </div>

            {b.reviews?.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {b.reviews.map((r, i) => (
                  <ReviewCard key={i} review={r} />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <aside className="min-w-0">
          <div className="space-y-4 lg:sticky lg:top-28">
            <div className={card + " divide-y divide-line"}>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-teal">
                    <ClockIcon className="text-coral" /> Hours
                  </h2>
                  <OpenNowBadge hours={b.hours} />
                </div>
                <div className="mt-3">
                  <BusinessHours hours={b.hours} />
                </div>
              </div>

              <div className="p-5">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-teal">
                  <PinIcon className="text-coral" /> Location
                </h2>
                <p className="mt-2 text-sm text-teal-500">{b.address}</p>
                {!/,\s*(AB|Alberta)\b/i.test(b.address ?? "") && <p className="text-sm text-teal-500">Edmonton, AB</p>}
                {b.latitude && b.longitude && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-line">
                    <iframe
                      title={`${b.name} map`}
                      className="h-44 w-full"
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${b.longitude - 0.005},${b.latitude - 0.003},${b.longitude + 0.005},${b.latitude + 0.003}&layer=mapnik&marker=${b.latitude},${b.longitude}`}
                    />
                  </div>
                )}
                {b.google_maps_url && (
                  <a href={b.google_maps_url} target="_blank" rel="noreferrer" className="btn-ghost mt-3 min-h-[44px] w-full gap-2 text-sm">
                    <NavIcon /> Get directions
                  </a>
                )}
              </div>

              {(b.phone || b.email || b.website || socials.length > 0) && (
                <div className="p-5">
                  <h2 className="font-display text-lg font-bold text-teal">Contact</h2>
                  <ul className="mt-2 space-y-1 text-sm">
                    {b.phone && (
                      <li>
                        <a href={`tel:${b.phone}`} className="flex min-h-[40px] items-center gap-2.5 font-semibold text-teal hover:text-coral">
                          <PhoneIcon className="text-teal-300" /> {b.phone}
                        </a>
                      </li>
                    )}
                    {b.email && (
                      <li>
                        <a href={`mailto:${b.email}`} className="flex min-h-[40px] items-center gap-2.5 break-all text-teal hover:text-coral">
                          <MailIcon className="shrink-0 text-teal-300" /> {b.email}
                        </a>
                      </li>
                    )}
                    {b.website && (
                      <li>
                        <a href={b.website} target="_blank" rel="noreferrer" className="flex min-h-[40px] items-center gap-2.5 text-teal hover:text-coral">
                          <GlobeIcon className="text-teal-300" /> {displayUrl(b.website)}
                        </a>
                      </li>
                    )}
                  </ul>
                  {socials.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {socials.map((s) => (
                        <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="chip min-h-[36px]">
                          {s.label} <span aria-hidden>↗</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {delivery.length > 0 && (
              <div className={card + " p-5"}>
                <h2 className="font-display text-lg font-bold text-teal">Order delivery</h2>
                <div className="mt-3 flex flex-col gap-2">
                  {delivery.map((d) => (
                    <a
                      key={d.label}
                      href={d.href}
                      target="_blank"
                      rel="noreferrer"
                      className={"flex min-h-[44px] items-center justify-between rounded-xl px-4 text-sm font-bold transition " + d.brandClass}
                    >
                      {d.label}
                      <span aria-hidden>→</span>
                    </a>
                  ))}
                </div>
                <p className="mt-2 text-xs text-teal-300">Opens a search on the delivery app. Availability varies.</p>
              </div>
            )}
          </div>
        </aside>
      </section>

      {similar.length > 0 && (
        <section className="container-page mt-16 sm:mt-20" data-reveal="up">
          <p className="eyebrow">Keep exploring</p>
          <h2 className="section-title mt-1">More like {b.name}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <BusinessCard key={s.slug} business={s} categoryName={cat.name} />
            ))}
          </div>
        </section>
      )}

      <RelatedGuides posts={relatedPosts(b.category)} title="Related Edmonton guides" />

      <MobileActionBar b={b} />
    </>
  );
}

function displayUrl(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (/instagram\.com$/.test(host)) return `Instagram ${u.pathname.replace(/\/$/, "").replace(/^\//, "@")}`;
    if (/facebook\.com$/.test(host)) return "Facebook page";
    const path = u.pathname === "/" ? "" : u.pathname.replace(/\/$/, "");
    const s = host + path;
    return s.length > 34 ? `${s.slice(0, 33)}…` : s;
  } catch {
    return "Website";
  }
}
