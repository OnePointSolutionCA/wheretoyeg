"use client";

import { useEffect, useState } from "react";
import type { Business } from "@/lib/types";
import { BusinessCard } from "./BusinessCard";
import { Card3D } from "./Card3D";
import { Carousel } from "./Carousel";
import { LISTING_SPONSOR } from "@/lib/advertisers";
import { shuffled, trackAdClick } from "@/lib/adTrack";

/**
 * The first `shuffleFirst` cards are the premium listings (sponsors first). The server renders them in a fixed order
 * (the page is cached), then the browser shuffles them after hydration, so every page load
 * can show a different sponsor first. Same cards, same sizes: no layout shift, and the first
 * client render matches the server, so no hydration mismatch.
 */
export function FeaturedCarousel({
  businesses,
  categoryNames,
  shuffleFirst = 0,
}: {
  businesses: Business[];
  categoryNames: Record<string, string>;
  shuffleFirst?: number;
}) {
  const [items, setItems] = useState(businesses);
  const [mixed, setMixed] = useState(false);

  useEffect(() => {
    if (shuffleFirst < 2) {
      setItems(businesses);
      return;
    }
    setItems([...shuffled(businesses.slice(0, shuffleFirst)), ...businesses.slice(shuffleFirst)]);
    setMixed(true);
  }, [businesses, shuffleFirst]);

  return (
    // Remount after the shuffle so the row starts at its (new) first card instead of
    // the browser keeping the old first card in view.
    <Carousel key={mixed ? "mixed" : "server"} label="Featured businesses" itemClassName="w-[85%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
      {items.map((b) => (
        <div
          key={b.slug}
          className="h-full"
          onClickCapture={() => {
            const sponsor = LISTING_SPONSOR.get(b.slug);
            if (sponsor) trackAdClick(sponsor, "featured");
          }}
        >
          <Card3D>
            <BusinessCard business={b} categoryName={categoryNames[b.category]} />
          </Card3D>
        </div>
      ))}
    </Carousel>
  );
}
