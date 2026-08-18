"use client";

import { useEffect, useRef } from "react";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    v.setAttribute("webkit-playsinline", "true");
    v.setAttribute("x5-playsinline", "true");
    v.setAttribute("x5-video-player-type", "h5");
    v.setAttribute("disableRemotePlayback", "true");

    const tryPlay = () => {
      if (v.paused) {
        v.muted = true;
        v.play().catch(() => {});
      }
    };

    tryPlay();

    const retries = [100, 300, 800, 2000];
    const timers = retries.map((ms) => setTimeout(tryPlay, ms));

    document.addEventListener("visibilitychange", tryPlay);

    const onInteract = () => { tryPlay(); cleanup(); };
    const cleanup = () => {
      document.removeEventListener("touchstart", onInteract);
      document.removeEventListener("touchend", onInteract);
      document.removeEventListener("click", onInteract);
      document.removeEventListener("scroll", onInteract);
    };
    document.addEventListener("touchstart", onInteract, { once: true, passive: true });
    document.addEventListener("touchend", onInteract, { once: true, passive: true });
    document.addEventListener("click", onInteract, { once: true, passive: true });
    document.addEventListener("scroll", onInteract, { once: true, passive: true });

    return () => {
      timers.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", tryPlay);
      cleanup();
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
