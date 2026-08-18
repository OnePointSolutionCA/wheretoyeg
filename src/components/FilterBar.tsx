"use client";

import { useMemo, useState } from "react";
import type { Business } from "@/lib/types";
import { BusinessCard } from "./BusinessCard";
import { openStatus } from "@/lib/openNow";

const PRICES = ["$", "$$", "$$$", "$$$$"] as const;

export function FilterableList({
  businesses,
  categoryName,
  neighborhoods,
  amenities,
}: {
  businesses: Business[];
  categoryName?: string;
  neighborhoods: string[];
  amenities: string[];
}) {
  const [price, setPrice] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [openNow, setOpenNow] = useState(false);
  const [neighborhood, setNeighborhood] = useState<string>("");
  const [amenity, setAmenity] = useState<string>("");
  const [sort, setSort] = useState<"recommended" | "rating" | "reviews" | "newest">("recommended");

  const filtered = useMemo(() => {
    let out = businesses.slice();
    if (price) out = out.filter((b) => b.price_range === price);
    if (rating != null) out = out.filter((b) => (b.rating ?? 0) >= rating);
    if (openNow) out = out.filter((b) => openStatus(b.hours).isOpen);
    if (neighborhood) out = out.filter((b) => b.neighborhood === neighborhood);
    if (amenity) out = out.filter((b) => b.amenities?.includes(amenity));
    if (sort === "rating") out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sort === "reviews") out.sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
    else if (sort === "newest") out.sort((a, b) => b.date_listed.localeCompare(a.date_listed));
    return out;
  }, [businesses, price, rating, openNow, neighborhood, amenity, sort]);

  const activeCount = [price, rating, openNow, neighborhood, amenity].filter(Boolean).length;

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-5 border-b border-line bg-white/90 px-5 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-line bg-white p-1">
            {PRICES.map((p) => (
              <button
                key={p}
                onClick={() => setPrice(price === p ? null : p)}
                className={
                  "rounded-full px-3 py-1 text-sm font-semibold transition " +
                  (price === p ? "bg-teal text-white" : "text-teal-500 hover:bg-mist")
                }
              >
                {p}
              </button>
            ))}
          </div>
          <select
            value={rating ?? ""}
            onChange={(e) => setRating(e.target.value ? Number(e.target.value) : null)}
            className="chip cursor-pointer"
            aria-label="Minimum rating"
          >
            <option value="">Any rating</option>
            <option value="3">3+ stars</option>
            <option value="4">4+ stars</option>
            <option value="4.5">4.5+ stars</option>
          </select>
          <button
            onClick={() => setOpenNow(!openNow)}
            className={"chip " + (openNow ? "chip--active" : "")}
          >
            <span className={"inline-block h-2 w-2 rounded-full " + (openNow ? "bg-white" : "bg-emerald-500")} />
            Open now
          </button>
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="chip cursor-pointer"
            aria-label="Neighborhood"
          >
            <option value="">All neighborhoods</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          {amenities.length > 0 && (
            <select
              value={amenity}
              onChange={(e) => setAmenity(e.target.value)}
              className="chip cursor-pointer"
              aria-label="Amenity"
            >
              <option value="">All amenities</option>
              {amenities.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          )}
          <div className="ml-auto flex items-center gap-2">
            {activeCount > 0 && (
              <button
                onClick={() => {
                  setPrice(null); setRating(null); setOpenNow(false); setNeighborhood(""); setAmenity("");
                }}
                className="text-xs font-semibold text-coral hover:underline"
              >
                Clear ({activeCount})
              </button>
            )}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="chip cursor-pointer"
              aria-label="Sort by"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest rated</option>
              <option value="reviews">Most reviewed</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
        <div className="mt-2 text-xs text-teal-500">
          Showing {filtered.length} of {businesses.length}
        </div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => (
          <BusinessCard key={b.slug} business={b} categoryName={categoryName} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-mist p-10 text-center">
          <p className="font-semibold text-teal">Nothing matches those filters.</p>
          <p className="mt-1 text-sm text-teal-500">Try clearing a filter or two.</p>
        </div>
      )}
    </div>
  );
}
