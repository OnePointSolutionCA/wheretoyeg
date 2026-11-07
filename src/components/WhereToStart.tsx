import Link from "next/link";
import type { Business } from "@/lib/types";
import { pinnedFirst } from "@/lib/pin";
import { noDash } from "@/lib/seo";

const MIN_RATING = 4.5;
const MIN_REVIEWS = 20;

/** First two words of the name, so chain branches only take one slot. */
const brand = (b: Business) => b.name.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).slice(0, 2).join(" ");

/**
 * The most reviewed listings rated 4.5 or higher, one per brand, with a real street address
 * (city only listings are left out until their details are confirmed). Pinned listings lead.
 */
export function whereToStartPicks(businesses: Business[], limit = 5): Business[] {
  const seen = new Set<string>();
  const out: Business[] = [];
  const sorted = pinnedFirst(
    businesses
      .filter((b) => b.pinned || (Number(b.rating) >= MIN_RATING && Number(b.review_count) >= MIN_REVIEWS && /\d/.test(b.address ?? "")))
      .sort((a, b) => Number(b.review_count) - Number(a.review_count)),
  );
  for (const b of sorted) {
    const k = brand(b);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(b);
    if (out.length >= limit) break;
  }
  return out;
}

/** A short, rule based "where to start" list. Plain text and links only, no rating schema. */
export function WhereToStart({ businesses, noun, className = "" }: { businesses: Business[]; noun: string; className?: string }) {
  const picks = whereToStartPicks(businesses);
  if (picks.length < 3) return null;
  return (
    <div className={"rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6 " + className}>
      <h2 className="font-display text-lg font-bold text-teal sm:text-xl">Where to start</h2>
      <p className="mt-1 text-sm text-teal-300">
        Our rule: the most reviewed {noun} in our listings with a Google rating of {MIN_RATING} or higher, at least {MIN_REVIEWS} reviews and a street address on file, one location per brand.
      </p>
      <ol className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {picks.map((b, i) => (
          <li key={b.slug} className="flex min-w-0 gap-2">
            <span className="font-bold text-coral">{i + 1}.</span>
            <span className="min-w-0">
              <Link href={`/${b.category}/${b.slug}`} prefetch={false} className="font-semibold text-teal hover:text-coral">
                {noDash(b.name)}
              </Link>
              <span className="text-teal-300">
                {" "}· {b.neighborhood}
                {Number(b.rating) > 0 && Number(b.review_count) > 0
                  ? ` · ${Number(b.rating).toFixed(1)}★ from ${Number(b.review_count).toLocaleString("en-CA")} reviews`
                  : ""}
                {b.pinned ? " · Featured" : ""}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
