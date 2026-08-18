"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Business } from "@/lib/types";
import { BusinessCard } from "./BusinessCard";
import { Card3D } from "./Card3D";

const INTERVAL = 15_000;

export function FeaturedCarousel({
  businesses,
  categoryNames,
}: {
  businesses: Business[];
  categoryNames: Record<string, string>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const total = businesses.length;
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const isScrolling = useRef(false);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % total);
    }, INTERVAL);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  useEffect(() => {
    if (isScrolling.current) return;
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[0] as HTMLElement | undefined;
    if (!card) return;
    const gap = 20;
    const cardWidth = card.offsetWidth + gap;
    track.scrollTo({ left: idx * cardWidth, behavior: "smooth" });
  }, [idx]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let scrollTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      isScrolling.current = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling.current = false;
        const card = track.children[0] as HTMLElement | undefined;
        if (!card) return;
        const gap = 20;
        const cardWidth = card.offsetWidth + gap;
        const newIdx = Math.round(track.scrollLeft / cardWidth);
        setIdx(Math.max(0, Math.min(newIdx, total - 1)));
      }, 120);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimer);
    };
  }, [total]);

  // Touch swipe
  const touchStart = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setIdx((i) => Math.min(i + 1, total - 1));
      else setIdx((i) => Math.max(i - 1, 0));
      resetTimer();
    }
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
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
