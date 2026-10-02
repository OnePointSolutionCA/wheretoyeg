"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";

/** Swipeable row with snap points and arrow buttons; no autoplay. */
export function Carousel({
  children,
  label,
  itemClassName,
  tone = "light",
}: {
  children: React.ReactNode;
  label: string;
  itemClassName: string;
  tone?: "light" | "dark";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const btn =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border shadow-lift transition sm:flex disabled:pointer-events-none disabled:opacity-0 " +
    (tone === "dark" ? "border-white/20 bg-white text-teal hover:bg-mist" : "border-line bg-white text-teal hover:border-teal-300 hover:text-coral");

  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label={label}
        className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-6 pt-2 sm:-mx-3 sm:scroll-px-3 sm:px-3"
        style={{ scrollbarWidth: "none" }}
      >
        {Children.map(children, (child) => (
          <div className={"shrink-0 snap-start " + itemClassName}>{child}</div>
        ))}
      </div>
      <button type="button" aria-label="Previous" onClick={() => go(-1)} disabled={!canPrev} className={btn + " -left-3 lg:-left-5"}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <button type="button" aria-label="Next" onClick={() => go(1)} disabled={!canNext} className={btn + " -right-3 lg:-right-5"}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>
  );
}
