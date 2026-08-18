import Link from "next/link";
import type { Business } from "@/lib/types";
import { StarRating } from "./StarRating";
import { OpenNowBadge } from "./OpenNowBadge";

export function BusinessCard({ business, categoryName }: { business: Business; categoryName?: string }) {
  const b = business;
  const href = b.tier === "premium" ? `/${b.category}/${b.slug}` : `/${b.category}#${b.slug}`;
  const photo = b.photos?.[0];
  return (
    <article
      id={b.slug}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <Link href={href} className="block">
        <div
          className="photo-tile relative aspect-[16/10] w-full"
          style={photo ? { backgroundImage: `url(${photo})` } : undefined}
          aria-hidden="true"
        >
          {!photo && b.logo && (
            <div className="absolute inset-0 flex items-center justify-center bg-white p-8">
              <img
                src={b.logo}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
          {!photo && !b.logo && (
            <div className="flex h-full items-center justify-center text-white/60">
              <span className="font-display text-4xl font-bold opacity-40">
                {b.name.slice(0, 1)}
              </span>
            </div>
          )}
        </div>
      </Link>
      {/* Logo badge — only shown when there IS a photo, so the logo sits over it like Yelp */}
      {photo && b.logo && (
        <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/70 bg-white p-1.5 shadow-card">
          <img src={b.logo} alt="" className="max-h-full max-w-full object-contain" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={href} className="block">
              <h3 className="truncate font-display text-lg font-bold text-teal group-hover:text-coral">
                {b.name}
              </h3>
            </Link>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-teal-500">
              {categoryName && <span>{categoryName}</span>}
              {categoryName && <span aria-hidden>·</span>}
              <span>{b.neighborhood}</span>
              <span aria-hidden>·</span>
              <span className="font-semibold">{b.price_range}</span>
            </div>
          </div>
          {b.tier === "premium" && <span className="badge-premium">Premium</span>}
          {b.tier === "featured" && <span className="badge-featured">Featured</span>}
        </div>
        <StarRating value={b.rating} count={b.review_count} />
        <p className="line-clamp-2 text-sm text-teal-500">{b.description}</p>
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
            className="text-xs font-bold uppercase tracking-wider text-coral hover:underline"
          >
            View →
          </Link>
        </div>
      </div>
    </article>
  );
}
