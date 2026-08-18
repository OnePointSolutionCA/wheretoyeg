"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Business } from "@/lib/types";
import { BusinessCard } from "./BusinessCard";

const INTERVAL = 15_000;
const CARDS_PER_VIEW = { sm: 1, md: 2, lg: 3 };

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
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[0] as HTMLElement | undefined;
    if (!card) return;
    const gap = 20;
    const cardWidth = card.offsetWidth + gap;
    track.scrollTo({ left: idx * cardWidth, behavior: "smooth" });
  }, [idx]);

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

  // Mouse drag
  const mouseStart = useRef<number | null>(null);
  const onMouseDown = (e: React.MouseEvent) => {
    mouseStart.current = e.clientX;
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (mouseStart.current === null) return;
    const diff = mouseStart.current - e.clientX;
    mouseStart.current = null;
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
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        <style>{`.featured-track::-webkit-scrollbar { display: none; }`}</style>
        {businesses.map((b) => (
          <div
            key={b.slug}
            className="w-full shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
          >
            <BusinessCard business={b} categoryName={categoryNames[b.category]} />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="mt-5 flex items-center justify-center gap-2">
        <button
          onClick={() => { setIdx((i) => (i - 1 + total) % total); resetTimer(); }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-teal transition hover:border-teal-300 hover:text-coral"
          aria-label="Previous"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="flex gap-1.5">
          {businesses.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIdx(i); resetTimer(); }}
              className={
                "h-2 rounded-full transition-all " +
                (i === idx ? "w-6 bg-coral" : "w-2 bg-teal-200 hover:bg-teal-300")
              }
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => { setIdx((i) => (i + 1) % total); resetTimer(); }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-teal transition hover:border-teal-300 hover:text-coral"
          aria-label="Next"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}
