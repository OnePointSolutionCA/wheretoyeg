"use client";

import { useEffect, useMemo, useState } from "react";
import type { Business } from "@/lib/types";
import { BusinessCard } from "./BusinessCard";
import { Card3D } from "./Card3D";
import { openStatus } from "@/lib/openNow";

const PRICES = ["$", "$$", "$$$", "$$$$"] as const;

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

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
  const [prices, setPrices] = useState<string[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [openNow, setOpenNow] = useState(false);
  const [selNeighborhoods, setSelNeighborhoods] = useState<string[]>([]);
  const [selAmenities, setSelAmenities] = useState<string[]>([]);
  const [sort, setSort] = useState<"recommended" | "rating" | "reviews" | "newest">("recommended");
  const [openMenu, setOpenMenu] = useState<"neighborhoods" | "amenities" | null>(null);

  // Read initial filter state from URL (?amenity=Halal&neighborhood=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const a = params.get("amenity");
    if (a) setSelAmenities(a.split(",").filter(Boolean));
    const n = params.get("neighborhood");
    if (n) setSelNeighborhoods(n.split(",").filter(Boolean));
    const p = params.get("price");
    if (p) setPrices(p.split(",").filter(Boolean));
  }, []);

  // Close menus on outside click
  useEffect(() => {
    if (!openMenu) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest?.("[data-filter-menu]")) setOpenMenu(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenu]);

  const filtered = useMemo(() => {
    let out = businesses.slice();
    if (prices.length) out = out.filter((b) => prices.includes(b.price_range));
    if (rating != null) out = out.filter((b) => (b.rating ?? 0) >= rating);
    if (openNow) out = out.filter((b) => openStatus(b.hours).isOpen);
    if (selNeighborhoods.length) out = out.filter((b) => selNeighborhoods.includes(b.neighborhood));
    if (selAmenities.length) out = out.filter((b) => selAmenities.every((a) => b.amenities?.includes(a)));
    if (sort === "rating") out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sort === "reviews") out.sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
    else if (sort === "newest") out.sort((a, b) => b.date_listed.localeCompare(a.date_listed));
    return out;
  }, [businesses, prices, rating, openNow, selNeighborhoods, selAmenities, sort]);

  const activeCount =
    prices.length + selNeighborhoods.length + selAmenities.length + (rating ? 1 : 0) + (openNow ? 1 : 0);

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-5 border-b border-line bg-white/95 px-5 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Price */}
          <div className="flex items-center gap-1 rounded-full border border-line bg-white p-1">
            {PRICES.map((p) => (
              <button
                key={p}
                onClick={() => setPrices((prev) => toggle(prev, p))}
                className={
                  "rounded-full px-3 py-1 text-sm font-semibold transition " +
                  (prices.includes(p) ? "bg-teal text-white" : "text-teal-500 hover:bg-mist")
                }
              >
                {p}
              </button>
            ))}
          </div>

          {/* Rating */}
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

          {/* Open now */}
          <button
            onClick={() => setOpenNow(!openNow)}
            className={"chip " + (openNow ? "chip--active" : "")}
          >
            <span className={"inline-block h-2 w-2 rounded-full " + (openNow ? "bg-white" : "bg-emerald-500")} />
            Open now
          </button>

          {/* Neighborhoods (multi) */}
          <div className="relative" data-filter-menu>
            <button
              onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === "neighborhoods" ? null : "neighborhoods"); }}
              className={"chip " + (selNeighborhoods.length ? "chip--active" : "")}
            >
              {selNeighborhoods.length ? `${selNeighborhoods.length} neighborhood${selNeighborhoods.length === 1 ? "" : "s"}` : "All neighborhoods"}
              <span className="ml-1">▾</span>
            </button>
            {openMenu === "neighborhoods" && (
              <div className="absolute left-0 top-full z-40 mt-2 max-h-80 w-64 overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-lift">
                {neighborhoods.map((n) => (
                  <label key={n} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-mist">
                    <input
                      type="checkbox"
                      checked={selNeighborhoods.includes(n)}
                      onChange={() => setSelNeighborhoods((prev) => toggle(prev, n))}
                      className="h-4 w-4 accent-coral"
                    />
                    <span className="text-teal">{n}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Amenities (multi) */}
          {amenities.length > 0 && (
            <div className="relative" data-filter-menu>
              <button
                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === "amenities" ? null : "amenities"); }}
                className={"chip " + (selAmenities.length ? "chip--active" : "")}
              >
                {selAmenities.length ? `${selAmenities.length} amenit${selAmenities.length === 1 ? "y" : "ies"}` : "All amenities"}
                <span className="ml-1">▾</span>
              </button>
              {openMenu === "amenities" && (
                <div className="absolute left-0 top-full z-40 mt-2 max-h-80 w-64 overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-lift">
                  {amenities.map((a) => (
                    <label key={a} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-mist">
                      <input
                        type="checkbox"
                        checked={selAmenities.includes(a)}
                        onChange={() => setSelAmenities((prev) => toggle(prev, a))}
                        className="h-4 w-4 accent-coral"
                      />
                      <span className="text-teal">{a}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {activeCount > 0 && (
              <button
                onClick={() => {
                  setPrices([]); setRating(null); setOpenNow(false); setSelNeighborhoods([]); setSelAmenities([]);
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

        {/* Active filter chips */}
        {(selNeighborhoods.length > 0 || selAmenities.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selNeighborhoods.map((n) => (
              <button
                key={"n-" + n}
                onClick={() => setSelNeighborhoods((prev) => prev.filter((x) => x !== n))}
                className="inline-flex items-center gap-1 rounded-full bg-teal px-2.5 py-0.5 text-xs font-semibold text-white hover:bg-teal-700"
              >
                {n} <span aria-hidden>×</span>
              </button>
            ))}
            {selAmenities.map((a) => (
              <button
                key={"a-" + a}
                onClick={() => setSelAmenities((prev) => prev.filter((x) => x !== a))}
                className="inline-flex items-center gap-1 rounded-full bg-coral px-2.5 py-0.5 text-xs font-semibold text-white hover:bg-coral/90"
              >
                {a} <span aria-hidden>×</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-2 text-xs text-teal-500">
          Showing {filtered.length} of {businesses.length}
        </div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => (
          <Card3D key={b.slug}>
            <BusinessCard business={b} categoryName={categoryName} />
          </Card3D>
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
