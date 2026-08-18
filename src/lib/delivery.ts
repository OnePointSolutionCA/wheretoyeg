import type { Business } from "./types";

const FOOD_CATEGORIES = new Set(["restaurants", "cafes-coffee-shops", "bakeries"]);

export function isFoodBusiness(b: Business): boolean {
  if (FOOD_CATEGORIES.has(b.category)) return true;
  const t = (b.tags ?? []).map((x) => x.toLowerCase());
  return t.some((x) => ["restaurant", "food", "cafe", "coffee", "bakery", "shawarma", "kebab", "pizza", "burger"].includes(x));
}

export function deliveryLinks(b: Business): { label: string; href: string; brandClass: string }[] {
  if (!isFoodBusiness(b)) return [];
  const q = encodeURIComponent(`${b.name} ${b.address}`);
  return [
    {
      label: "Uber Eats",
      href: `https://www.ubereats.com/ca/search?q=${q}`,
      brandClass: "bg-black text-white hover:bg-neutral-800",
    },
    {
      label: "DoorDash",
      href: `https://www.doordash.com/search/store/${q}/`,
      brandClass: "bg-[#EB1700] text-white hover:bg-[#c81400]",
    },
    {
      label: "SkipTheDishes",
      href: `https://www.skipthedishes.com/search?query=${q}`,
      brandClass: "bg-[#FF8000] text-white hover:bg-[#e07000]",
    },
  ];
}
