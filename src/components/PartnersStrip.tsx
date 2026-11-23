"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { AdvertiserId } from "@/lib/advertisers";
import { ROTATION, adHref, advertiser } from "@/lib/advertisers";
import { shuffled, trackAdClick, trackAdView } from "@/lib/adTrack";

/**
 * Homepage "Local partners" strip: every sponsor at once as small equal cards, so no sponsor
 * is ever hidden behind another (Moe 2026-11-23). The server renders the fixed rotation order;
 * the browser shuffles it after hydration (same card sizes, so nothing jumps). Phones get a
 * swipe row, larger screens a grid.
 */
export function PartnersStrip() {
  const [order, setOrder] = useState<AdvertiserId[]>(ROTATION);
  const [mixed, setMixed] = useState(false);
  useEffect(() => {
    setOrder(shuffled(ROTATION));
    setMixed(true);
  }, []);

  return (
    <section aria-labelledby="partners-title" className="container-page mt-14 sm:mt-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">Sponsored</p>
          <h2 id="partners-title" className="mt-1 font-display text-2xl font-extrabold tracking-tight text-teal sm:text-3xl">
            Local partners
          </h2>
        </div>
      </div>
      <ul key={mixed ? "mixed" : "server"} className="-mx-4 mt-5 flex scroll-px-4 snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {order.map((id) => (
          <PartnerCard key={id} id={id} />
        ))}
      </ul>
    </section>
  );
}

function PartnerCard({ id }: { id: AdvertiserId }) {
  const ad = advertiser(id);
  const href = adHref(ad.cta.href, ad.id, "home-strip");
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          trackAdView(ad.id, "home-strip");
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ad.id]);

  return (
    <li ref={ref} className="w-[88%] shrink-0 snap-start sm:w-auto">
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={() => trackAdClick(ad.id, "home-strip")}
        aria-label={`${ad.name}: ${ad.line} (sponsored)`}
        className="group flex h-full overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="relative w-24 shrink-0 sm:w-32">
          <Image src={ad.photo.src} alt={ad.photo.alt} fill sizes="128px" className="object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4" style={{ backgroundColor: ad.tint }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.logoSrc}
            alt={ad.logoAlt}
            width={ad.logoSize[0]}
            height={ad.logoSize[1]}
            loading="lazy"
            decoding="async"
            style={{ height: `${Math.min(ad.logoHeightPx, 26)}px`, width: "auto", maxWidth: "100%", objectFit: "contain", alignSelf: "flex-start" }}
          />
          <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm font-semibold leading-snug text-teal">{ad.line}</p>
          <span className="mt-2 text-sm font-bold" style={{ color: ad.color }}>
            {ad.cta.label} <span aria-hidden>→</span>
          </span>
        </div>
      </a>
    </li>
  );
}
