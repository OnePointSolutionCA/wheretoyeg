/**
 * Sponsors the site rotates between: OnePoint plus OnePoint's paying Edmonton SEO clients.
 * Each ad is one real photo from the sponsor's own site, their logo, one short line and
 * one button in their brand colour. Their directory listings stay separate (pinned Premium).
 */

import { edmontonDay } from "./daily";

export type AdvertiserId = "onepoint" | "fixauto" | "oxford" | "hearing" | "flowers" | "sanctuary" | "beaumaris" | "ironforce" | "dentclinic";

export type Advertiser = {
  id: AdvertiserId;
  name: string;
  logoSrc: string;
  /** Intrinsic [width, height] of logoSrc, so the browser reserves the logo width before it loads. */
  logoSize: [number, number];
  logoAlt: string;
  /** Rendered logo height in px; square or tall marks need more than wide wordmarks. */
  logoHeightPx: number;
  /** Real photo from the sponsor's own site, 3:2, in /public/ads. */
  photo: { src: string; alt: string };
  /** Small label above the line, e.g. what and where. */
  kicker: string;
  /** The one short line. No dashes, no promised results. */
  line: string;
  cta: { label: string; href: string };
  /** Brand colour for the button (white text must read on it). */
  color: string;
  /** Very light brand tint for the card background. */
  tint: string;
  /** Their WhereToYEG listing slugs (Premium + pinned); these jump to the top of matching searches. */
  listings?: string[];
  /** Words people search for that should surface their listing first. */
  searchTerms?: string;
};

