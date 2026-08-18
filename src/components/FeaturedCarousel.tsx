"use client";

import type { Business } from "@/lib/types";
import { BusinessCard } from "./BusinessCard";
import { Card3D } from "./Card3D";

export function FeaturedCarousel({
  businesses,
  categoryNames,
}: {
  businesses: Business[];
  categoryNames: Record<string, string>;
}) {
  return (
    <div className="relative">
      <div
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        <style>{`.featured-track::-webkit-scrollbar { display: none; }`}</style>
        {businesses.map((b) => (
          <div
            key={b.slug}
            className="w-full shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
          >
            <Card3D>
              <BusinessCard business={b} categoryName={categoryNames[b.category]} />
            </Card3D>
          </div>
        ))}
      </div>
    </div>
  );
}
