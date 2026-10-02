import type { Business } from "./types";
import { getBusinesses, getCategories } from "./content";

export const neighborhoodSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

const score = (b: Business) => {
  const v = Number(b.review_count) || 0;
  return ((Number(b.rating) || 0) * v + 4.3 * 50) / (v + 50);
};

// Venues whose photos read as "a place to go", so area covers aren't X-rays or office signs.
const COVER_CATEGORIES = ["restaurants", "cafes-coffee-shops", "bakeries", "activities-fun", "grocery-markets"];

function pickCover(ranked: Business[]) {
  for (const cat of COVER_CATEGORIES) {
    const hit = ranked.find((b) => b.category === cat && b.photos?.length);
    if (hit) return hit.photos[0];
  }
  return ranked.find((b) => b.photos?.length)?.photos[0];
}

export function neighborhoodStats(name: string, all: Business[] = getBusinesses()) {
  const businesses = all.filter((b) => b.neighborhood === name).sort((a, b) => score(b) - score(a));
  const catNames = new Map(getCategories().map((c) => [c.slug, c.name]));
  const counts = new Map<string, number>();
  for (const b of businesses) counts.set(b.category, (counts.get(b.category) ?? 0) + 1);
  const topCategories = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([slug, count]) => ({ slug, name: catNames.get(slug) ?? slug, count }));
  const rated = businesses.filter((b) => b.rating > 0 && b.review_count > 0);
  return {
    businesses,
    topCategories,
    cover: pickCover(businesses),
    avgRating: rated.length ? rated.reduce((s, b) => s + Number(b.rating), 0) / rated.length : 0,
    reviews: rated.reduce((s, b) => s + Number(b.review_count), 0),
  };
}
