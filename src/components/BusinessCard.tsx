import Link from "next/link";
import type { Business } from "@/lib/types";
import { StarRating } from "./StarRating";
import { OpenNowBadge } from "./OpenNowBadge";

// Deterministic gradient per business so no-photo cards feel varied but stable.
const GRADIENTS = [
  "from-teal via-teal-700 to-teal-900",
  "from-[#0d5a75] via-teal to-[#062a38]",
  "from-[#8a3418] via-coral to-[#5d2210]",
  "from-[#1a4d5c] via-[#0a3441] to-[#062a38]",
  "from-coral via-[#c56430] to-[#7a3c1c]",
  "from-[#154b5d] via-[#0b3345] to-[#04212e]",
];
function hashPick<T>(arr: T[], key: string): T {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return arr[Math.abs(h) % arr.length];
}

export function BusinessCard({ business, categoryName }: { business: Business; categoryName?: string }) {
  const b = business;
  const href = `/${b.category}/${b.slug}`;
  const photo = b.photos?.[0];
  const gradient = hashPick(GRADIENTS, b.slug);

  return (
    <article
      id={b.slug}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <Link href={href} className="block">
        <div
          className="photo-tile relative aspect-[16/10] w-full overflow-hidden"
          style={photo ? { backgroundImage: `url(${photo})` } : undefined}
          aria-hidden="true"
        >
          {!photo && (
            <div className={"absolute inset-0 bg-gradient-to-br " + gradient}>
              {/* Ambient orb accents */}
              <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/8 blur-2xl" />
              <div className="absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-white/6 blur-3xl" />
              {/* Faint pattern grid */}
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "18px 18px",
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
                {b.logo ? (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-3 shadow-lift transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <img src={b.logo} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25 transition-transform duration-500 group-hover:scale-110">
                    <span className="font-display text-4xl font-extrabold text-white">
                      {b.name.slice(0, 1)}
                    </span>
                  </div>
                )}
                <span className="mt-1 max-w-[80%] truncate text-xs font-bold uppercase tracking-wider text-white/70">
                  {categoryName ?? b.neighborhood}
                </span>
              </div>
            </div>
          )}
          {/* Gradient overlay on photos, keeps text pop if we ever add captions */}
          {photo && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
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
              <h3 className="truncate font-display text-lg font-bold text-teal transition-colors group-hover:text-coral">
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
            className="group/link inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-coral transition-transform hover:translate-x-0.5"
          >
            View <span className="transition-transform group-hover/link:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