const ADVERTISERS: Record<AdvertiserId, Advertiser> = {
  onepoint: {
    id: "onepoint",
    name: "OnePoint Solutions",
    logoSrc: "/logos/onepoint-horizontal-sm.webp",
    logoSize: [786, 120],
    logoAlt: "OnePoint Solutions Marketing Agency",
    logoHeightPx: 26,
    photo: { src: "/ads/onepoint.webp", alt: "Downtown Edmonton skyline" },
    kicker: "Edmonton marketing agency",
    line: "Websites, SEO and social media for Edmonton businesses.",
    cta: { label: "Get a free SEO audit", href: "https://onepointsolution.ca/free-seo-audit/" },
    color: "#C9691C",
    tint: "#FBF3EB",
  },
  fixauto: {
    id: "fixauto",
    name: "Fix Auto Sherwood North",
    logoSrc: "/logos/fix-auto-sm.webp",
    logoSize: [422, 180],
    logoAlt: "Fix Auto Sherwood North",
    logoHeightPx: 52,
    photo: { src: "/ads/fixauto.webp", alt: "Fix Auto Sherwood North shop on Provincial Avenue" },
    kicker: "Collision repair in Sherwood Park",
    line: "Collision repair, dents and paint, with free estimates.",
    cta: { label: "Get a free estimate", href: "https://fixauto.com/ca/en/shop/fix-auto-sherwood-north/" },
    color: "#C8102E",
    tint: "#FDF0F2",
    listings: ["fix-auto-sherwood-north"],
    searchTerms: "collision repair auto body shop autobody bodywork dent hail damage accident mechanic",
  },
  oxford: {
    id: "oxford",
    name: "Oxford Chiropractic & Wellness",
    logoSrc: "/logos/oxford-chiro-horizontal-sm.webp",
    logoSize: [439, 130],
    logoAlt: "Oxford Chiropractic & Wellness",
    logoHeightPx: 32,
    photo: { src: "/ads/oxford.webp", alt: "Oxford Chiropractic & Wellness front desk and waiting room" },
    kicker: "Chiropractic in North Edmonton",
    line: "Chiropractic care and massage therapy, no referral needed.",
    cta: { label: "Book a visit", href: "https://oxfordchiropractic.ca/" },
    color: "#2F7D3A",
    tint: "#EEF6EE",
    listings: ["oxford-chiropractic-wellness"],
    searchTerms: "chiropractor chiropractic chiro back neck pain massage therapy",
  },
  hearing: {
    id: "hearing",
    name: "Medicine Place Hearing Care",
    logoSrc: "/logos/medicine-place-hearing-sm.webp",
    logoSize: [600, 138],
    logoAlt: "Medicine Place Hearing Care",
    logoHeightPx: 30,
    photo: { src: "/ads/hearing.webp", alt: "A hearing aid being fitted behind the ear" },
    kicker: "Hearing care in Edmonton",
    line: "Hearing tests and hearing aids at two Edmonton clinics.",
    cta: { label: "Book a hearing test", href: "https://medicineplacehearing.ca/" },
    color: "#005446",
    tint: "#EDF6FB",
    listings: ["medicine-place-hearing-care-97-north", "medicine-place-hearing-care-east"],
    searchTerms: "hearing test aids aid clinic care audiologist audiology tinnitus",
  },
  flowers: {
    id: "flowers",
    name: "Flowers YEG",
    logoSrc: "/logos/flowers-yeg-sm.webp",
    logoSize: [243, 260],
    logoAlt: "Flowers YEG",
    logoHeightPx: 72,
    photo: { src: "/ads/flowers.webp", alt: "A bouquet of pink roses from Flowers YEG" },
    kicker: "Edmonton florist",
    line: "Fresh bouquets for every occasion, delivered across Edmonton.",
    cta: { label: "Shop flowers", href: "https://flowersedmonton.ca/" },
    color: "#A24F5F",
    tint: "#FCF3F4",
    listings: ["flowers-yeg"],
    searchTerms: "flowers flower florist shop delivery bouquet bouquets roses",
  },
  sanctuary: {
    id: "sanctuary",
    name: "Secret Sanctuary Retreat",
    logoSrc: "/logos/secret-sanctuary-retreat-sm.webp",
    logoSize: [265, 280],
    logoAlt: "Secret Sanctuary Retreat",
    logoHeightPx: 72,
    photo: { src: "/ads/sanctuary.webp", alt: "A glamping bell tent on a deck in the forest at Secret Sanctuary Retreat" },
    kicker: "Retreat near Pigeon Lake",
    line: "Glamping, a tiny cabin and wellness in the forest, about an hour from Edmonton.",
    cta: { label: "Book your stay", href: "https://secretsanctuary.ca/" },
    color: "#253F58",
    tint: "#EFF4F1",
    listings: ["secret-sanctuary-retreat"],
    searchTerms: "glamping camping campground campsite cabin cabins retreat retreats getaway",
  },
  beaumaris: {
    id: "beaumaris",
    name: "Beaumaris Health Centre",
    logoSrc: "/logos/beaumaris-health-centre-sm.webp",
    logoSize: [440, 104],
    logoAlt: "Beaumaris Health Centre",
    logoHeightPx: 32,
    photo: { src: "/ads/beaumaris.webp", alt: "Beaumaris Health Centre storefront on 127 Street in North Edmonton" },
    kicker: "Chiro, physio and massage in North Edmonton",
    line: "Chiro, physio and massage, plus care for work and car injuries.",
    cta: { label: "Contact the clinic", href: "https://beaumarishealth.com/contact-us/" },
    color: "#92278F",
    tint: "#F8EFF8",
    listings: ["beaumaris-health-centre"],
    searchTerms: "chiropractor chiropractic chiro physiotherapy physio massage therapy acupuncture whiplash wcb",
  },
  ironforce: {
    id: "ironforce",
    name: "Iron Force Labour",
    logoSrc: "/logos/iron-force-labour-sm.webp",
    logoSize: [440, 147],
    logoAlt: "Iron Force Labour",
    logoHeightPx: 40,
    photo: { src: "/ads/ironforce.webp", alt: "Two labourers digging a trench on an Edmonton job site" },
    kicker: "Construction staffing in Edmonton",
    line: "Same day general labour and skilled trades in 1 to 3 days.",
    cta: { label: "Request workers", href: "https://ironforcelabour.com/contact" },
    color: "#12110D",
    tint: "#FFF8DD",
    listings: ["iron-force-labour"],
    searchTerms: "staffing agency labour labor construction labourers workers temp agency trades crew",
  },
  dentclinic: {
    id: "dentclinic",
    name: "Dent Clinic Sherwood Park",
    logoSrc: "/logos/dent-clinic-sherwood-park-sm.webp",
    logoSize: [440, 110],
    logoAlt: "Dent Clinic",
    logoHeightPx: 30,
    photo: { src: "/ads/dentclinic.webp", alt: "Front desk and waiting area at Dent Clinic Sherwood Park" },
    kicker: "Dent repair in Sherwood Park",
    line: "Paintless dent and hail repair, with free estimates.",
    cta: { label: "Get a free estimate", href: "https://www.dentclinic.com/service-locations/dent-repair-sherwood-park-and-edmonton-dent-clinic/" },
    color: "#2F4698",
    tint: "#EEF1FA",
    listings: ["dent-clinic-sherwood-park"],
    searchTerms: "dent repair dents paintless hail damage door ding ding",
  },
};

/** Listing slug → that sponsor's search words, for every listing that has an ad. */
export const SPONSORED_LISTINGS: Map<string, string> = new Map(
  Object.values(ADVERTISERS).flatMap((a) => (a.listings ?? []).map((slug) => [slug, a.searchTerms ?? ""] as [string, string])),
);

/**
 * One listing per sponsor for the homepage Featured row. The carousel shows these first
 * and shuffles them on every page load, so each sponsor gets the first card in turn
 * (Moe 2026-11-23: the homepage kept showing Oxford first).
 */
export const HOMEPAGE_SPONSOR_LISTINGS: string[] = [
  "onepoint-solutions",
  "fix-auto-sherwood-north",
  "oxford-chiropractic-wellness",
  "medicine-place-hearing-care-97-north",
  "flowers-yeg",
  "secret-sanctuary-retreat",
  "beaumaris-health-centre",
  "iron-force-labour",
  "dent-clinic-sherwood-park",
];

/** Listing slug → sponsor id, for tracking clicks on sponsor listings (e.g. the homepage Featured row). */
export const LISTING_SPONSOR: Map<string, AdvertiserId> = new Map(
  Object.values(ADVERTISERS).flatMap((a) => (a.listings ?? []).map((slug) => [slug, a.id] as [string, AdvertiserId])),
);

