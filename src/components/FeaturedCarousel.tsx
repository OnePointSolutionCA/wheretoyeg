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
      const card = el.querySelector<HTMLElement>("[data-card]");
      el.scrollBy({ left: card ? card.offsetWidth + 16 : 320, behavior: "smooth" });
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
        className="featured-track flex gap-4 overflow-x-auto overscroll-x-contain touch-pan-x scroll-smooth snap-x snap-mandatory pb-2 sm:gap-5"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`.featured-track::-webkit-scrollbar { display: none; }`}</style>
        <div className="w-[calc(7.5%-1rem)] shrink-0 sm:hidden" aria-hidden="true" />
        {businesses.map((b) => (
          <div
            key={b.slug}
            data-card
            className="w-[85%] shrink-0 snap-center sm:w-[calc(50%-10px)] sm:snap-start lg:w-[calc(33.333%-14px)]"
          >
            <Card3D>
              <BusinessCard business={b} categoryName={categoryNames[b.category]} />
            </Card3D>
          </div>
        ))}
        <div className="w-[calc(7.5%-1rem)] shrink-0 sm:hidden" aria-hidden="true" />
      </div>
    </div>
  );
}
