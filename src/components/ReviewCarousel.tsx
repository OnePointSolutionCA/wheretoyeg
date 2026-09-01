"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ReviewCard } from "./ReviewCard";
import type { Review } from "@/lib/types";

type ReviewWithBusiness = Review & {
  business: { name: string; slug: string; category: string };
};

export function ReviewCarousel({ reviews }: { reviews: ReviewWithBusiness[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  const scroll = useCallback(() => {
    const el = ref.current;
    if (!el || paused.current) return;
    const max = el.scrollWidth - el.clientWidth;
    if (el.scrollLeft >= max - 2) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: 300, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = setInterval(scroll, 5000);
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
        className="review-track flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        <style>{`.review-track::-webkit-scrollbar { display: none; }`}</style>
        {reviews.map((r, i) => (
          <div key={i} className="w-full shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]">
            <ReviewCard review={r} />
            <Link
              href={`/${r.business.category}/${r.business.slug}`}
              className="mt-2 block text-xs font-semibold text-coral hover:underline"
            >
              About {r.business.name} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
