import type { FaqEntry } from "@/components/FaqSection";
import type { Business, Category } from "./types";
import { SITE } from "./site";
import { areaSlug } from "./place";
import { SUB_HEADING, lowerHeading } from "./seo";

const NOUN: Record<string, string> = {
  restaurants: "restaurants",
  bakeries: "bakeries",
  "cafes-coffee-shops": "cafés and coffee shops",
  barbers: "barbershops",
  "hair-salons": "hair salons",
  "nail-salons": "nail salons",
  "lash-techs": "lash techs",
  "spas-esthetics": "spas",
  "gyms-fitness": "gyms",
  "auto-repair": "auto repair shops",
  plumbers: "plumbers",
  electricians: "electricians",
  "cleaning-services": "cleaning services",
  "grocery-markets": "grocery stores",
  medical: "clinics and health services",
  photographers: "photographers",
  "professional-services": "professional services",
  catering: "caterers",
  "activities-fun": "things to do",
};

const HALAL_RELEVANT = new Set(["restaurants", "bakeries", "cafes-coffee-shops", "grocery-markets", "catering"]);

const nf = (n: number) => n.toLocaleString("en-CA");
const slugify = areaSlug;
const join = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/** Bayesian average so a 5.0 with 3 reviews doesn't outrank a 4.8 with 900. */
function score(b: Business) {
  const v = Number(b.review_count) || 0;
  const r = Number(b.rating) || 0;
  return (r * v + 4.3 * 50) / (v + 50);
}

const byScore = (a: Business, b: Business) => score(b) - score(a);

/** One pick per brand, so chain locations sharing a review count don't fill every slot. */
function distinct(list: Business[], n: number) {
  const seen = new Set<string>();
  const out: Business[] = [];
  for (const b of list) {
    const brand = b.name.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).slice(0, 2).join(" ");
    if (seen.has(brand)) continue;
    seen.add(brand);
    out.push(b);
    if (out.length >= n) break;
  }
  return out;
}
const href = (b: Business) => `/${b.category}/${b.slug}`;
const mention = (b: Business) => `${b.name} (${Number(b.rating).toFixed(1)}★, ${nf(b.review_count)} reviews)`;

/** Full display name for a subcategory, e.g. "Mexican" under Restaurants becomes "Mexican Restaurants". */
export function subLabel(categorySlug: string, subName: string, subSlug?: string) {
  const heading = subSlug ? SUB_HEADING[categorySlug]?.[subSlug] : undefined;
  if (heading) return heading;
  return categorySlug === "restaurants" && !/restaurant/i.test(subName) ? `${subName} Restaurants` : subName;
}

/** Same label for use mid-sentence: cuisine names keep their capital, generic words go lowercase. */
export function subNoun(categorySlug: string, subName: string, subSlug?: string) {
  const heading = subSlug ? SUB_HEADING[categorySlug]?.[subSlug] : undefined;
  if (heading) return lowerHeading(heading);
  return categorySlug === "restaurants" && !/restaurant/i.test(subName) ? `${subName} restaurants` : subName.toLowerCase();
}

export function categoryFaq(
  c: Category,
  businesses: Business[],
  opts: {
    noun?: string;
    basePath?: string;
    /** Area name for hub pages ("Sherwood Park"); questions then ask about that area instead of Edmonton. */
    place?: string;
    /** Display form of the area for answers ("Sherwood Park, AB"). */
    placeFull?: string;
    /** Link for an area's hub page, when one exists. */
    areaHref?: (area: string) => string | undefined;
    /** Where the "all halal" link should go. */
    halalHref?: string;
  } = {},
): FaqEntry[] {
  if (businesses.length === 0) return [];
  const noun = opts.noun ?? NOUN[c.slug] ?? c.name.toLowerCase();
  const basePath = opts.basePath ?? `/${c.slug}`;
  const where = opts.place ?? "Edmonton";
  const whereFull = opts.placeFull ?? where;
  const items: FaqEntry[] = [];

  const top = distinct(businesses.filter((b) => b.rating > 0 && b.review_count >= 10).sort(byScore), 3);
  if (top.length >= 2) {
    items.push({
      q: `What are the best ${noun} in ${where}?`,
      a: `Ranked by Google rating and review volume, the top ${noun} on WhereToYEG right now are ${join(top.map(mention))}. Ratings refresh as new reviews come in.`,
      links: top.map((b) => ({ label: b.name, href: href(b) })),
    });
  }

  const counts = new Map<string, number>();
  for (const b of businesses) {
    if (!b.neighborhood || /^edmonton\b|multiple/i.test(b.neighborhood)) continue;
    counts.set(b.neighborhood, (counts.get(b.neighborhood) ?? 0) + 1);
  }
  const areas = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);
  if (businesses.length >= 3 && opts.place) items.push({
    q: `How many ${noun} are in ${where}?`,
    a: `WhereToYEG lists ${nf(businesses.length)} ${noun} in ${whereFull}. Filter by price, rating, or amenity at the top of this page, or use the Open now filter to see who is open.`,
    links: [{ label: `Everything in ${where}`, href: `/neighborhoods/${slugify(where)}` }],
  });
  else if (businesses.length >= 3) items.push({
    q: `How many ${noun} are listed on WhereToYEG?`,
    a: `${nf(businesses.length)} ${noun} across Edmonton and nearby communities${areas.length ? `, with the most listings in ${join(areas)}` : ""}. Filter by price, rating, or amenity at the top of this page.`,
    links: areas
      .filter((n) => SITE.neighborhoods.includes(n))
      .map((n) => ({ label: `${n}`, href: opts.areaHref?.(n) ?? `/neighborhoods/${slugify(n)}` })),
  });

  const sunday = businesses
    .filter((b) => b.hours?.sunday && !/closed/i.test(b.hours.sunday) && b.rating > 0)
    .sort(byScore);
  if (sunday.length >= 3) {
    const picks = distinct(sunday, 3);
    items.push({
      q: `Which ${noun} are open on Sunday in ${where}?`,
      a: `${nf(sunday.length)} of the listed ${noun} show Sunday hours, including ${join(picks.map((b) => `${b.name} (${b.hours.sunday})`))}. Hours change, so check the listing or call ahead.`,
      links: picks.map((b) => ({ label: b.name, href: href(b) })),
    });
  }

  const halal = businesses.filter((b) => b.amenities?.includes("Halal")).sort(byScore);
  if (HALAL_RELEVANT.has(c.slug) && halal.length >= 2) {
    items.push({
      q: `Are there halal ${noun} in ${where}?`,
      a: `Yes. ${nf(halal.length)} ${noun} on WhereToYEG are marked halal, including ${join(distinct(halal, 3).map((b) => b.name))}. If certification matters to you, confirm it with the business directly.`,
      links: [{ label: `All halal ${noun}`, href: opts.halalHref ?? `${basePath}?amenity=Halal` }],
    });
  }

  items.push({
    q: `How do I add my business to WhereToYEG?`,
    a: `Submit it through the Get Listed page. Listings are free, and most go live within a few days.`,
    links: [{ label: "Get listed", href: "/get-listed" }],
  });

  return items;
}
