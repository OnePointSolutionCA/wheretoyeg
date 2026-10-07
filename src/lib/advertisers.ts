/**
 * Ad slots the site rotates between. Each advertiser owns their own branded card
 * on the pages that fit them (and their listing on the directory stays separate).
 */

export type AdvertiserId = "onepoint" | "fixauto" | "oxford";

export type Advertiser = {
  id: AdvertiserId;
  name: string;
  logoSrc: string;
  logoAlt: string;
  logoHeightPx: number; // rendered height on the card
  tagline: string; // short lead line in the "Sponsored" eyebrow
  headline: string;
  highlight: string; // the orange or coloured phrase inside headline
  blurb: string;
  bullets: string[]; // 2-3 short phrases on the banner
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  /** Hex background for banner / popup card. Keep high contrast with white text. */
  bg: string;
  /** Hex accent for the primary button background. */
  accent: string;
  /** Hex accent, slightly brightened, for the headline highlight word. */
  accentSoft: string;
};

const ADVERTISERS: Record<AdvertiserId, Advertiser> = {
  onepoint: {
    id: "onepoint",
    name: "OnePoint Solutions",
    logoSrc: "/logos/onepoint-horizontal.png",
    logoAlt: "OnePoint Solutions Marketing Agency",
    logoHeightPx: 36,
    tagline: "Marketing agency",
    headline: "Show up when Edmontonians",
    highlight: "search for you.",
    blurb:
      "OnePoint Solutions builds websites and runs SEO, Google Business Profile and social for Edmonton businesses. Transparent monthly pricing, no contracts.",
    bullets: ["Websites from $499", "SEO from $300/mo", "Social from $300/mo"],
    primary: { label: "Free SEO Audit", href: "https://onepointsolution.ca/free-seo-audit/" },
    secondary: { label: "Visit OnePoint", href: "https://onepointsolution.ca/" },
    bg: "#2D3E50",
    accent: "#D97B2B",
    accentSoft: "#F2A26B",
  },
  fixauto: {
    id: "fixauto",
    name: "Fix Auto Sherwood North",
    logoSrc: "/logos/fix-auto.png",
    logoAlt: "Fix Auto Sherwood North",
    logoHeightPx: 56,
    tagline: "Collision repair",
    headline: "Dent, scratch or crash?",
    highlight: "We handle it.",
    blurb:
      "Fix Auto Sherwood North does collision repair, paintless dent repair, colour matching and OEM parts. Nationwide limited lifetime warranty. AMVIC licensed.",
    bullets: ["Free estimates", "In Alberta you choose your shop", "Unit 100, 167 Provincial Ave"],
    primary: { label: "Get a Free Estimate", href: "https://fixauto.com/ca/en/shop/fix-auto-sherwood-north/" },
    secondary: { label: "Call (780) 416-3158", href: "tel:+17804163158" },
    bg: "#0F2A4A",
    accent: "#E63955",
    accentSoft: "#FFC43A",
  },
  oxford: {
    id: "oxford",
    name: "Oxford Chiropractic & Wellness",
    logoSrc: "/logos/oxford-chiro.png",
    logoAlt: "Oxford Chiropractic & Wellness",
    logoHeightPx: 72,
    tagline: "Chiropractic & wellness",
    headline: "Back pain? See an",
    highlight: "Edmonton chiro.",
    blurb:
      "Oxford Chiropractic & Wellness in North Edmonton offers chiropractic, massage therapy, acupuncture and physio. Direct billing available for most insurers.",
    bullets: ["Direct billing", "Chiro, massage & physio", "North Edmonton clinic"],
    primary: { label: "Book an Appointment", href: "https://oxfordchiro.ca/" },
    secondary: { label: "Call (780) 457-3311", href: "tel:+17804573311" },
    bg: "#17446B",
    accent: "#4CA451",
    accentSoft: "#7FD182",
  },
};

export function advertiser(id: AdvertiserId): Advertiser {
  return ADVERTISERS[id];
}

/** Pick which advertiser fits the current page. Falls back to OnePoint when nothing matches. */
export function pickAdvertiser(ctx: { category?: string; subcategory?: string; tags?: string[] }): AdvertiserId {
  const text = `${ctx.category ?? ""} ${ctx.subcategory ?? ""} ${(ctx.tags ?? []).join(" ")}`.toLowerCase();
  if (ctx.category === "auto-repair" || /\b(auto|collision|body-shops?|tires?|mechanic|paintless|dent)\b/.test(text)) {
    return "fixauto";
  }
  if (
    ctx.category === "medical" &&
    (/\b(chiropractors?|physiotherap|massage-therapy|acupuncture|back-pain|neck-pain|sciatica|whiplash)\b/.test(text) ||
      /\bchiro\b/.test(text))
  ) {
    return "oxford";
  }
  if (/\b(chiropract|physiotherapy|back pain|neck pain|whiplash|sciatica)\b/.test(text)) return "oxford";
  return "onepoint";
}

/** Deterministic rotation across all 3 advertisers; same answer for the whole day in Edmonton. */
export function rotateAdvertiser(dayNumber: number): AdvertiserId {
  const order: AdvertiserId[] = ["onepoint", "fixauto", "oxford"];
  return order[Math.abs(dayNumber) % order.length];
}