/** Where an ad can show. Used for click and view counts per sponsor. */
export const AD_PLACEMENTS = [
  "home-strip",
  "home-popup",
  "featured",
  "category-footer",
  "business-sidebar",
  "blog-sidebar",
  "blog-footer",
  "search-top",
] as const;
export type AdPlacement = (typeof AD_PLACEMENTS)[number];

/** Every sponsor, in rotation order. */
export const ROTATION: AdvertiserId[] = ["onepoint", "fixauto", "oxford", "hearing", "flowers", "sanctuary", "beaumaris", "ironforce", "dentclinic"];

export function advertiser(id: AdvertiserId): Advertiser {
  return ADVERTISERS[id];
}

/** Adds the WhereToYEG UTM tags, e.g. utm_campaign=hearing-category-footer. Phone links stay as they are. */
export function adHref(href: string, id: AdvertiserId, placement: string, medium = "ad"): string {
  if (href.startsWith("tel:") || href.startsWith("mailto:")) return href;
  const u = new URL(href);
  u.searchParams.set("utm_source", "wheretoyeg");
  u.searchParams.set("utm_medium", medium);
  u.searchParams.set("utm_campaign", `${id}-${placement}`);
  return u.toString();
}

/**
 * Pick which sponsor fits the current page.
 *   - A strong match wins: dents and hail → Dent Clinic, other auto repair → Fix Auto or Dent Clinic,
 *     chiro / physio / massage → Oxford or Beaumaris, staffing and labour → Iron Force,
 *     hearing → Medicine Place Hearing, florists → Flowers YEG, glamping and retreats → Secret Sanctuary.
 *   - Every other page gets an even spread of all sponsors, reshuffled each day
 *     (the site rebuilds daily), so each sponsor shows across the whole site.
 */
export function pickAdvertiser(ctx: { category?: string; subcategory?: string; tags?: string[]; slot?: number; slug?: string }): AdvertiserId {
  const match = relevantAdvertiser(ctx);
  if (match) return match;
  // Pages from a small fixed set (like the 20 category pages) pass their position, so the
  // sponsors take turns in order instead of leaving it to the hash.
  if (ctx.slot !== undefined) return rotateAdvertiser(ctx.slot + edmontonDay());
  return rotateAdvertiser(ctxHash(ctx) + edmontonDay());
}

function ctxHash(ctx: { category?: string; subcategory?: string; tags?: string[] }): number {
  const key = `${ctx.category ?? ""}|${ctx.subcategory ?? ""}|${(ctx.tags ?? []).join(",")}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return hash;
}

/**
 * The sponsor that clearly fits this page, or null when none does. Pages with no match
 * get the next sponsor in turn for each visitor (see OnePointAd), so everyone is seen.
 */
export function relevantAdvertiser(ctx: { category?: string; subcategory?: string; tags?: string[]; slug?: string }): AdvertiserId | null {
  // A sponsor's own listing always shows its own ad, never a competitor's.
  const own = ctx.slug ? LISTING_SPONSOR.get(ctx.slug) : undefined;
  if (own) return own;
  const text = `${ctx.category ?? ""} ${ctx.subcategory ?? ""} ${(ctx.tags ?? []).join(" ")}`.toLowerCase();
  const hash = ctxHash(ctx);
  // Two sponsors in the same field share its pages: half the pages each, changing daily.
  const half = (a: AdvertiserId, b: AdvertiserId) => (Math.abs(hash + edmontonDay()) % 2 === 0 ? a : b);
  if (/\b(paintless|dents?|hail|door-dings?)\b/.test(text)) return "dentclinic";
  if (ctx.category === "auto-repair" || /\b(auto|collision|body-shops?|tires?|mechanic)\b/.test(text)) {
    return half("fixauto", "dentclinic");
  }
  if (/\b(staffing|labour|labor|labourers?|construction-staffing|temp-agency)\b/.test(text)) return "ironforce";
  if (/\b(hearing|hearing-care|hearing-aids?|audiolog\w*|tinnitus)\b/.test(text)) return "hearing";
  if (/\b(florists?|flowers?|bouquets?|wedding-flowers)\b/.test(text)) return "flowers";
  if (/\b(glamping|camping|campgrounds?|retreats?|cabins?)\b/.test(text)) return "sanctuary";
  if (
    ctx.category === "medical" &&
    (/\b(chiropractors?|physiotherap|massage-therapy|acupuncture|back-pain|neck-pain|sciatica|whiplash)\b/.test(text) ||
      /\bchiro\b/.test(text))
  ) {
    return half("oxford", "beaumaris");
  }
  if (/\b(chiropract|physiotherapy|back pain|neck pain|whiplash|sciatica)\b/.test(text)) return half("oxford", "beaumaris");
  return null;
}

/** Deterministic rotation across all sponsors. */
export function rotateAdvertiser(n: number): AdvertiserId {
  return ROTATION[Math.abs(n) % ROTATION.length];
}
