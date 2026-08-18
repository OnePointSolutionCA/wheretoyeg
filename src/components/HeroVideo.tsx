"use client";

import { useEffect, useRef } from "react";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Force play on mount + on visibility change.
  // Some iOS versions block declarative `autoplay` on cellular even when muted.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    // Legacy iOS attributes — set imperatively so TS doesn't complain in JSX.
    v.setAttribute("webkit-playsinline", "true");
    v.setAttribute("x5-playsinline", "true");
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    document.addEventListener("visibilitychange", tryPlay);
    // Also try on any first user interaction as a fallback
    const onFirstTouch = () => { tryPlay(); document.removeEventListener("touchstart", onFirstTouch); };
    document.addEventListener("touchstart", onFirstTouch, { once: true, passive: true });
    return () => {
      document.removeEventListener("visibilitychange", tryPlay);
      document.removeEventListener("touchstart", onFirstTouch);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal via-teal-700 to-teal-900" />
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/hero-edmonton.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-teal/50 via-teal/60 to-teal/90" />
      <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-coral/25 blur-3xl" />
      <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />
    </div>
  );
}
