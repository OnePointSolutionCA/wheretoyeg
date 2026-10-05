/**
 * Title, description and label helpers shared by every template.
 * Copy rules: keyword first, titles at most about 60 characters, descriptions 150 to 160, and no dashes.
 */

import { clip } from "./text";

export const TITLE_MAX = 60;
export const DESC_MIN = 150;
export const DESC_MAX = 160;

/** Swaps dash asides for commas so generated copy reads like a person wrote it. */
export function noDash(s: string): string {
  return s
    .replace(/\s+[—–]\s+/g, ", ")
    .replace(/\s+-\s+/g, ", ")
    .replace(/[—–]/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

/** First candidate that fits, otherwise the shortest one clipped. */
export function fitTitle(candidates: string[], max = TITLE_MAX): string {
  const clean = candidates.map((c) => noDash(c)).filter(Boolean);
  const hit = clean.find((c) => c.length <= max);
  if (hit) return hit;
  const shortest = clean.reduce((a, b) => (b.length < a.length ? b : a), clean[0] ?? "");
  return clip(shortest, max);
}

/**
 * Builds a meta description from sentences in priority order. Sentences that would push it past
 * the max are skipped, then padding sentences top it up toward the min.
 */
export function metaDescription(parts: string[], pads: string[] = [], min = DESC_MIN, max = DESC_MAX): string {
  let out = "";
  for (const raw of parts) {
    const p = noDash(raw ?? "");
    if (!p) continue;
    const next = out ? `${out} ${p}` : p;
    if (next.length <= max) out = next;
    else if (!out) out = clip(p, max);
  }
  for (const raw of pads) {
    if (out.length >= min) break;
    const p = noDash(raw);
    const next = out ? `${out} ${p}` : p;
    if (next.length <= max) out = next;
  }
  return out;
}

/** "bowling alley" to "Bowling Alley"; keeps existing capitals like "VR" or "CrossFit". */
export function titleCase(s: string): string {
  const small = new Set(["and", "or", "of", "in", "on", "the", "a", "for", "to", "&"]);
  return s
    .split(" ")
    .map((w, i) => (i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export const nf = (n: number) => n.toLocaleString("en-CA");

export function listJoin(items: string[]): string {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// ---------------------------------------------------------------------------
// What kind of business a listing is, in plain words, for titles, descriptions and alt text.
// Values are sentence case ("Thai restaurant"); use titleCase() for titles.
// ---------------------------------------------------------------------------

const CATEGORY_TYPE: Record<string, string> = {
  restaurants: "restaurant",
  bakeries: "bakery",
  "cafes-coffee-shops": "coffee shop",
  barbers: "barbershop",
  "hair-salons": "hair salon",
  "nail-salons": "nail salon",
  "lash-techs": "lash studio",
  "spas-esthetics": "spa",
  "gyms-fitness": "gym",
  "auto-repair": "auto repair shop",
  plumbers: "plumber",
  electricians: "electrician",
  "cleaning-services": "cleaning service",
  "grocery-markets": "grocery store",
  medical: "health clinic",
  photographers: "photographer",
  "professional-services": "local service",
  catering: "caterer",
  "activities-fun": "place to visit",
};

const SUB_TYPE: Record<string, Record<string, string>> = {
  restaurants: {
    shawarma: "shawarma restaurant", burgers: "burger restaurant", sushi: "sushi restaurant", pizza: "pizza restaurant",
    steakhouses: "steakhouse", seafood: "seafood restaurant", bbq: "BBQ restaurant", brunch: "brunch spot", vegan: "vegan restaurant",
    "fine-dining": "fine dining restaurant", "late-night": "late night restaurant", family: "family restaurant",
    "fried-chicken": "fried chicken restaurant", biryani: "biryani restaurant", buffet: "buffet restaurant", donair: "donair shop",
    "food-truck": "food truck", "halal-chicken": "halal chicken restaurant", "korean-bbq": "Korean BBQ restaurant", pho: "pho restaurant",
    ramen: "ramen restaurant", wings: "wing restaurant", "dim-sum": "dim sum restaurant", dumplings: "dumpling restaurant",
    "halal-fast-food": "halal fast food restaurant", latin: "Latin American restaurant", poutine: "poutine shop", "ice-cream": "ice cream shop",
  },
  "activities-fun": {
    climbing: "climbing gym", padel: "padel and racquet club", "escape-rooms": "escape room", arcades: "arcade", bowling: "bowling alley",
    trampoline: "trampoline park", "axe-throwing": "axe throwing venue", karting: "go kart track", "board-games": "board game cafe",
    "mini-golf": "mini golf course", "laser-tag": "laser tag arena", "indoor-playground": "indoor playground", museums: "museum",
    outdoor: "park", skating: "skating spot", "vr-arcade": "VR arcade", paintball: "paintball field",
  },
  "auto-repair": {
    mechanics: "auto mechanic", collision: "collision repair shop", tires: "tire shop", transmission: "transmission shop",
    "oil-change": "oil change shop", detailing: "auto detailing shop", "european-cars": "European auto repair shop",
    "japanese-cars": "Japanese auto repair shop", "body-shops": "auto body shop", "car-wash": "car wash", windshield: "auto glass shop",
  },
  bakeries: { "custom-cakes": "cake shop", cupcakes: "cupcake shop", "gluten-free": "gluten free bakery", "halal-bakeries": "halal bakery", "wedding-cakes": "wedding cake bakery", "middle-eastern": "Middle Eastern bakery" },
  "cafes-coffee-shops": {
    roasters: "coffee roaster", "boba-bubble-tea": "bubble tea shop", "dessert-cafes": "dessert cafe", "brunch-cafes": "brunch cafe",
    "juice-bar": "juice bar", tea: "tea shop", "internet-cafe": "gaming cafe", vegan: "vegan cafe", "espresso-bars": "espresso bar",
  },
  catering: { "halal-catering": "halal caterer", "wedding-catering": "wedding caterer", "corporate-catering": "corporate caterer", "food-trucks": "food truck", "indian-catering": "Indian caterer" },
  "cleaning-services": {
    "house-cleaning": "house cleaning service", "commercial-cleaning": "commercial cleaning company", "move-out": "move out cleaning service",
    carpet: "carpet cleaner", windows: "window cleaner", "junk-removal": "junk removal company", landscaping: "landscaper", moving: "moving company",
    painting: "painter", "pest-control": "pest control company",
  },
  electricians: { hvac: "furnace and HVAC company" },
  "grocery-markets": {
    "halal-meat": "halal butcher", "middle-eastern": "Middle Eastern grocery store", "south-asian": "South Asian grocery store",
    "east-asian": "Asian grocery store", "african-caribbean": "African and Caribbean grocery store", "farmers-markets": "farmers market",
    "bulk-health": "health food store", butcher: "butcher shop",
  },
  "gyms-fitness": {
    "24-7-gyms": "24 hour gym", crossfit: "CrossFit gym", yoga: "yoga studio", pilates: "Pilates studio", boxing: "boxing gym",
    "martial-arts": "martial arts school", "personal-training": "personal training studio", "womens-only": "women's gym", dance: "dance studio",
    climbing: "climbing gym", cycling: "spin studio", physiotherapy: "sports physiotherapy clinic", swimming: "swimming facility",
  },
  "lash-techs": { "brow-services": "brow studio" },
  medical: {
    "walk-in-clinics": "walk in clinic", "family-doctors": "family doctor's office", pharmacies: "pharmacy", dentists: "dental clinic",
    orthodontists: "orthodontist", "eye-care": "eye care clinic", "hearing-care": "hearing clinic", physiotherapy: "physiotherapy clinic",
    chiropractors: "chiropractic clinic", "massage-therapy": "massage therapy clinic", dermatology: "dermatology clinic",
    "diagnostic-imaging": "diagnostic imaging clinic", "medical-supplies": "medical supply store", pediatricians: "pediatric clinic",
    veterinarians: "veterinary clinic", counselling: "counselling practice", acupuncture: "acupuncture clinic",
  },
  photographers: {
    wedding: "wedding photographer", family: "family photographer", brand: "brand and product photographer", events: "event photographer",
    portraits: "portrait and headshot photographer", "real-estate": "real estate photographer", maternity: "maternity photographer", graduation: "graduation photographer",
  },
  plumbers: { renovations: "renovation company", roofing: "roofing company", "garage-door": "garage door company", locksmith: "locksmith" },
  "professional-services": {
    legal: "law office", "marketing-web": "marketing agency", accounting: "accounting firm", "financial-advisors": "financial advisor",
    immigration: "immigration consultant", notaries: "notary", "real-estate": "real estate agent", insurance: "insurance broker",
    childcare: "daycare", "driving-school": "driving school", "pet-grooming": "pet groomer", mortgage: "mortgage broker",
    printing: "print shop", tutoring: "tutoring service", "security-services": "security company",
  },
  "spas-esthetics": {
    facials: "facial and skin care studio", hydrafacial: "HydraFacial studio", waxing: "waxing studio", "laser-hair-removal": "laser hair removal clinic",
    microneedling: "skin clinic", "mani-pedi": "nail spa", "day-spas": "day spa", massage: "massage spa", medspa: "medical spa",
  },
};

/** Cuisine subcategories that read as "{Cuisine} restaurant". */
const CUISINE = new Set([
  "pakistani", "lebanese", "afghan", "mediterranean", "italian", "mexican", "indian", "chinese", "thai", "vietnamese", "ethiopian",
  "japanese", "middle-eastern", "caribbean", "filipino", "greek", "turkish", "bangladeshi", "korean", "somali", "sudanese", "eritrean", "uyghur",
]);

/** "Thai restaurant", "bowling alley", "dental clinic"... falls back to the category's own noun. */
export function businessType(category: string, sub?: { slug: string; name: string }): string {
  if (sub) {
    const hit = SUB_TYPE[category]?.[sub.slug];
    if (hit) return hit;
    if (category === "restaurants" && CUISINE.has(sub.slug)) return `${sub.name} restaurant`;
  }
  return CATEGORY_TYPE[category] ?? "local business";
}

/** Plural noun for a whole category, used in hub headings and copy ("restaurants", "auto repair shops"). */
export const CATEGORY_PLURAL: Record<string, string> = {
  restaurants: "restaurants",
  bakeries: "bakeries",
  "cafes-coffee-shops": "coffee shops and cafes",
  barbers: "barbers",
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

/** Heading form of a category in an area: "Restaurants", "Things to Do", "Auto Repair Shops". */
export const CATEGORY_HEADING: Record<string, string> = {
  restaurants: "Restaurants",
  bakeries: "Bakeries",
  "cafes-coffee-shops": "Coffee Shops",
  barbers: "Barbers",
  "hair-salons": "Hair Salons",
  "nail-salons": "Nail Salons",
  "lash-techs": "Lash Techs",
  "spas-esthetics": "Spas",
  "gyms-fitness": "Gyms & Fitness Studios",
  "auto-repair": "Auto Repair Shops",
  plumbers: "Plumbers",
  electricians: "Electricians",
  "cleaning-services": "Cleaning Services",
  "grocery-markets": "Grocery Stores",
  medical: "Clinics & Health Services",
  photographers: "Photographers",
  "professional-services": "Professional Services",
  catering: "Caterers",
  "activities-fun": "Things to Do",
};

/**
 * Headings for subcategories whose own names don't stand alone ("Residential", "Legal", "Gel Manicures"),
 * so pages read "Best Residential Plumbers in Edmonton" instead of "Best Residential in Edmonton".
 */
export const SUB_HEADING: Record<string, Record<string, string>> = {
  electricians: {
    residential: "Residential Electricians", commercial: "Commercial Electricians", emergency: "Emergency Electricians",
    "ev-chargers": "EV Charger Installers", "panel-upgrades": "Panel Upgrade Electricians", lighting: "Lighting Electricians", hvac: "Furnace & HVAC Companies",
  },
  plumbers: {
    residential: "Residential Plumbers", commercial: "Commercial Plumbers", emergency: "Emergency Plumbers", "drain-cleaning": "Drain Cleaning Services",
    "water-heaters": "Water Heater Plumbers", renovations: "Renovation Companies", roofing: "Roofers", "garage-door": "Garage Door Companies", locksmith: "Locksmiths",
  },
  "professional-services": {
    legal: "Lawyers", "marketing-web": "Marketing Agencies", accounting: "Accountants", "financial-advisors": "Financial Advisors",
    immigration: "Immigration Consultants", notaries: "Notaries", "real-estate": "Real Estate Agents", insurance: "Insurance Brokers", childcare: "Daycares",
    "driving-school": "Driving Schools", "pet-grooming": "Pet Groomers", mortgage: "Mortgage Brokers", printing: "Print Shops", tutoring: "Tutors",
    "security-services": "Security Companies",
  },
  photographers: {
    wedding: "Wedding Photographers", family: "Family Photographers", brand: "Brand & Product Photographers", events: "Event Photographers",
    portraits: "Headshot Photographers", "real-estate": "Real Estate Photographers", maternity: "Maternity Photographers", graduation: "Graduation Photographers",
  },
  barbers: {
    fades: "Barbers for Fades", "mens-haircuts": "Men's Barbers", "kids-haircuts": "Kids Barbers", "beard-grooming": "Beard Trim Barbers",
    "straight-razor": "Straight Razor Shaves", "walk-in-barbers": "Walk in Barbers",
  },
  "hair-salons": {
    "cuts-styling": "Haircut & Styling Salons", colour: "Hair Colour Salons", balayage: "Balayage Salons", extensions: "Hair Extension Salons",
    "curly-hair": "Curly Hair Salons", keratin: "Keratin Treatment Salons", "bridal-hair": "Bridal Hair Stylists", blowouts: "Blowout Bars",
  },
  "nail-salons": {
    gel: "Gel Nail Salons", acrylic: "Acrylic Nail Salons", dip: "Dip Powder Nail Salons", "nail-art": "Nail Art Salons",
    pedicures: "Pedicure Salons", french: "French Manicure Salons", "mani-pedi": "Mani Pedi Salons",
  },
  "lash-techs": {
    classic: "Classic Lash Extensions", hybrid: "Hybrid Lash Extensions", volume: "Volume Lash Extensions", "mega-volume": "Mega Volume Lashes",
    "lash-lifts": "Lash Lifts & Tints", "brow-services": "Brow Studios", "lash-extensions": "Lash Extensions",
  },
  "auto-repair": {
    mechanics: "Mechanics", collision: "Collision Repair Shops", tires: "Tire Shops", transmission: "Transmission Shops", "oil-change": "Oil Change Shops",
    detailing: "Auto Detailing Shops", "european-cars": "European Car Repair Shops", "japanese-cars": "Japanese Car Repair Shops",
    "body-shops": "Auto Body Shops", "car-wash": "Car Washes", windshield: "Windshield & Auto Glass Shops",
  },
  medical: {
    "walk-in-clinics": "Walk in Clinics", "eye-care": "Eye Care Clinics", "hearing-care": "Hearing Clinics", physiotherapy: "Physiotherapy Clinics",
    "massage-therapy": "Massage Therapists", dermatology: "Dermatology Clinics", "diagnostic-imaging": "Diagnostic Imaging Clinics",
    "medical-supplies": "Medical Supply Stores", counselling: "Counsellors", acupuncture: "Acupuncture Clinics",
  },
  "gyms-fitness": {
    gyms: "Gyms", "24-7-gyms": "24 Hour Gyms", crossfit: "CrossFit Gyms", pilates: "Pilates Studios", boxing: "Boxing Gyms",
    "martial-arts": "Martial Arts Schools", "personal-training": "Personal Trainers", "womens-only": "Women's Gyms", dance: "Dance Studios",
    cycling: "Spin Studios", physiotherapy: "Sports Physio Clinics", swimming: "Swim Facilities",
  },
  "spas-esthetics": {
    hydrafacial: "HydraFacial Spas", waxing: "Waxing Studios", "laser-hair-removal": "Laser Hair Removal Clinics", microneedling: "Microneedling Clinics",
    "body-treatments": "Body Treatment Spas", "mani-pedi": "Mani Pedi Spas", massage: "Massage Spas", medspa: "Medical Spas",
  },
  "cafes-coffee-shops": {
    roasters: "Coffee Roasters", "pour-over": "Pour Over Cafes", "boba-bubble-tea": "Bubble Tea Shops", "laptop-friendly": "Laptop Friendly Cafes",
    "late-night-cafes": "Late Night Cafes", specialty: "Specialty Coffee Shops", "juice-bar": "Juice Bars", tea: "Tea Shops", "internet-cafe": "Gaming Cafes",
  },
  "cleaning-services": {
    "house-cleaning": "House Cleaners", "commercial-cleaning": "Commercial Cleaners", "move-out": "Move Out Cleaners", "deep-clean": "Deep Cleaning Services",
    carpet: "Carpet Cleaners", windows: "Window Cleaners", airbnb: "Airbnb Cleaners", "junk-removal": "Junk Removal Companies", landscaping: "Landscapers",
    moving: "Movers", painting: "Painters", "pest-control": "Pest Control Companies",
  },
  "grocery-markets": {
    "halal-meat": "Halal Butchers", "middle-eastern": "Middle Eastern Grocery Stores", "south-asian": "South Asian Grocery Stores",
    "east-asian": "Asian Grocery Stores", "african-caribbean": "African & Caribbean Grocery Stores", "farmers-markets": "Farmers Markets",
    "bulk-health": "Health Food Stores", butcher: "Butcher Shops",
  },
  bakeries: {
    sourdough: "Sourdough Bakeries", "custom-cakes": "Custom Cake Shops", pastries: "Pastry Shops", cupcakes: "Cupcake Shops", "gluten-free": "Gluten Free Bakeries",
    "wedding-cakes": "Wedding Cake Bakeries", "artisan-bread": "Artisan Bread Bakeries",
  },
  catering: { "private-events": "Private Event Caterers", buffets: "Buffet Caterers" },
  "activities-fun": {
    padel: "Padel & Racquet Clubs", arcades: "Arcades", bowling: "Bowling Alleys", karting: "Go Kart Tracks", outdoor: "Parks & Outdoor Spots", skating: "Skating Spots",
  },
};

const KEEP_CASE = /^(?:[A-Z0-9&']{2,}|CrossFit|HydraFacial|Pilates|Airbnb|Middle|Eastern|South|Asian|African|Caribbean|European|Japanese|French|Men's|Women's)$/;

/** Mid-sentence form of a heading: "Residential Plumbers" to "residential plumbers", keeping "EV", "HVAC", "Asian"... */
export function lowerHeading(s: string): string {
  return s
    .split(" ")
    .map((w) => (KEEP_CASE.test(w) ? w : w.toLowerCase()))
    .join(" ");
}
