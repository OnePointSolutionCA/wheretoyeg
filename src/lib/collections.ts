import type { Business } from "./types";
import { openStatus } from "./openNow";

export type Collection = {
  slug: string;
  emoji: string;
  title: string;
  headline: string;
  description: string;
  gradient: string; // Tailwind gradient class fragment: "from-X via-Y to-Z"
  match: (b: Business) => boolean;
};

const hasAmenity = (b: Business, a: string) =>
  b.amenities?.some((x) => x.toLowerCase() === a.toLowerCase()) ?? false;

const hasTag = (b: Business, ...ts: string[]) => {
  const set = new Set((b.tags ?? []).map((t) => t.toLowerCase()));
  return ts.some((t) => set.has(t));
};

// Parse "10:00 PM" → 22, "12:00 AM" → 24 (represents end-of-day)
function parseHour(s: string): number | null {
  const m = s.match(/(\d{1,2}):?(\d{0,2})\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const suf = m[3].toUpperCase();
  if (suf === "PM" && h !== 12) h += 12;
  if (suf === "AM" && h === 12) h = 24;
  return h;
}

function isOpenLate(b: Business): boolean {
  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
  let lateCount = 0;
  for (const d of days) {
    const range = b.hours?.[d] ?? "";
    if (/24 hours/i.test(range)) return true;
    const parts = range.split("-");
    if (parts.length !== 2) continue;
    const end = parseHour(parts[1]);
    if (end != null && end >= 22) lateCount++;
  }
  return lateCount >= 3;
}

function isOpenSunday(b: Business): boolean {
  const s = b.hours?.sunday ?? "";
  return !!s && !/closed/i.test(s);
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "late-night-eats",
    emoji: "🌙",
    title: "Late-Night Eats",
    headline: "Open past 10pm",
    description: "Kitchens still cooking when everywhere else has closed. Shawarma runs, halal comfort food, and dessert cafes for after-hours cravings.",
    gradient: "from-[#0e1a2b] via-[#1a3352] to-[#2b4d7a]",
    match: (b) =>
      (b.category === "restaurants" || b.category === "cafes-coffee-shops" || b.category === "bakeries") &&
      isOpenLate(b),
  },
  {
    slug: "brunch-spots",
    emoji: "🥞",
    title: "Weekend Brunch",
    headline: "Where locals actually go",
    description: "Weekend brunch spots — shakshuka, benedicts, halal Lebanese breakfasts, and coffee that's actually good. Book ahead.",
    gradient: "from-[#f4b183] via-[#e08a3e] to-[#a85715]",
    match: (b) =>
      b.category === "restaurants" &&
      (hasAmenity(b, "Weekend Brunch") || hasTag(b, "brunch")),
  },
  {
    slug: "halal-foodie-tour",
    emoji: "🥩",
    title: "Halal Foodie Tour",
    headline: "The city's best halal",
    description: "From smash burgers to shawarma to Pakistani karahi — Edmonton's halal food scene, curated by locals.",
    gradient: "from-[#2b5747] via-[#3d7c60] to-[#5aad83]",
    match: (b) =>
      (b.category === "restaurants" || b.category === "bakeries") &&
      hasAmenity(b, "Halal") &&
      (b.rating ?? 0) >= 4.3,
  },
  {
    slug: "coffee-and-work",
    emoji: "☕",
    title: "Coffee & Work",
    headline: "Wifi, tables, real espresso",
    description: "Third-wave coffee shops where you can actually camp for two hours with a laptop and nobody side-eyes you.",
    gradient: "from-[#4a3520] via-[#6b4e2f] to-[#9b7444]",
    match: (b) => b.category === "cafes-coffee-shops",
  },
  {
    slug: "date-night",
    emoji: "💫",
    title: "Date Night",
    headline: "Nice tables, no chains",
    description: "First-date to fifth-anniversary spots. Real hospitality, intentional menus, no fluorescent lighting.",
    gradient: "from-[#3d1a2b] via-[#6b2c4a] to-[#a34172]",
    match: (b) =>
      b.category === "restaurants" &&
      (b.price_range === "$$$" || b.price_range === "$$$$" || (b.rating ?? 0) >= 4.5),
  },
  {
    slug: "self-care-saturday",
    emoji: "💆",
    title: "Self-Care Saturday",
    headline: "Spas, nails, lashes, hair",
    description: "A full reset in one weekend. Facials, mani-pedis, lash refills, and blowouts across the city.",
    gradient: "from-[#5c3c6b] via-[#8355a2] to-[#b385d1]",
    match: (b) =>
      b.category === "spas-esthetics" ||
      b.category === "nail-salons" ||
      b.category === "lash-techs" ||
      b.category === "hair-salons",
  },
  {
    slug: "family-sundays",
    emoji: "👨‍👩‍👧",
    title: "Family Sundays",
    headline: "Kid-friendly & open",
    description: "Sunday-open spots that welcome the whole family — big portions, no attitude, easy parking.",
    gradient: "from-[#1e5a5f] via-[#2d8a91] to-[#4fc3cb]",
    match: (b) =>
      hasAmenity(b, "Family Friendly") && isOpenSunday(b),
  },
  {
    slug: "sweet-tooth",
    emoji: "🍰",
    title: "Sweet Tooth",
    headline: "Cakes, pastries, boba",
    description: "Dessert cafes, halal sweets shops, artisan bakeries, and the best boba in Edmonton.",
    gradient: "from-[#c85a7f] via-[#e08aa8] to-[#f4bacf]",
    match: (b) =>
      b.category === "bakeries" ||
      hasTag(b, "boba", "bubble-tea", "dessert", "sweets", "ice-cream", "pastries"),
  },
  {
    slug: "fresh-and-healthy",
    emoji: "🥗",
    title: "Fresh & Healthy",
    headline: "Vegan, vegetarian, clean bowls",
    description: "Plant-forward restaurants and cafes for when you want to eat well without giving up flavour.",
    gradient: "from-[#3a6a3a] via-[#5a9a5a] to-[#8bc98b]",
    match: (b) =>
      hasAmenity(b, "Vegan") ||
      hasAmenity(b, "Vegan Options") ||
      hasAmenity(b, "Vegetarian") ||
      hasTag(b, "vegan", "vegetarian"),
  },
  {
    slug: "hidden-gems",
    emoji: "💎",
    title: "Hidden Gems",
    headline: "Great, but not on TikTok yet",
    description: "Highly rated Edmonton spots with under 150 reviews. Get here before the algorithm does.",
    gradient: "from-[#2d4059] via-[#4a6a8f] to-[#7096be]",
    match: (b) => (b.rating ?? 0) >= 4.6 && (b.review_count ?? 0) < 150 && (b.review_count ?? 0) > 0,
  },
  {
    slug: "middle-eastern-favourites",
    emoji: "🥙",
    title: "Middle Eastern Favourites",
    headline: "Shawarma, kebabs, mezze",
    description: "Lebanese, Palestinian, Syrian, Yemeni, and Afghan food across Edmonton — the halal Middle Eastern scene locals live off.",
    gradient: "from-[#5c2f1a] via-[#8a4d2b] to-[#c07546]",
    match: (b) =>
      hasTag(b, "shawarma", "lebanese", "palestinian", "middle-eastern", "afghan", "yemeni", "syrian", "kebab"),
  },
  {
    slug: "grand-opening",
    emoji: "✨",
    title: "New in Edmonton",
    headline: "Just added to the map",
    description: "The newest listings on WhereToYEG — cafes, shops, and services that opened recently.",
    gradient: "from-[#6a4a1e] via-[#a37432] to-[#dba458]",
    match: (b) => {
      const d = b.date_listed || "";
      return d.startsWith("2026-08") || d.startsWith("2026-07");
    },
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}

export function getBusinessesForCollection(collection: Collection, all: Business[]): Business[] {
  return all
    .filter(collection.match)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.review_count ?? 0) - (a.review_count ?? 0));
}
