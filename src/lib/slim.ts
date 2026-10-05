import type { Business } from "./types";

/** Only the fields a BusinessCard and the filter bar read, so client payloads stay small. */
export function toCard(b: Business): Business {
  const desc = b.generatedDescription ? "" : b.description ?? "";
  return {
    name: b.name,
    slug: b.slug,
    category: b.category,
    subcategory: b.subcategory,
    tier: b.tier,
    pinned: b.pinned,
    logo: b.logo,
    description: desc.length > 180 ? `${desc.slice(0, 177)}…` : desc,
    generatedDescription: b.generatedDescription,
    neighborhood: b.neighborhood,
    hours: b.hours,
    photos: b.photos?.slice(0, 1) ?? [],
    rating: b.rating,
    review_count: b.review_count,
    price_range: b.price_range,
    amenities: b.amenities ?? [],
    date_listed: b.date_listed,
    address: "",
    tags: [],
    active: true,
  };
}

export type SearchBusiness = Business & { catName: string; subName?: string; keywords: string[] };
