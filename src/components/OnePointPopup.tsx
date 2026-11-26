"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Advertiser, AdvertiserId } from "@/lib/advertisers";
import { ROTATION, adHref, advertiser } from "@/lib/advertisers";
import { trackAdClick, trackAdView } from "@/lib/adTrack";

const DELAY_MS = 4000;

/**
 * Dismissible homepage popup for one of the sponsors. Picks a random sponsor each
 * page load so all of them get roughly equal exposure.
 */
export function OnePointPopup() {
  const [open, setOpen] = useState(false);
  const [adId] = useState<AdvertiserId>(() => ROTATION[Math.floor(Math.random() * ROTATION.length)]);
  const ad = useMemo<Advertiser>(() => advertiser(adId), [adId]);

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const t = setTimeout(() => {
      // On phones the popup would cover the Local partners strip: wait until it is off screen.
      const strip = document.querySelector('section[aria-labelledby="partners-title"]');
      if (!strip || window.innerWidth >= 640) return setOpen(true);
      io = new IntersectionObserver((entries) => {
        if (entries.every((e) => !e.isIntersecting)) {
          io?.disconnect();
          setOpen(true);
        }
      });
      io.observe(strip);
    }, DELAY_MS);
    return () => {
      clearTimeout(t);
      io?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (open) trackAdView(ad.id, "home-popup");
  }, [open, ad.id]);

  function dismiss() {
    setOpen(false);
  }

  if (!open) return null;

  const href = adHref(ad.cta.href, ad.id, "home-popup", "popup");

  return (
    <div
      role="dialog"
      aria-label={`Sponsored message from ${ad.name}`}
      className="fixed bottom-4 left-4 right-4 z-50 sm:bottom-6 sm:left-auto sm:right-6 sm:w-[360px]"
      style={{ animation: "popIn 300ms ease-out" }}
    >
      <style>{`@keyframes popIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}`}</style>
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="relative aspect-[5/2] sm:aspect-[16/9]">
          <Image src={ad.photo.src} alt={ad.photo.alt} style={ad.photo.position ? { objectPosition: ad.photo.position } : undefined} fill loading="eager" sizes="(min-width: 640px) 360px, 100vw" className="object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm">
            Sponsored
          </span>
          <button
            type="button"
            onClick={dismiss}
            onTouchEnd={(e) => {
              e.preventDefault();
              dismiss();
            }}
            aria-label="Close ad"
            className="absolute right-2.5 top-2.5 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition active:scale-95 hover:bg-slate-100"
            style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="p-5" style={{ backgroundColor: ad.tint }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.logoSrc}
            alt={ad.logoAlt}
            width={ad.logoSize[0]}
            height={ad.logoSize[1]}
            style={{ height: `${Math.min(ad.logoHeightPx, 60)}px`, width: "auto", maxWidth: "100%", display: "block", objectFit: "contain" }}
          />
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: ad.color }}>
            {ad.kicker}
          </p>
          <p className="mt-1 font-display text-lg font-bold leading-snug text-teal">{ad.line}</p>
          <a
            href={href}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={() => {
              trackAdClick(ad.id, "home-popup");
              dismiss();
            }}
            className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: ad.color }}
          >
            {ad.cta.label} <span aria-hidden>→</span>
          </a>
          <button type="button" onClick={dismiss} className="mt-2 block w-full py-1 text-center text-xs font-semibold text-slate-500 transition hover:text-slate-800">
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
