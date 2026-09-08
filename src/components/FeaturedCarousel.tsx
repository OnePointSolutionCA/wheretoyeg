"use client";

import { useRef, useEffect, useCallback } from "react";
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
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  const scroll = useCallback(() => {
    const el = ref.current;
    if (!el || paused.current) return;
    const max = el.scrollWidth - el.clientWidth;
    if (el.scrollLeft >= max - 2) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: 320, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = setInterval(scroll, 4000);
    return () => clearInterval(id);
  }, [scroll]);

  return (
    <div
      className="relative"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      <div
        ref={ref}
        className="featured-track flex gap-5 overflow-x-auto overscroll-x-contain touch-pan-x scroll-smooth snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
