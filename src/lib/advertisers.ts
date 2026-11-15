/**
 * Sponsors the site rotates between: OnePoint plus OnePoint's paying Edmonton SEO clients.
 * Each ad is one real photo from the sponsor's own site, their logo, one short line and
 * one button in their brand colour. Their directory listings stay separate (pinned Premium).
 */

import { edmontonDay } from "./daily";

export type AdvertiserId = "onepoint" | "fixauto" | "oxford" | "hearing" | "flowers" | "sanctuary";

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
    logoHeightPx: 40,
    photo: { src: "/ads/fixauto.webp", alt: "Fix Auto Sherwood North shop on Provincial Avenue" },
    kicker: "Collision repair in Sherwood Park",
    line: "Collision repair, dents and paint, with free estimates.",
    cta: { label: "Get a free estimate", href: "https://fixauto.com/ca/en/shop/fix-auto-sherwood-north/" },
    color: "#C8102E",
    tint: "#FDF0F2",
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
  },
};

/** Every sponsor, in rotation order. */
export const ROTATION: AdvertiserId[] = ["onepoint", "fixauto", "oxford", "hearing", "flowers", "sanctuary"];

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
 *   - A strong match wins: auto repair → Fix Auto, chiro / physio / massage → Oxford,
 *     hearing → Medicine Place Hearing, florists → Flowers YEG, glamping and retreats → Secret Sanctuary.
 *   - Every other page gets an even spread of all five, reshuffled each day
 *     (the site rebuilds daily), so each sponsor shows across the whole site.
 */
export function pickAdvertiser(ctx: { category?: string; subcategory?: string; tags?: string[]; slot?: number }): AdvertiserId {
  const text = `${ctx.category ?? ""} ${ctx.subcategory ?? ""} ${(ctx.tags ?? []).join(" ")}`.toLowerCase();
  if (ctx.category === "auto-repair" || /\b(auto|collision|body-shops?|tires?|mechanic|paintless|dent)\b/.test(text)) {
    return "fixauto";
  }
  if (/\b(hearing|hearing-care|hearing-aids?|audiolog\w*|tinnitus)\b/.test(text)) return "hearing";
  if (/\b(florists?|flowers?|bouquets?|wedding-flowers)\b/.test(text)) return "flowers";
  if (/\b(glamping|camping|campgrounds?|retreats?|cabins?)\b/.test(text)) return "sanctuary";
  if (
    ctx.category === "medical" &&
    (/\b(chiropractors?|physiotherap|massage-therapy|acupuncture|back-pain|neck-pain|sciatica|whiplash)\b/.test(text) ||
      /\bchiro\b/.test(text))
  ) {
    return "oxford";
  }
  if (/\b(chiropract|physiotherapy|back pain|neck pain|whiplash|sciatica)\b/.test(text)) return "oxford";
  // Pages from a small fixed set (like the 20 category pages) pass their position, so the
  // sponsors take turns in order instead of leaving it to the hash.
  if (ctx.slot !== undefined) return rotateAdvertiser(ctx.slot + edmontonDay());
  const key = `${ctx.category ?? ""}|${ctx.subcategory ?? ""}|${(ctx.tags ?? []).join(",")}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return rotateAdvertiser(hash + edmontonDay());
}

/** Deterministic rotation across all sponsors. */
export function rotateAdvertiser(n: number): AdvertiserId {
  return ROTATION[Math.abs(n) % ROTATION.length];
}
