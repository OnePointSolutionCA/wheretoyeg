import { getBlogPosts, type BlogPost } from "./blog";

export const KEYWORDS: Record<string, string[]> = {
  restaurants: ["restaurant", "food", "shawarma", "pizza", "sushi", "brunch", "burger", "where-to-eat", "mexican", "thai", "korean", "chinese", "vietnamese", "italian", "ethiopian", "pakistani", "indian"],
  bakeries: ["bakeries", "bakery", "dessert"],
  "cafes-coffee-shops": ["coffee", "cafe", "boba", "bubble-tea", "dessert"],
  barbers: ["barber"],
  "hair-salons": ["hair-salon"],
  "nail-salons": ["nail"],
  "lash-techs": ["lash"],
  "spas-esthetics": ["spa", "massage"],
  "gyms-fitness": ["gym", "yoga", "climbing"],
  "auto-repair": ["auto-repair", "collision"],
  plumbers: ["plumber"],
  electricians: ["electrician"],
  "cleaning-services": ["cleaning"],
  "grocery-markets": ["grocery", "halal-meat"],
  medical: ["dentist", "eye-care", "hearing", "chiropractic", "pharmac", "walk-in", "diagnostic", "medical", "braces"],
  photographers: ["photographer"],
  "professional-services": ["law"],
  catering: ["catering"],
  "activities-fun": ["things-to-do", "escape", "climbing", "activities"],
};

/** Blog posts most relevant to a category, strongest slug/tag match first, then newest. */
export function relatedPosts(category: string, limit = 3, exclude?: string): BlogPost[] {
  const kws = KEYWORDS[category] ?? [category];
  return getBlogPosts()
    .filter((p) => p.slug !== exclude)
    .map((p) => ({
      p,
      score:
        kws.filter((k) => p.slug.includes(k)).length * 2 +
        kws.filter((k) => p.tags?.some((t) => t.includes(k))).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.publishedDate.localeCompare(a.p.publishedDate))
    .slice(0, limit)
    .map((x) => x.p);
}
