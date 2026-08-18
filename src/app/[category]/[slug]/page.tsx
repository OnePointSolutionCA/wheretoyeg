import type { Metadata } from "next";
import Link from "next/link";
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
import { QuickActions } from "@/components/QuickActions";
import { ReviewCard } from "@/components/ReviewCard";
import { BusinessCard } from "@/components/BusinessCard";
import { FilterableList } from "@/components/FilterBar";
import { SubcategoryPills } from "@/components/SubcategoryPills";
import { businessSchema } from "@/lib/schema";
import { deliveryLinks } from "@/lib/delivery";
import { SITE } from "@/lib/site";

/**
 * The [category]/[slug] route serves two things:
 *   1. Subcategory listing pages, e.g. /medical/pharmacies or /restaurants/burgers
 *   2. Premium business detail pages, e.g. /barbers/fades-by-mike
 *
 * We check the subcategory first; if no match, we look for a business by slug.
 */

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
  const title = `${b.name} — ${service} in ${b.neighborhood}, Edmonton`;
  const desc = `${b.name}: ${service.toLowerCase()} in ${b.neighborhood}, Edmonton. ${b.description}`.slice(0, 158);
  return {
    title,
    description: desc,
    keywords: [
      `${b.name} Edmonton`,
      `${service} Edmonton`,
      `${service} near me`,
      `best ${service.toLowerCase()} Edmonton`,
      `${b.neighborhood} ${service.toLowerCase()}`,
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

function BusinessView({ business: b, category: cat }: { business: ReturnType<typeof getBusiness> & {}; category: ReturnType<typeof getCategoryBySlug> & {} }) {
  const similar = getBusinessesByCategory(cat.slug).filter((x) => x.slug !== b.slug).slice(0, 3);
  const subName = b.subcategory
    ? cat.subcategories?.find((s) => s.slug === b.subcategory)?.name
    : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema(b)) }}
      />

      <section className="border-b border-line bg-mist">
        <div className="container-page py-8">
          <nav className="text-xs text-teal-500">
            <Link href="/" className="hover:text-coral">Home</Link> <span className="px-1">›</span>{" "}
            <Link href={`/${b.category}`} className="hover:text-coral">{cat.name}</Link>{" "}
            {subName && b.subcategory && (
              <>
                <span className="px-1">›</span>
                <Link href={`/${b.category}/${b.subcategory}`} className="hover:text-coral">{subName}</Link>{" "}
              </>
            )}
            <span className="px-1">›</span>{" "}
            <span className="font-semibold text-teal">{b.name}</span>
          </nav>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              {b.logo && (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-card sm:h-20 sm:w-20">
                  <img src={b.logo} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                {b.tier === "premium" && <span className="badge-premium">Premium</span>}
                {b.tier === "featured" && <span className="badge-featured">Featured</span>}
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-teal sm:text-4xl">
                {b.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-teal-500">
                <StarRating value={b.rating} count={b.review_count} />
                <span aria-hidden>·</span>
                <span className="font-semibold">{b.price_range}</span>
                <span aria-hidden>·</span>
                <Link href={`/${b.category}`} className="hover:text-coral">{cat.name}</Link>
                {subName && b.subcategory && (
                  <>
                    <span aria-hidden>·</span>
                    <Link href={`/${b.category}/${b.subcategory}`} className="hover:text-coral">{subName}</Link>
                  </>
                )}
                <span aria-hidden>·</span>
                <span>{b.neighborhood}</span>
                <span aria-hidden>·</span>
                <OpenNowBadge hours={b.hours} />
              </div>
              </div>
            </div>
            <QuickActions b={b} />
          </div>
        </div>
      </section>

      <section className="container-page mt-8" data-reveal="left">
        <BusinessGallery photos={b.photos} name={b.name} logo={b.logo} categoryName={cat.name} slug={b.slug} />
      </section>

      <section className="container-page mt-10 grid gap-10 lg:grid-cols-3" data-reveal="right">
        <div className="lg:col-span-2">
          <h2 className="font-display text-xl font-bold text-teal">About {b.name}</h2>
          <p className="mt-3 whitespace-pre-line text-teal-500">{b.description}</p>

          {b.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {b.tags.map((t) => (
                <span key={t} className="pill">#{t}</span>
              ))}
            </div>
          )}

          {b.amenities?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold text-teal">Amenities & features</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {b.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-teal">
                    <CheckIcon />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {b.reviews?.length ? (
            <div className="mt-10">
              <div className="flex items-end justify-between">
                <h2 className="font-display text-xl font-bold text-teal">Reviews</h2>
                <a
                  href={reviewFormLink(b.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-coral hover:underline"
                >
                  Write a review →
                </a>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {b.reviews.map((r, i) => (
                  <ReviewCard key={i} review={r} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-line bg-mist p-6 text-center text-teal-500">
              Be the first to review {b.name}.{" "}
              <a href={reviewFormLink(b.name)} target="_blank" rel="noreferrer" className="font-semibold text-coral hover:underline">
                Write a review
              </a>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="font-display text-lg font-bold text-teal">Hours</h3>
            <div className="mt-2">
              <OpenNowBadge hours={b.hours} />
            </div>
            <div className="mt-3">
              <BusinessHours hours={b.hours} />
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="font-display text-lg font-bold text-teal">Location</h3>
            <p className="mt-2 text-sm text-teal-500">{b.address}</p>
            <p className="mt-1 text-sm text-teal-500">Edmonton, AB</p>
            {b.latitude && b.longitude && (
              <div className="mt-3 overflow-hidden rounded-xl border border-line">
                <iframe
                  title={`${b.name} map`}
                  className="h-56 w-full"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${b.longitude - 0.005},${b.latitude - 0.003},${b.longitude + 0.005},${b.latitude + 0.003}&layer=mapnik&marker=${b.latitude},${b.longitude}`}
                />
              </div>
            )}
            {b.google_maps_url && (
              <a
                href={b.google_maps_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-coral hover:underline"
              >
                Open in Google Maps →
              </a>
            )}
          </div>
          {deliveryLinks(b).length > 0 && (
            <div className="rounded-2xl border border-line bg-white p-5">
              <h3 className="font-display text-lg font-bold text-teal">Order delivery</h3>
              <div className="mt-3 flex flex-col gap-2">
                {deliveryLinks(b).map((d) => (
                  <a
                    key={d.label}
                    href={d.href}
                    target="_blank"
                    rel="noreferrer"
                    className={"flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-bold transition " + d.brandClass}
                  >
                    {d.label}
                    <span aria-hidden>→</span>
                  </a>
                ))}
              </div>
              <p className="mt-2 text-xs text-teal-500">Opens a search on the delivery app. Availability varies.</p>
            </div>
          )}
          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="font-display text-lg font-bold text-teal">Contact</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              {b.phone && <li><a href={`tel:${b.phone}`} className="text-teal hover:text-coral">{b.phone}</a></li>}
              {b.email && <li><a href={`mailto:${b.email}`} className="text-teal hover:text-coral">{b.email}</a></li>}
              {b.website && <li><a href={b.website} target="_blank" rel="noreferrer" className="text-teal hover:text-coral">Website ↗</a></li>}
              {b.instagram && <li><a href={b.instagram} target="_blank" rel="noreferrer" className="text-teal hover:text-coral">Instagram ↗</a></li>}
              {b.facebook && <li><a href={b.facebook} target="_blank" rel="noreferrer" className="text-teal hover:text-coral">Facebook ↗</a></li>}
              {b.tiktok && <li><a href={b.tiktok} target="_blank" rel="noreferrer" className="text-teal hover:text-coral">TikTok ↗</a></li>}
            </ul>
          </div>
        </aside>
      </section>

      {similar.length > 0 && (
        <section className="container-page mt-20" data-reveal="up">
          <h2 className="section-title">You might also like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <BusinessCard key={s.slug} business={s} categoryName={cat.name} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function reviewFormLink(businessName: string) {
  return `https://docs.google.com/forms/d/e/FORM_ID/viewform?entry.0=${encodeURIComponent(businessName)}`;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F1664C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}
