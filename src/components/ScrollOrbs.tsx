"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle background orbs that follow scroll with parallax.
 * Fixed to the viewport so they float behind content as user scrolls.
 */
export function ScrollOrbs() {
  const orbARef = useRef<HTMLDivElement>(null);
  const orbBRef = useRef<HTMLDivElement>(null);
  const orbCRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (orbARef.current) orbARef.current.style.transform = `translate3d(${Math.sin(y / 500) * 30}px, ${y * -0.15}px, 0)`;
        if (orbBRef.current) orbBRef.current.style.transform = `translate3d(${Math.cos(y / 400) * 40}px, ${y * -0.25}px, 0)`;
        if (orbCRef.current) orbCRef.current.style.transform = `translate3d(${Math.sin(y / 300) * 20}px, ${y * -0.35}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div ref={orbARef} className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-coral/8 blur-3xl" />
      <div ref={orbBRef} className="absolute top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-teal-300/6 blur-3xl" />
      <div ref={orbCRef} className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-coral/5 blur-3xl" />
    </div>
  );
}
