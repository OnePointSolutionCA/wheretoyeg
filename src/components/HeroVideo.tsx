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
    v.removeAttribute("controls");

    const tryPlay = () => {
      if (v.paused) {
        v.muted = true;
        v.play().catch(() => {});
      }
    };

    tryPlay();

    const timers = [50, 150, 400, 800, 1500, 3000].map((ms) => setTimeout(tryPlay, ms));

    let raf: number;
    let attempts = 0;
    const rafLoop = () => {
      if (v.paused && attempts < 60) {
        attempts++;
        v.muted = true;
        v.play().catch(() => {});
        raf = requestAnimationFrame(rafLoop);
      }
    };
    raf = requestAnimationFrame(rafLoop);

    document.addEventListener("visibilitychange", tryPlay);

    const onInteract = () => { tryPlay(); cleanup(); };
    const cleanup = () => {
      ["touchstart", "touchend", "click", "scroll"].forEach((e) =>
        document.removeEventListener(e, onInteract)
      );
    };
    ["touchstart", "touchend", "click", "scroll"].forEach((e) =>
      document.addEventListener(e, onInteract, { once: true, passive: true })
    );

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", tryPlay);
      cleanup();
    };
  }, []);

  return (
    <div className="hero-media pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal via-teal-700 to-teal-900" />
      <video
        ref={videoRef}
        className="hero-video absolute inset-0 h-full w-full object-cover opacity-70"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
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
