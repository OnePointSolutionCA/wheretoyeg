import type { Business } from "./types";

const FOOD_CATEGORIES = new Set(["restaurants", "cafes-coffee-shops", "bakeries"]);

export function isFoodBusiness(b: Business): boolean {
  if (FOOD_CATEGORIES.has(b.category)) return true;
  const t = (b.tags ?? []).map((x) => x.toLowerCase());
  return t.some((x) => ["restaurant", "food", "cafe", "coffee", "bakery", "shawarma", "kebab", "pizza", "burger"].includes(x));
}

type Platform = {
  key: "uber_eats" | "doordash" | "skipthedishes";
  label: string;
  brandClass: string;
  searchUrl: (name: string) => string;
};

const PLATFORMS: Platform[] = [
  {
    key: "uber_eats",
    label: "Uber Eats",
    brandClass: "bg-black text-white hover:bg-neutral-800",
    searchUrl: (name) => `https://www.ubereats.com/ca/search?q=${encodeURIComponent(name)}`,
  },
  {
    key: "doordash",
    label: "DoorDash",
    brandClass: "bg-[#EB1700] text-white hover:bg-[#c81400]",
    searchUrl: (name) => `https://www.doordash.com/search/store/${encodeURIComponent(name)}/`,
  },
  {
    key: "skipthedishes",
    label: "SkipTheDishes",
    brandClass: "bg-[#FF8000] text-white hover:bg-[#e07000]",
    searchUrl: (name) => `https://www.skipthedishes.com/search?query=${encodeURIComponent(name)}`,
  },
];

export function deliveryLinks(b: Business): { label: string; href: string; brandClass: string }[] {
  if (!isFoodBusiness(b)) return [];
  const out: { label: string; href: string; brandClass: string }[] = [];
  for (const p of PLATFORMS) {
    const val = b[p.key];
    // Explicit false → hide.
    if (val === false) continue;
    // String URL → direct link.
    if (typeof val === "string" && val.length > 0) {
      out.push({ label: p.label, href: val, brandClass: p.brandClass });
      continue;
    }
    // true or undefined → default search-by-name link.
    out.push({ label: p.label, href: p.searchUrl(b.name), brandClass: p.brandClass });
  }
  return out;
}
