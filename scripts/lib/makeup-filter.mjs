// Moe 2026-11-22: "remove all make up services". WhereToYEG never lists makeup
// services of any kind: makeup artists, bridal makeup, permanent makeup,
// microblading, lip blush, powder or ombre brows, cosmetic tattoo.
// Every script that creates listings must call makeupReason() and skip the
// place when it returns a reason. Works on a Google Places (New) place object
// or on a plain object with name / description / tags.

// Google Places types for makeup businesses.
const MAKEUP_TYPES = new Set(["makeup_artist", "permanent_makeup"]);

// In a business name or description: any hit blocks.
const MAKEUP_NAME = /\b(make[\s-]?up|mua|pmu|permanent\s+make|micro[\s-]?blad\w*|micro[\s-]?shad\w*|nano[\s-]?brows?|powder\s+brows?|ombre\s+brows?|ombr[eé]\s+brows?|lip\s+blush\w*|brow\s+tattoo\w*|cosmetic\s+tattoo\w*|semi[\s-]?permanent)\b/i;

// In reviews: permanent makeup work (one review is enough).
const PMU_REVIEW = /\b(micro[\s-]?blad\w*|micro[\s-]?shad\w*|permanent\s+make[\s-]?up|pmu|lip\s+blush\w*|powder\s+brows?|ombr[eé]\s+brows?|nano[\s-]?brows?|cosmetic\s+tattoo\w*|brow\s+tattoo\w*)\b/i;
// In reviews: makeup artist work (needs two different reviews, so one
// "I did my own makeup" mention does not block a hair salon).
const MUA_REVIEW = /\b(make[\s-]?up\s+artist|bridal\s+make[\s-]?up|did\s+(?:my|our|her|the)\s+(?:bridal\s+)?make[\s-]?up|make[\s-]?up\s+(?:service|session|application|trial|look)s?|airbrush\s+make[\s-]?up|mua)\b/i;

function text(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.text ?? "";
}

export function makeupReason(place) {
  if (!place) return null;
  const types = place.types ?? [];
  if (types.some((t) => MAKEUP_TYPES.has(t))) return "makeup (Google type)";
  if (place.primaryType && MAKEUP_TYPES.has(place.primaryType)) return "makeup (Google type)";

  const name = text(place.displayName) || place.name || "";
  if (MAKEUP_NAME.test(name)) return "makeup (name)";

  const desc = [text(place.editorialSummary), place.description, place.tagline, ...(place.tags ?? [])]
    .filter(Boolean).join(" ");
  if (MAKEUP_NAME.test(desc)) return "makeup (description)";

  const reviews = (place.reviews ?? []).map((r) => text(r.text) || r.comment || "");
  if (reviews.some((t) => PMU_REVIEW.test(t))) return "makeup (permanent makeup in reviews)";
  if (reviews.filter((t) => MUA_REVIEW.test(t)).length >= 2) return "makeup (makeup artist in reviews)";
  return null;
}

// Most makeup studios only show it on their own website (2026-11-22 sweep:
// Google data caught 7 of 45, the website caught 38). For beauty categories,
// also read the homepage. A hit means skip and log it; a person can still add
// the business by hand if the hit was a false one (a booking platform page or
// a shop that only sells makeup products).
export const BEAUTY_CATEGORIES = new Set(["hair-salons", "lash-techs", "spas-esthetics", "nail-salons", "barbers", "henna-artists"]);

const PMU_SITE = /\b(micro[\s-]?blad\w*|micro[\s-]?shad\w*|permanent\s+(?:make[\s-]?up|cosmetics?)|lip\s+blush\w*|powder\s+brows?|ombr[eé]\s+brows?|nano[\s-]?brows?|cosmetic\s+tattoo\w*|brow\s+tattoo\w*|eyeliner\s+tattoo\w*|pmu)\b/gi;
const MU_SITE = /\b(make-?up|maquillage)\b/gi;

export function makeupInWebsiteText(t) {
  const pmu = (t.match(PMU_SITE) ?? []).length;
  const mu = (t.match(MU_SITE) ?? []).length;
  if (pmu >= 1) return "makeup (permanent makeup on website)";
  if (mu >= 2) return "makeup (makeup on website)";
  return null;
}

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131 Safari/537.36";
const SUBPAGE = /(service|menu|price|pricing|treatment|makeup|make-up|brow|bridal|beauty|permanent|pmu)/i;

async function getHtml(url, timeoutMs) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(timeoutMs), headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    return { html: (await res.text()).slice(0, 3_000_000), finalUrl: res.url || url };
  } catch {
    return null; // site down or slow: the Google data check still applies
  }
}

function pageText(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
}

// Reads the homepage plus up to 4 same-site service, menu or price pages.
export async function makeupOnWebsite(url, timeoutMs = 12000) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  const home = await getHtml(url, timeoutMs);
  if (!home) return null;
  const r = makeupInWebsiteText(pageText(home.html));
  if (r) return r;
  let base;
  try { base = new URL(home.finalUrl); } catch { return null; }
  const links = new Set();
  for (const m of home.html.matchAll(/href\s*=\s*["']([^"'#]+)["']/gi)) {
    let u;
    try { u = new URL(m[1], base); } catch { continue; }
    if (u.host !== base.host || !/^https?:$/.test(u.protocol)) continue;
    if (!SUBPAGE.test(u.pathname)) continue;
    if (/\.(jpe?g|png|gif|webp|svg|pdf|css|js)$/i.test(u.pathname)) continue;
    u.search = "";
    links.add(u.href);
    if (links.size >= 4) break;
  }
  for (const link of links) {
    const page = await getHtml(link, timeoutMs);
    if (!page) continue;
    const r2 = makeupInWebsiteText(pageText(page.html));
    if (r2) return r2 + " " + new URL(link).pathname;
  }
  return null;
}

// Full check for a Google Places result: Google data first, then the website
// for beauty categories. Returns a reason string or null.
export async function checkMakeup(place, category) {
  const r = makeupReason(place);
  if (r) return r;
  if (category && !BEAUTY_CATEGORIES.has(category)) return null;
  return makeupOnWebsite(place?.websiteUri ?? place?.website);
}
