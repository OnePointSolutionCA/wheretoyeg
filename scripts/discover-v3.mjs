#!/usr/bin/env node
/**
 * Discover more businesses across Edmonton and nearby cities via Google Places (New).
 *
 *   GOOGLE_PLACES_API_KEY=xxx node scripts/discover-v3.mjs --plan       # show query plan + max cost
 *   GOOGLE_PLACES_API_KEY=xxx node scripts/discover-v3.mjs [--max=700]  # run (max = search request cap)
 *
 * Rules: operational only; 4.2+ stars; 25+ reviews in Edmonton (10+ elsewhere); no venue Google marks as
 * serving beer or wine; no bars/pubs/pork-focused names; no duplicates of any existing file (active or not).
 * Writes content/businesses/<slug>.md with an empty description (the site generates one from data),
 * map coordinates, and up to 2 landscape Google photos. A list of new slugs goes to scripts/.discover-v3-new.json.
 *
 * Stops when this month's free Google allowance runs out (see places-budget.mjs).
 * Pass --allow-paid to keep going past it.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addUsage, costOf, freeLeft } from "./places-budget.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "content/businesses");
const PHOTO_DIR = path.join(ROOT, "public/photos");
const KEY = process.env.GOOGLE_PLACES_API_KEY;
const ARGS = process.argv.slice(2);
const PLAN = ARGS.includes("--plan");
const ALLOW_PAID = ARGS.includes("--allow-paid");
const MAX = parseInt(ARGS.find((a) => a.startsWith("--max="))?.split("=")[1] ?? "700", 10);
const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton" }).format(new Date());

// [query, category, subcategory, pages] — Edmonton, subcategory level.
const EDMONTON = [
  // restaurants
  ["shawarma", "restaurants", "shawarma", 2], ["pakistani restaurant", "restaurants", "pakistani", 2], ["lebanese restaurant", "restaurants", "lebanese", 1],
  ["afghan restaurant", "restaurants", "afghan", 1], ["burger restaurant", "restaurants", "burgers", 2], ["sushi restaurant", "restaurants", "sushi", 2],
  ["mediterranean restaurant", "restaurants", "mediterranean", 1], ["pizza", "restaurants", "pizza", 1], ["indian restaurant", "restaurants", "indian", 2],
  ["chinese restaurant", "restaurants", "chinese", 2], ["thai restaurant", "restaurants", "thai", 2], ["vietnamese restaurant", "restaurants", "vietnamese", 2],
  ["ethiopian restaurant", "restaurants", "ethiopian", 1], ["seafood restaurant", "restaurants", "seafood", 1], ["breakfast brunch restaurant", "restaurants", "brunch", 2],
  ["vegan restaurant", "restaurants", "vegan", 1], ["family restaurant", "restaurants", "family", 1], ["fried chicken restaurant", "restaurants", "fried-chicken", 1],
  ["japanese restaurant", "restaurants", "japanese", 1], ["middle eastern restaurant", "restaurants", "middle-eastern", 1], ["biryani", "restaurants", "biryani", 1],
  ["buffet restaurant", "restaurants", "buffet", 1], ["caribbean restaurant", "restaurants", "caribbean", 1], ["donair", "restaurants", "donair", 1],
  ["filipino restaurant", "restaurants", "filipino", 1], ["greek restaurant", "restaurants", "greek", 1], ["halal chicken", "restaurants", "halal-chicken", 1],
  ["korean bbq", "restaurants", "korean-bbq", 1], ["pho", "restaurants", "pho", 1], ["ramen", "restaurants", "ramen", 1], ["turkish restaurant", "restaurants", "turkish", 1],
  ["chicken wings", "restaurants", "wings", 1], ["dim sum", "restaurants", "dim-sum", 1], ["dumpling restaurant", "restaurants", "dumplings", 1],
  ["halal fast food", "restaurants", "halal-fast-food", 1], ["korean restaurant", "restaurants", "korean", 1], ["latin american restaurant", "restaurants", "latin", 1],
  ["poutine", "restaurants", "poutine", 1], ["somali restaurant", "restaurants", "somali", 1], ["ice cream shop", "restaurants", "ice-cream", 1],
  ["mexican restaurant", "restaurants", "mexican", 1], ["italian restaurant", "restaurants", "italian", 1], ["bbq smokehouse", "restaurants", "bbq", 1],
  // cafes
  ["espresso bar coffee", "cafes-coffee-shops", "espresso-bars", 1], ["coffee roaster cafe", "cafes-coffee-shops", "roasters", 1], ["bubble tea", "cafes-coffee-shops", "boba-bubble-tea", 2],
  ["dessert cafe", "cafes-coffee-shops", "dessert-cafes", 2], ["brunch cafe", "cafes-coffee-shops", "brunch-cafes", 1], ["specialty coffee shop", "cafes-coffee-shops", "specialty", 2],
  ["juice bar smoothie", "cafes-coffee-shops", "juice-bar", 1], ["tea shop", "cafes-coffee-shops", "tea", 1], ["arabic coffee cafe", "cafes-coffee-shops", "international", 1],
  // bakeries
  ["bakery", "bakeries", "pastries", 2], ["custom cake shop", "bakeries", "custom-cakes", 1], ["cupcake bakery", "bakeries", "cupcakes", 1],
  ["gluten free bakery", "bakeries", "gluten-free", 1], ["wedding cake bakery", "bakeries", "wedding-cakes", 1], ["artisan bread bakery", "bakeries", "artisan-bread", 1],
  ["halal bakery", "bakeries", "halal-bakeries", 1], ["middle eastern bakery sweets", "bakeries", "middle-eastern", 1],
  // barbers, hair, nails, lashes, spa
  ["barber shop", "barbers", "fades", 3], ["kids haircut barber", "barbers", "kids-haircuts", 1], ["beard trim barber", "barbers", "beard-grooming", 1],
  ["hair salon", "hair-salons", "cuts-styling", 2], ["hair colour salon", "hair-salons", "colour", 1], ["balayage salon", "hair-salons", "balayage", 1],
  ["curly hair salon", "hair-salons", "curly-hair", 1], ["hair extensions salon", "hair-salons", "extensions", 1],
  ["nail salon", "nail-salons", "gel", 2], ["pedicure spa", "nail-salons", "pedicures", 1], ["nail art studio", "nail-salons", "nail-art", 1],
  ["eyelash extensions", "lash-techs", "lash-extensions", 2], ["lash lift and tint", "lash-techs", "lash-lifts", 1], ["eyebrow threading", "lash-techs", "brow-services", 1],
  ["facial spa", "spas-esthetics", "facials", 1], ["day spa", "spas-esthetics", "day-spas", 1], ["waxing studio", "spas-esthetics", "waxing", 1],
  ["laser hair removal", "spas-esthetics", "laser-hair-removal", 1], ["medical spa", "spas-esthetics", "medspa", 1], ["massage spa", "spas-esthetics", "massage", 1],
  // gyms
  ["gym", "gyms-fitness", "gyms", 2], ["24 hour gym", "gyms-fitness", "24-7-gyms", 1], ["crossfit gym", "gyms-fitness", "crossfit", 1], ["yoga studio", "gyms-fitness", "yoga", 1],
  ["pilates studio", "gyms-fitness", "pilates", 1], ["boxing gym", "gyms-fitness", "boxing", 1], ["martial arts school", "gyms-fitness", "martial-arts", 2],
  ["personal training studio", "gyms-fitness", "personal-training", 1], ["womens gym", "gyms-fitness", "womens-only", 1], ["dance studio", "gyms-fitness", "dance", 1],
  ["spin cycling studio", "gyms-fitness", "cycling", 1], ["swimming lessons pool", "gyms-fitness", "swimming", 1],
  // medical
  ["walk in clinic", "medical", "walk-in-clinics", 2], ["family doctor clinic", "medical", "family-doctors", 1], ["pharmacy", "medical", "pharmacies", 2],
  ["orthodontist", "medical", "orthodontists", 1], ["optometrist", "medical", "eye-care", 2], ["hearing clinic", "medical", "hearing-care", 1],
  ["physiotherapy clinic", "medical", "physiotherapy", 2], ["chiropractor", "medical", "chiropractors", 2], ["massage therapy clinic", "medical", "massage-therapy", 2],
  ["dermatology clinic", "medical", "dermatology", 1], ["medical imaging clinic", "medical", "diagnostic-imaging", 1], ["medical supply store", "medical", "medical-supplies", 1],
  ["pediatrician", "medical", "pediatricians", 1], ["veterinary clinic", "medical", "veterinarians", 2], ["counselling psychologist", "medical", "counselling", 1],
  ["acupuncture clinic", "medical", "acupuncture", 1],
  // auto
  ["auto repair shop", "auto-repair", "mechanics", 2], ["collision repair", "auto-repair", "collision", 1], ["tire shop", "auto-repair", "tires", 1],
  ["transmission repair", "auto-repair", "transmission", 1], ["oil change", "auto-repair", "oil-change", 1], ["car detailing", "auto-repair", "detailing", 1],
  ["european car repair", "auto-repair", "european-cars", 1], ["japanese car repair", "auto-repair", "japanese-cars", 1], ["auto body shop", "auto-repair", "body-shops", 1],
  ["car wash", "auto-repair", "car-wash", 1], ["windshield replacement", "auto-repair", "windshield", 1],
  // home services
  ["house cleaning service", "cleaning-services", "house-cleaning", 1], ["commercial cleaning company", "cleaning-services", "commercial-cleaning", 1],
  ["move out cleaning", "cleaning-services", "move-out", 1], ["carpet cleaning", "cleaning-services", "carpet", 1], ["window cleaning", "cleaning-services", "windows", 1],
  ["junk removal", "cleaning-services", "junk-removal", 1], ["landscaping company", "cleaning-services", "landscaping", 1], ["moving company", "cleaning-services", "moving", 1],
  ["house painters", "cleaning-services", "painting", 1], ["pest control", "cleaning-services", "pest-control", 1],
  ["residential electrician", "electricians", "residential", 1], ["commercial electrician", "electricians", "commercial", 1], ["ev charger installation", "electricians", "ev-chargers", 1],
  ["furnace repair hvac", "electricians", "hvac", 1], ["plumber", "plumbers", "residential", 2], ["drain cleaning", "plumbers", "drain-cleaning", 1],
  ["water heater installation", "plumbers", "water-heaters", 1], ["roofing company", "plumbers", "roofing", 1], ["garage door repair", "plumbers", "garage-door", 1],
  ["locksmith", "plumbers", "locksmith", 1], ["home renovation contractor", "plumbers", "renovations", 1],
  // grocery
  ["halal meat shop", "grocery-markets", "halal-meat", 1], ["middle eastern grocery", "grocery-markets", "middle-eastern", 1], ["indian grocery store", "grocery-markets", "south-asian", 1],
  ["asian supermarket", "grocery-markets", "east-asian", 1], ["african caribbean grocery", "grocery-markets", "african-caribbean", 1], ["farmers market", "grocery-markets", "farmers-markets", 1],
  ["health food store", "grocery-markets", "bulk-health", 1], ["butcher shop", "grocery-markets", "butcher", 1],
  // professional services
  ["lawyer", "professional-services", "legal", 1], ["marketing agency", "professional-services", "marketing-web", 1], ["accountant", "professional-services", "accounting", 1],
  ["financial advisor", "professional-services", "financial-advisors", 1], ["immigration consultant", "professional-services", "immigration", 1], ["notary public", "professional-services", "notaries", 1],
  ["real estate agent", "professional-services", "real-estate", 1], ["insurance broker", "professional-services", "insurance", 1], ["daycare", "professional-services", "childcare", 2],
  ["driving school", "professional-services", "driving-school", 1], ["dog grooming", "professional-services", "pet-grooming", 1], ["mortgage broker", "professional-services", "mortgage", 1],
  ["print shop", "professional-services", "printing", 1], ["tutoring centre", "professional-services", "tutoring", 1],
  // photographers, catering, activities
  ["wedding photographer", "photographers", "wedding", 1], ["family photographer", "photographers", "family", 1], ["headshot photographer", "photographers", "portraits", 1],
  ["product photographer", "photographers", "brand", 1], ["event photographer", "photographers", "events", 1], ["real estate photographer", "photographers", "real-estate", 1],
  ["wedding catering", "catering", "wedding-catering", 1], ["corporate catering", "catering", "corporate-catering", 1], ["halal catering", "catering", "halal-catering", 1],
  ["indian catering", "catering", "indian-catering", 1], ["event catering", "catering", "event-catering", 1],
  ["escape room", "activities-fun", "escape-rooms", 1], ["arcade", "activities-fun", "arcades", 1], ["trampoline park", "activities-fun", "trampoline", 1],
  ["indoor playground", "activities-fun", "indoor-playground", 1], ["museum", "activities-fun", "museums", 1], ["park", "activities-fun", "outdoor", 1],
  ["climbing gym", "activities-fun", "climbing", 1], ["mini golf", "activities-fun", "mini-golf", 1], ["skating rink", "activities-fun", "skating", 1],
  ["vr arcade", "activities-fun", "vr-arcade", 1], ["board game cafe", "activities-fun", "board-games", 1], ["paintball", "activities-fun", "paintball", 1],
  ["axe throwing", "activities-fun", "axe-throwing", 1], ["laser tag", "activities-fun", "laser-tag", 1], ["padel tennis", "activities-fun", "padel", 1],
];

// Nearby cities: broad searches, one page each.
const CITIES = ["Sherwood Park", "St. Albert", "Spruce Grove", "Stony Plain", "Leduc", "Beaumont", "Fort Saskatchewan"];
const CITY_QUERIES = [
  ["restaurant", "restaurants", "family"], ["pizza", "restaurants", "pizza"], ["shawarma", "restaurants", "shawarma"], ["indian restaurant", "restaurants", "indian"],
  ["coffee shop", "cafes-coffee-shops", "specialty"], ["bakery", "bakeries", "pastries"], ["barber shop", "barbers", "fades"], ["hair salon", "hair-salons", "cuts-styling"],
  ["nail salon", "nail-salons", "gel"], ["spa", "spas-esthetics", "day-spas"], ["gym", "gyms-fitness", "gyms"], ["dentist", "medical", "dentists"],
  ["walk in clinic", "medical", "walk-in-clinics"], ["pharmacy", "medical", "pharmacies"], ["physiotherapy", "medical", "physiotherapy"], ["chiropractor", "medical", "chiropractors"],
  ["optometrist", "medical", "eye-care"], ["veterinarian", "medical", "veterinarians"], ["auto repair", "auto-repair", "mechanics"], ["tire shop", "auto-repair", "tires"],
  ["car wash", "auto-repair", "car-wash"], ["plumber", "plumbers", "residential"], ["electrician", "electricians", "residential"], ["cleaning service", "cleaning-services", "house-cleaning"],
  ["grocery store", "grocery-markets", "bulk-health"], ["daycare", "professional-services", "childcare"], ["things to do", "activities-fun", "outdoor"],
];

// Google primaryType refines the subcategory where it's more specific than the query.
const PRIMARY_SUB = {
  pizza_restaurant: ["restaurants", "pizza"], hamburger_restaurant: ["restaurants", "burgers"], indian_restaurant: ["restaurants", "indian"],
  chinese_restaurant: ["restaurants", "chinese"], vietnamese_restaurant: ["restaurants", "vietnamese"], japanese_restaurant: ["restaurants", "japanese"],
  sushi_restaurant: ["restaurants", "sushi"], thai_restaurant: ["restaurants", "thai"], mexican_restaurant: ["restaurants", "mexican"],
  italian_restaurant: ["restaurants", "italian"], mediterranean_restaurant: ["restaurants", "mediterranean"], middle_eastern_restaurant: ["restaurants", "middle-eastern"],
  lebanese_restaurant: ["restaurants", "lebanese"], turkish_restaurant: ["restaurants", "turkish"], greek_restaurant: ["restaurants", "greek"],
  korean_restaurant: ["restaurants", "korean"], ramen_restaurant: ["restaurants", "ramen"], seafood_restaurant: ["restaurants", "seafood"],
  barbecue_restaurant: ["restaurants", "bbq"], breakfast_restaurant: ["restaurants", "brunch"], brunch_restaurant: ["restaurants", "brunch"],
  vegan_restaurant: ["restaurants", "vegan"], vegetarian_restaurant: ["restaurants", "vegan"], ice_cream_shop: ["restaurants", "ice-cream"],
  afghani_restaurant: ["restaurants", "afghan"], dessert_shop: ["cafes-coffee-shops", "dessert-cafes"], tea_house: ["cafes-coffee-shops", "tea"],
  juice_shop: ["cafes-coffee-shops", "juice-bar"], dentist: ["medical", "dentists"], dental_clinic: ["medical", "dentists"], pharmacy: ["medical", "pharmacies"],
  drugstore: ["medical", "pharmacies"], physiotherapist: ["medical", "physiotherapy"], chiropractor: ["medical", "chiropractors"],
  veterinary_care: ["medical", "veterinarians"], car_wash: ["auto-repair", "car-wash"], car_repair: ["auto-repair", "mechanics"],
};

const ALLOWED_CITY = /edmonton|sherwood park|st\.? albert|spruce grove|stony plain|leduc|beaumont|fort saskatchewan/i;
const BLOCKED_TYPES = new Set(["bar", "pub", "night_club", "liquor_store", "wine_bar", "casino", "bar_and_grill", "brewery", "winery", "cocktail_bar", "beer_hall"]);
const OK_BAR = /\b(nail|juice|brow|lash|beauty|blow ?dry|wax|espresso|salad|smoothie|protein|candy|sugar|oxygen|massage|dry) ?bars?\b/i;
const ALCOHOL_NAME = /\b(bar|bars|pub|tavern|brew\w*|taproom|tap room|winery|wine|liquor|saloon|cocktails?|booze|beer|distillery|speakeasy|cantina|lounge|alehouse|bistro bar|grill & bar|grill and bar)\b/i;
const OK_LOUNGE = /\b(beauty|nail|lash|brow|esports|gaming|hookah-free|hair|spa|massage|wax) lounge\b/i;
const PORK_NAME = /\b(pork|bacon|ham|hog|swine|pig|pigs|chicharr\w*|porchetta|lechon)\b/i;
const ALCOHOL_REVIEW = /\b(beers?|wines?|cocktails?|bartenders?|happy hour|pints?|on tap|margaritas?|mimosas?|sangria|liquor|booze|the bar)\b/gi;
const FOOD_OR_FUN = new Set(["restaurants", "cafes-coffee-shops", "bakeries", "catering", "activities-fun"]);

const FIELD_MASK = [
  "id", "displayName", "formattedAddress", "location", "rating", "userRatingCount", "priceLevel", "regularOpeningHours", "websiteUri",
  "nationalPhoneNumber", "googleMapsUri", "photos", "reviews", "types", "primaryType", "businessStatus", "servesBeer", "servesWine",
  "servesCocktails", "dineIn", "takeout", "delivery", "goodForChildren", "accessibilityOptions",
].map((f) => "places." + f).join(",") + ",nextPageToken";

// Edmonton area centroids for neighborhood assignment.
const AREAS = [
  ["Downtown", 53.5444, -113.4909, 1.6], ["Whyte Ave", 53.5185, -113.4980, 1.2], ["124 Street", 53.5440, -113.5370, 0.9],
  ["West Edmonton", 53.5225, -113.6242, 6], ["Windermere", 53.4300, -113.6050, 4], ["South Edmonton", 53.4500, -113.4900, 7],
  ["Mill Woods", 53.4560, -113.4250, 4], ["North Edmonton", 53.6000, -113.4600, 6], ["Castle Downs", 53.6130, -113.5160, 3],
  ["Beverly", 53.5700, -113.3900, 3],
];
const km = (a, b, c, d) => {
  const R = 6371, r = Math.PI / 180, x = (d - b) * r * Math.cos(((a + c) / 2) * r), y = (c - a) * r;
  return Math.sqrt(x * x + y * y) * R;
};
function neighborhood(addr, loc) {
  for (const c of CITIES) if (new RegExp(c.replace(".", "\\.?"), "i").test(addr)) return c;
  if (!loc) return "Edmonton";
  let best = "Edmonton", bestScore = Infinity;
  for (const [name, lat, lng, radius] of AREAS) {
    const d = km(loc.latitude, loc.longitude, lat, lng);
    if (d <= radius && d / radius < bestScore) { best = name; bestScore = d / radius; }
  }
  return best;
}

const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60).replace(/-$/, "");
const esc = (s) => String(s ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const norm = (s) => (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

function priceLevel(level) {
  return { PRICE_LEVEL_INEXPENSIVE: "$", PRICE_LEVEL_FREE: "$", PRICE_LEVEL_MODERATE: "$$", PRICE_LEVEL_EXPENSIVE: "$$$", PRICE_LEVEL_VERY_EXPENSIVE: "$$$$" }[level] ?? "";
}
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const fmtTime = (h = 0, m = 0) => `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
// Same "9:00 AM–5:00 PM" format the refresh job writes, built from structured periods.
function extractHours(p) {
  const periods = p.regularOpeningHours?.periods;
  if (!periods?.length) return null;
  if (periods.length === 1 && !periods[0].close) return Object.fromEntries(DAYS.map((d) => [d, "Open 24 hours"]));
  const out = Object.fromEntries(DAYS.map((d) => [d, "Closed"]));
  for (const per of periods) {
    if (per.open?.day == null) continue;
    const day = DAYS[per.open.day === 0 ? 6 : per.open.day - 1];
    const close = per.close ? fmtTime(per.close.hour, per.close.minute) : "11:59 PM";
    if (out[day] === "Closed") out[day] = `${fmtTime(per.open.hour, per.open.minute)}–${close}`;
  }
  return out;
}

let searches = 0, photoCalls = 0;
async function search(textQuery, pageToken) {
  if (searches >= MAX) throw new Error("search cap reached");
  if (!ALLOW_PAID && !freeLeft("search")) throw new Error("free search cap reached");
  searches++;
  addUsage("search");
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": FIELD_MASK },
    body: JSON.stringify({ textQuery, pageSize: 20, languageCode: "en", regionCode: "CA", ...(pageToken ? { pageToken } : {}) }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}
async function photo(name) {
  photoCalls++;
  addUsage("photo");
  const res = await fetch(`https://places.googleapis.com/v1/${name}/media?maxWidthPx=1400&key=${KEY}`, { redirect: "follow" });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.length < 8000 ? null : buf;
}

function reject(p, cat, minReviews) {
  if (p.businessStatus && p.businessStatus !== "OPERATIONAL") return "closed";
  const name = p.displayName?.text ?? "";
  const addr = p.formattedAddress ?? "";
  if (!name || !ALLOWED_CITY.test(addr)) return "area";
  if ((p.rating ?? 0) < 4.2 || (p.userRatingCount ?? 0) < minReviews) return "quality";
  if ((p.types ?? []).some((t) => BLOCKED_TYPES.has(t))) return "alcohol";
  if (p.servesBeer || p.servesWine) return "alcohol";
  if (ALCOHOL_NAME.test(name) && !OK_BAR.test(name) && !OK_LOUNGE.test(name)) return "alcohol";
  if (PORK_NAME.test(name)) return "pork";
  if (FOOD_OR_FUN.has(cat)) {
    const text = (p.reviews ?? []).map((r) => r.text?.text ?? "").join(" ");
    const hits = new Set((text.match(ALCOHOL_REVIEW) ?? []).map((h) => h.toLowerCase()));
    if (hits.size >= 2) return "alcohol";
    if (/\b(pork|bacon)\b/i.test(text) && cat === "restaurants" && /\b(pork|bacon)\b.*\b(pork|bacon)\b/is.test(text)) return "pork";
  }
  if (!(p.photos ?? []).some((ph) => ph.widthPx >= 800 && ph.widthPx >= ph.heightPx * 1.2)) return "photos";
  return null;
}

async function main() {
  const jobs = [
    ...EDMONTON.map(([q, cat, sub, pages]) => ({ q: `${q} in Edmonton, AB`, cat, sub, pages, min: 25, broad: false })),
    ...CITIES.flatMap((city) => CITY_QUERIES.map(([q, cat, sub]) => ({ q: `${q} in ${city}, AB`, cat, sub, pages: 1, min: 10, broad: true }))),
  ];
  const maxReq = jobs.reduce((s, j) => s + j.pages, 0);
  if (PLAN || !KEY) {
    console.log(`${jobs.length} queries, up to ${maxReq} search requests (cap ${MAX}).`);
    console.log(`Free this month: ${freeLeft("search")} searches, ${freeLeft("photo")} photos (2 per new listing).`);
    if (ALLOW_PAID) console.log(`--allow-paid: up to ~$${costOf("search", Math.min(maxReq, MAX)).toFixed(0)} in searches + $0.007 per photo past the free allowance.`);
    if (!KEY) console.log("Set GOOGLE_PLACES_API_KEY to run.");
    return;
  }

  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".md"));
  const takenSlugs = new Set(files.map((f) => f.replace(/\.md$/, "")));
  const takenCid = new Set(), takenNameAddr = new Set();
  for (const f of files) {
    const t = await fs.readFile(path.join(DIR, f), "utf8");
    const cid = t.match(/google_maps_url:\s*"[^"]*cid=(\d+)/)?.[1];
    if (cid) takenCid.add(cid);
    const name = t.match(/^name:\s*"(.*)"/m)?.[1], addr = t.match(/^address:\s*"(.*)"/m)?.[1];
    if (name) takenNameAddr.add(norm(name) + "|" + norm(addr ?? "").slice(0, 12));
  }

  const added = [], reasons = {};
  for (const job of jobs) {
    let token, kept = 0;
    for (let page = 0; page < job.pages; page++) {
      let data;
      try { data = await search(job.q, token); } catch (e) { console.log(`  ✗ ${job.q}: ${e.message}`); if (/cap/.test(e.message)) return finish(added, reasons); break; }
      for (const p of data.places ?? []) {
        const why = reject(p, job.cat, job.min);
        if (why) { reasons[why] = (reasons[why] ?? 0) + 1; continue; }
        const cid = p.googleMapsUri?.match(/cid=(\d+)/)?.[1];
        const name = p.displayName.text, addr = p.formattedAddress;
        const key = norm(name) + "|" + norm(addr).slice(0, 12);
        if ((cid && takenCid.has(cid)) || takenNameAddr.has(key)) { reasons.duplicate = (reasons.duplicate ?? 0) + 1; continue; }

        let [cat, sub] = [job.cat, job.sub];
        const refined = job.broad ? PRIMARY_SUB[p.primaryType] : undefined;
        if (refined && refined[0] === cat) sub = refined[1];

        let slug = slugify(name);
        if (takenSlugs.has(slug)) slug = slugify(`${name} ${neighborhood(addr, p.location)}`);
        for (let n = 2; takenSlugs.has(slug); n++) slug = `${slugify(name)}-${n}`;

        if (!ALLOW_PAID && freeLeft("photo") < 2) { console.log("  Free photo allowance used up this month."); return finish(added, reasons); }
        const shots = (p.photos ?? []).filter((ph) => ph.widthPx >= 800 && ph.widthPx >= ph.heightPx * 1.2).slice(0, 2);
        const photos = [];
        for (const [i, ph] of shots.entries()) {
          const buf = await photo(ph.name).catch(() => null);
          if (!buf) continue;
          const file = `${slug}-g${i + 1}.jpg`;
          await fs.writeFile(path.join(PHOTO_DIR, file), buf);
          photos.push(`/photos/${file}`);
        }
        if (!photos.length) { reasons.photos = (reasons.photos ?? 0) + 1; continue; }

        const amen = [];
        if (/halal/i.test(name) || /halal/i.test(job.q) || ((p.reviews ?? []).filter((r) => /halal/i.test(r.text?.text ?? "")).length >= 2)) amen.push("Halal");
        if (p.dineIn) amen.push("Dine-In");
        if (p.takeout) amen.push("Takeout");
        if (p.delivery) amen.push("Delivery");
        if (p.goodForChildren) amen.push("Family Friendly");
        if (p.accessibilityOptions?.wheelchairAccessibleEntrance) amen.push("Wheelchair Accessible");
        const hours = extractHours(p);
        const reviews = (p.reviews ?? []).map((r) => ({ name: r.authorAttribution?.displayName ?? "Google reviewer", rating: r.rating ?? 5, date: (r.publishTime ?? "").slice(0, 10), comment: (r.text?.text ?? "").trim() }))
          .filter((r) => r.comment.length > 20 && r.rating >= 4).slice(0, 5);
        const hood = neighborhood(addr, p.location);
        const price = priceLevel(p.priceLevel);

        const lines = [
          "---", `name: "${esc(name)}"`, `slug: "${slug}"`, `category: "${cat}"`, `subcategory: "${sub}"`, `tier: "featured"`, `description: ""`,
          `address: "${esc(addr.replace(/, Canada$/, ""))}"`, `neighborhood: "${hood}"`,
          ...(p.nationalPhoneNumber ? [`phone: "${esc(p.nationalPhoneNumber)}"`] : []),
          ...(p.websiteUri ? [`website: "${esc(p.websiteUri)}"`] : []),
          `google_maps_url: "${esc(p.googleMapsUri ?? "")}"`,
          ...(p.location ? [`latitude: ${p.location.latitude.toFixed(6)}`, `longitude: ${p.location.longitude.toFixed(6)}`] : []),
          ...(hours ? ["hours:", ...Object.entries(hours).map(([d, h]) => `  ${d}: "${esc(h)}"`)] : []),
          "photos:", ...photos.map((ph) => `  - "${ph}"`),
          `rating: ${Number(p.rating).toFixed(1)}`, `review_count: ${p.userRatingCount}`,
          ...(price ? [`price_range: "${price}"`] : []),
          ...(amen.length ? ["amenities:", ...amen.map((a) => `  - "${a}"`)] : ["amenities: []"]),
          `tags: ["edmonton", "${sub}"]`, "active: true", `date_listed: "${TODAY}"`,
          ...(reviews.length ? ["reviews:", ...reviews.flatMap((r) => [`  - name: "${esc(r.name)}"`, `    rating: ${r.rating}`, `    date: "${r.date}"`, "    comment: |", ...r.comment.replace(/\r\n/g, "\n").split("\n").map((l) => "      " + l.trimEnd())])] : []),
          "---", "",
        ];
        await fs.writeFile(path.join(DIR, `${slug}.md`), lines.join("\n"));
        takenSlugs.add(slug); if (cid) takenCid.add(cid); takenNameAddr.add(key);
        added.push({ slug, cat, sub, hood, name });
        kept++;
      }
      token = data.nextPageToken;
      if (!token) break;
    }
    console.log(`  ${String(kept).padStart(2)} new · ${job.q}`);
  }
  return finish(added, reasons);
}

async function finish(added, reasons) {
  await fs.writeFile(path.join(ROOT, "scripts/.discover-v3-new.json"), JSON.stringify(added, null, 1));
  const byCat = {};
  for (const a of added) byCat[a.cat] = (byCat[a.cat] ?? 0) + 1;
  console.log(`\nAdded ${added.length} · searches ${searches} · photos ${photoCalls}`);
  console.log("By category:", byCat);
  console.log("Skipped:", reasons);
  console.log(`Free left this month: ${freeLeft("search")} searches, ${freeLeft("photo")} photos.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
