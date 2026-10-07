"use client";

import { useEffect, useMemo, useState } from "react";
import type { Advertiser, AdvertiserId } from "@/lib/advertisers";
import { advertiser } from "@/lib/advertisers";

const DELAY_MS = 4000;
const ROTATION: AdvertiserId[] = ["onepoint", "fixauto", "oxford"];

function withUtm(href: string, advertiserId: AdvertiserId) {
  if (href.startsWith("tel:") || href.startsWith("mailto:")) return href;
  const u = new URL(href);
  u.searchParams.set("utm_source", "wheretoyeg");
  u.searchParams.set("utm_medium", "popup");
  u.searchParams.set("utm_campaign", `${advertiserId}-home-popup`);
  return u.toString();
}

/**
 * Dismissible popup for one of the sponsors. Picks a random advertiser each page
 * load so all three get roughly equal exposure.
 */
export function OnePointPopup() {
  const [open, setOpen] = useState(false);
  const [adId] = useState<AdvertiserId>(() => ROTATION[Math.floor(Math.random() * ROTATION.length)]);
  const ad = useMemo<Advertiser>(() => advertiser(adId), [adId]);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setOpen(false);
  }

  if (!open) return null;

  const primary = withUtm(ad.primary.href, ad.id);
  const secondary = withUtm(ad.secondary.href, ad.id);

  return (
    <div
      role="dialog"
      aria-label={`Sponsored message from ${ad.name}`}
      className="fixed bottom-4 right-4 left-4 z-50 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[380px]"
      style={{ animation: "popIn 300ms ease-out" }}
    >
      <style>{`@keyframes popIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}`}</style>
      <div className="relative overflow-hidden rounded-2xl text-white shadow-2xl ring-1 ring-white/15" style={{ backgroundColor: ad.bg }}>
        <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full blur-3xl" style={{ backgroundColor: `${ad.accent}66` }} aria-hidden="true" />
        <button
          type="button"
          onClick={dismiss}
          onTouchEnd={(e) => { e.preventDefault(); dismiss(); }}
          aria-label="Close ad"
          className="absolute right-2.5 top-2.5 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white shadow-md ring-2 ring-white transition active:scale-95 hover:bg-black"
          style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", backgroundColor: ad.bg }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
        {/* White strip so every advertiser's full-colour logo reads cleanly on every device. */}
        <div className="relative bg-white px-5 pb-3 pt-4 pr-14 sm:pr-16">
          <span className="absolute left-5 top-3 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Sponsored</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.logoSrc} alt={ad.logoAlt} className="mt-5 block" style={{ height: `${ad.logoHeightPx}px`, width: "auto" }} />
        </div>
        <div className="relative p-5 sm:p-6">
          <h3 className="font-display text-xl font-extrabold leading-tight sm:text-2xl">
            {ad.headline} <span style={{ color: ad.accentSoft }}>{ad.highlight}</span>
          </h3>
          <p className="mt-2 text-sm text-white/80">{ad.blurb}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href={primary}
              target={primary.startsWith("tel:") ? undefined : "_blank"}
              rel="sponsored noopener noreferrer"
              onClick={dismiss}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: ad.accent }}
            >
              {ad.primary.label} <span aria-hidden>→</span>
            </a>
            <a
              href={secondary}
              target={secondary.startsWith("tel:") ? undefined : "_blank"}
              rel="sponsored noopener noreferrer"
              onClick={dismiss}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white hover:text-black"
            >
              {ad.secondary.label}
            </a>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="mt-3 block w-full text-center text-xs font-semibold text-white/50 transition hover:text-white"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
