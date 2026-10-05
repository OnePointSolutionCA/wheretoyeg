import Link from "next/link";
import Image from "next/image";
import type { Business } from "@/lib/types";
import { StarRating } from "./StarRating";
import { OpenNowBadge } from "./OpenNowBadge";
import { CategoryPlaceholder } from "./CategoryPlaceholder";
import { placeLabel } from "@/lib/place";
import { plainDashes } from "@/lib/text";


export function BusinessCard({ business, categoryName }: { business: Business; categoryName?: string }) {
  const b = business;
  const href = `/${b.category}/${b.slug}`;
  const photo = b.photos?.[0];

  return (
    <article
      id={b.slug}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <Link href={href} className="block">
        <div
          className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--teal)]"
          aria-hidden="true"
        >
          {photo && (
            <Image
              src={photo}
              alt={`${b.name}${b.neighborhood ? ` in ${placeLabel(b.neighborhood)}` : ""}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              loading="lazy"
            />
          )}
          {!photo && <CategoryPlaceholder category={b.category} name={b.name} logo={b.logo} label={categoryName ?? b.neighborhood} />}
          {/* Gradient overlay on photos, keeps text pop if we ever add captions */}
          {photo && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          )}
        </div>
      </Link>
      {/* Logo badge, only shown when there IS a photo, so the logo sits over it like Yelp */}
      {photo && b.logo && (
        <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/70 bg-white shadow-card">
          <Image src={b.logo} alt="" fill sizes="48px" className="object-contain p-1.5" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={href} className="block">
              <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug text-teal transition-colors group-hover:text-coral">
                {b.name}
              </h3>
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-teal-500">
              {categoryName && <span>{categoryName}</span>}
              {categoryName && <span aria-hidden>·</span>}
              <span>{b.neighborhood}</span>
              {b.price_range && (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-semibold">{b.price_range}</span>
                </>
              )}
            </div>
          </div>
          {b.tier === "premium" && <span className="badge-premium shrink-0">Premium</span>}
        </div>
        <StarRating value={b.rating} count={b.review_count} />
        {b.description && !b.generatedDescription && <p className="line-clamp-2 text-sm text-teal-500">{plainDashes(b.description)}</p>}
        <div className="mt-1 flex flex-wrap gap-1.5">
          {b.amenities?.slice(0, 3).map((a) => (
            <span key={a} className="pill">
              {a}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <OpenNowBadge hours={b.hours} />
          <Link
            href={href}
            className="group/link inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-coral transition-transform hover:translate-x-0.5"
          >
            View <span className="transition-transform group-hover/link:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
