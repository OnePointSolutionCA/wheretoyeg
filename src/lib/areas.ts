/**
 * Area hubs: one page per category (or subcategory) per neighborhood or nearby town,
 * e.g. /restaurants/sherwood-park and /medical/dentists/st-albert.
 * Pages exist from HUB_MIN listings and are indexed from HUB_INDEX listings.
 */

import type { Business } from "./types";
import { getBusinesses, getCategories } from "./content";
import { SITE } from "./site";
import { areaSlug } from "./place";

export const HUB_MIN = 3;
export const HUB_INDEX = 5;

/** Short, factual intro for each area. Shown on neighborhood pages and area hubs. */
export const AREA_INTRO: Record<string, string> = {
  Downtown: "Downtown is Edmonton's core, around Jasper Avenue, Churchill Square and the Ice District.",
  "Whyte Ave": "Whyte Ave is 82 Avenue on Edmonton's south side, running through Old Strathcona near the University of Alberta.",
  "Jasper Ave": "Jasper Avenue is the main street through downtown Edmonton and Oliver.",
  "124 Street": "124 Street runs through the west side of Edmonton's core, between Oliver and Westmount, with local shops, galleries and places to eat.",
  "West Edmonton": "West Edmonton covers the city's west end, including the area around West Edmonton Mall.",
  "South Edmonton": "South Edmonton covers the city's south side, including South Edmonton Common.",
  "Mill Woods": "Mill Woods is a large community in southeast Edmonton, centred on Mill Woods Town Centre.",
  Windermere: "Windermere is in southwest Edmonton, near Terwillegar and the Currents of Windermere shopping centre.",
  "Sherwood Park": "Sherwood Park is just east of Edmonton in Strathcona County.",
  "St. Albert": "St. Albert is a city on Edmonton's northwest edge, along the Sturgeon River.",
  "Spruce Grove": "Spruce Grove is a city just west of Edmonton along Highway 16, next to Stony Plain.",
  "North Edmonton": "North Edmonton covers the north side of the city.",
  Beverly: "Beverly is an older neighborhood in northeast Edmonton, along 118 Avenue.",
  "Castle Downs": "Castle Downs is a group of neighborhoods in north Edmonton.",
  Beaumont: "Beaumont is a city just south of Edmonton with French Canadian roots.",
  Leduc: "Leduc is a city south of Edmonton, next to Edmonton International Airport and Nisku.",
  "Fort Saskatchewan": "Fort Saskatchewan is a city northeast of Edmonton on the North Saskatchewan River.",
  "Stony Plain": "Stony Plain is a town west of Edmonton, next to Spruce Grove, known for its outdoor murals.",
};

export function areaFromSlug(slug: string): string | undefined {
  return SITE.neighborhoods.find((n) => areaSlug(n) === slug);
}

export function hubHref(category: string, area: string, sub?: string): string {
  return sub ? `/${category}/${sub}/${areaSlug(area)}` : `/${category}/${areaSlug(area)}`;
}

/** Bayesian average so a 5.0 with 3 reviews doesn't outrank a 4.8 with 900. */
export function rankScore(b: Business): number {
  const v = Number(b.review_count) || 0;
  return ((Number(b.rating) || 0) * v + 4.3 * 50) / (v + 50);
}

export const byRank = (a: Business, b: Business) => rankScore(b) - rankScore(a);

type Counts = { cat: Map<string, number>; sub: Map<string, number> };
const CACHE = process.env.NODE_ENV === "production";
let countsCache: Counts | null = null;

function counts(): Counts {
  if (CACHE && countsCache) return countsCache;
  const named = new Set(SITE.neighborhoods);
  const cat = new Map<string, number>();
  const sub = new Map<string, number>();
  for (const b of getBusinesses()) {
    if (!named.has(b.neighborhood)) continue;
    const ck = `${b.category}|${b.neighborhood}`;
    cat.set(ck, (cat.get(ck) ?? 0) + 1);
    if (b.subcategory) {
      const sk = `${b.category}/${b.subcategory}|${b.neighborhood}`;
      sub.set(sk, (sub.get(sk) ?? 0) + 1);
    }
  }
  const out = { cat, sub };
  if (CACHE) countsCache = out;
  return out;
}

export function hubCount(category: string, area: string, sub?: string): number {
  const c = counts();
  return sub ? c.sub.get(`${category}/${sub}|${area}`) ?? 0 : c.cat.get(`${category}|${area}`) ?? 0;
}

