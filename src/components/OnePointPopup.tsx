"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const DELAY_MS = 4000;

/**
 * Dismissible popup for OnePoint Solutions. Shows every page load after a short
 * delay so visitors see it on every refresh.
 */
export function OnePointPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setOpen(false);
  }

  if (!open) return null;

  const utm = "?utm_source=wheretoyeg&utm_medium=popup&utm_campaign=home-popup";

  return (
    <div
      role="dialog"
      aria-label="Sponsored message from OnePoint Solutions"
      className="fixed bottom-4 right-4 left-4 z-50 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[380px] animate-[popIn_300ms_ease-out]"
      style={{ animation: "popIn 300ms ease-out" }}
    >
      <style>{`@keyframes popIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}`}</style>
      <div className="relative overflow-hidden rounded-2xl bg-[#2D3E50] text-white shadow-2xl ring-1 ring-white/15">
        <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#D97B2B]/40 blur-3xl" aria-hidden="true" />
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
        <div className="relative p-5 sm:p-6">
          <span className="inline-block rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70">Sponsored</span>
          <Image
            src="/logos/onepoint-horizontal.png"
            alt="OnePoint Solutions Marketing Agency"
            width={176}
            height={44}
            className="mt-3 h-8 w-auto brightness-0 invert"
          />
          <h3 className="mt-3 font-display text-xl font-extrabold leading-tight sm:text-2xl">
            Rank higher on Google in Edmonton.
          </h3>
          <p className="mt-2 text-sm text-white/80">
            OnePoint Solutions runs SEO, Google Business Profile and websites for local businesses. Transparent monthly pricing. No contracts.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href={`https://onepointsolution.ca/free-seo-audit/${utm}`}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={dismiss}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-[#D97B2B] px-5 text-sm font-bold text-white transition hover:bg-[#c56a1e]"
            >
              Free SEO Audit <span aria-hidden>→</span>
            </a>
            <a
              href={`https://onepointsolution.ca/${utm}`}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={dismiss}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white hover:text-[#2D3E50]"
            >
              Visit
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
