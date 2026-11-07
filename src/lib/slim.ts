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
    season: b.season,
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

const WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

/**
 * One listing as sent to the client-side filter list (FilterableList). Every listing in a category
 * goes into the page as JSON, so this holds only what a card shows and what the filters and sorts
 * read, and leaves out empty fields. `hours` is the seven days Monday to Sunday joined by "\n",
 * where an empty day means "same as the day before" and "-" means no hours given for that day.
 */
export type ListItem = {
  name: string;
  slug: string;
  category: string;
  neighborhood: string;
  photo?: string;
  logo?: string;
  /** Hand-written description, trimmed to what a two-line card can show. */
  description?: string;
  rating?: number;
  reviews?: number;
  price?: Business["price_range"];
  amenities?: string[];
  hours?: string;
  season?: Business["season"];
  listed?: string;
  premium?: true;
  pinned?: true;
};

export function toListItem(b: Business): ListItem {
  const out: ListItem = { name: b.name, slug: b.slug, category: b.category, neighborhood: b.neighborhood ?? "" };
  const desc = b.generatedDescription ? "" : (b.description ?? "").trim();
  if (b.photos?.[0]) out.photo = b.photos[0];
  if (b.logo) out.logo = b.logo;
  if (desc) out.description = desc.length > 180 ? `${desc.slice(0, 177)}…` : desc;
  if (b.rating) out.rating = b.rating;
  if (b.review_count) out.reviews = b.review_count;
  if (b.price_range) out.price = b.price_range;
  if (b.amenities?.length) out.amenities = b.amenities;
  if (b.hours) {
    const days = WEEK.map((d) => b.hours[d] || "-");
    out.hours = days.map((d, i) => (i > 0 && d === days[i - 1] ? "" : d)).join("\n");
  }
  if (b.season) out.season = b.season;
  if (b.date_listed) out.listed = b.date_listed;
  if (b.tier === "premium") out.premium = true;
  if (b.pinned) out.pinned = true;
  return out;
}

/** Back to the Business shape BusinessCard and openStatus read (only the fields toListItem kept). */
export function fromListItem(x: ListItem): Business {
  let hours: Business["hours"] | undefined;
  if (x.hours != null) {
    const days = x.hours.split("\n");
    for (let i = 1; i < 7; i++) if (!days[i]) days[i] = days[i - 1];
    hours = Object.fromEntries(WEEK.map((d, i) => [d, days[i] === "-" ? "" : days[i] ?? ""])) as Business["hours"];
  }
  return {
    name: x.name,
    slug: x.slug,
    category: x.category,
    tier: x.premium ? "premium" : "basic",
    pinned: x.pinned,
    logo: x.logo,
    description: x.description ?? "",
    neighborhood: x.neighborhood,
    hours: hours as Business["hours"],
    season: x.season,
    photos: x.photo ? [x.photo] : [],
    rating: x.rating ?? 0,
    review_count: x.reviews ?? 0,
    price_range: x.price as Business["price_range"],
    amenities: x.amenities ?? [],
    date_listed: x.listed ?? "",
    address: "",
    tags: [],
    active: true,
  };
}