/**
 * A subcategory hub that lists exactly the same businesses as its category hub
 * (every gym in Leduc is under "Gyms"). It points its canonical at the category hub instead.
 */
export function isRedundantSubHub(category: string, sub: string, area: string): boolean {
  const n = hubCount(category, area, sub);
  return n > 0 && n === hubCount(category, area);
}

export type AreaLink = { area: string; href: string; count: number };

/** Areas that have a hub for this category or subcategory, biggest first. */
export function hubsForCategory(category: string, sub?: string, min = HUB_MIN): AreaLink[] {
  return SITE.neighborhoods
    .map((area) => ({ area, href: hubHref(category, area, sub), count: hubCount(category, area, sub) }))
    .filter((x) => x.count >= min)
    .sort((a, b) => b.count - a.count || a.area.localeCompare(b.area));
}

export type CategoryLink = { slug: string; name: string; href: string; count: number };

/** Category hubs inside one area, biggest first. */
export function hubsForArea(area: string, min = HUB_MIN): CategoryLink[] {
  return getCategories()
    .map((c) => ({ slug: c.slug, name: c.name, href: hubHref(c.slug, area), count: hubCount(c.slug, area) }))
    .filter((x) => x.count >= min)
    .sort((a, b) => b.count - a.count);
}

/** Subcategory hubs inside one area for one category. */
export function subHubsForArea(category: string, area: string, min = HUB_MIN): CategoryLink[] {
  const cat = getCategories().find((c) => c.slug === category);
  return (cat?.subcategories ?? [])
    .map((s) => ({ slug: s.slug, name: s.name, href: hubHref(category, area, s.slug), count: hubCount(category, area, s.slug) }))
    .filter((x) => x.count >= min)
    .sort((a, b) => b.count - a.count);
}

export type Hub = { category: string; sub?: string; area: string; count: number };

/** Every hub page that should exist (count >= min). */
export function allHubs(min = HUB_MIN): Hub[] {
  const out: Hub[] = [];
  for (const c of getCategories()) {
    for (const area of SITE.neighborhoods) {
      const n = hubCount(c.slug, area);
      if (n >= min) out.push({ category: c.slug, area, count: n });
      for (const s of c.subcategories ?? []) {
        const m = hubCount(c.slug, area, s.slug);
        if (m >= min) out.push({ category: c.slug, sub: s.slug, area, count: m });
      }
    }
  }
  return out;
}

let namePlaceCache: Map<string, number> | null = null;
const namePlaceKey = (b: Business) => `${b.name.toLowerCase().trim()}|${b.neighborhood}`;

/** How many active listings share this name and area (chain branches), so titles can add the street. */
export function namePlaceCount(b: Business): number {
  if (!(CACHE && namePlaceCache)) {
    const m = new Map<string, number>();
    for (const x of getBusinesses()) m.set(namePlaceKey(x), (m.get(namePlaceKey(x)) ?? 0) + 1);
    if (!CACHE) return m.get(namePlaceKey(b)) ?? 1;
    namePlaceCache = m;
  }
  return namePlaceCache!.get(namePlaceKey(b)) ?? 1;
}

// ---------------------------------------------------------------------------
// Duplicate listings: same name and street under two slugs. Until the data is merged,
// the extra copy points its canonical at the primary and stays out of the sitemap.
// ---------------------------------------------------------------------------

let dupCache: Map<string, string> | null = null;

const normKey = (b: Business) =>
  `${b.name.toLowerCase().replace(/[^a-z0-9]/g, "")}|${(b.address ?? "").split(",")[0].toLowerCase().replace(/[^a-z0-9]/g, "")}`;

/** Prefer the clean slug: no "---", no trailing "-2", then the shortest. */
function slugQuality(slug: string): number {
  return (slug.includes("---") ? 100 : 0) + (/-\d+$/.test(slug) ? 50 : 0) + slug.length / 1000;
}

/** Map of duplicate slug to the primary listing's "/category/slug" path. */
export function duplicateCanonicals(): Map<string, string> {
  if (CACHE && dupCache) return dupCache;
  const groups = new Map<string, Business[]>();
  for (const b of getBusinesses()) {
    if (!b.address) continue;
    const k = normKey(b);
    groups.set(k, [...(groups.get(k) ?? []), b]);
  }
  const map = new Map<string, string>();
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => slugQuality(a.slug) - slugQuality(b.slug));
    const primary = sorted[0];
    for (const d of sorted.slice(1)) map.set(d.slug, `/${primary.category}/${primary.slug}`);
  }
  if (CACHE) dupCache = map;
  return map;
}
