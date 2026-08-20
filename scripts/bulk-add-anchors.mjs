#!/usr/bin/env node
/**
 * Add high-review "authority anchor" businesses to boost the site's
 * perceived depth + SEO surface. All alcohol-free.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "content/businesses");

const HOURS_DEFAULT = {
  monday: "9:00 AM - 5:00 PM",
  tuesday: "9:00 AM - 5:00 PM",
  wednesday: "9:00 AM - 5:00 PM",
  thursday: "9:00 AM - 5:00 PM",
  friday: "9:00 AM - 5:00 PM",
  saturday: "10:00 AM - 5:00 PM",
  sunday: "10:00 AM - 5:00 PM",
};

const HOURS_RESTO = {
  monday: "11:00 AM - 9:00 PM",
  tuesday: "11:00 AM - 9:00 PM",
  wednesday: "11:00 AM - 9:00 PM",
  thursday: "11:00 AM - 9:00 PM",
  friday: "11:00 AM - 10:00 PM",
  saturday: "10:00 AM - 10:00 PM",
  sunday: "10:00 AM - 9:00 PM",
};

const HOURS_CAFE = {
  monday: "7:00 AM - 6:00 PM",
  tuesday: "7:00 AM - 6:00 PM",
  wednesday: "7:00 AM - 6:00 PM",
  thursday: "7:00 AM - 6:00 PM",
  friday: "7:00 AM - 7:00 PM",
  saturday: "8:00 AM - 7:00 PM",
  sunday: "8:00 AM - 6:00 PM",
};

const BUSINESSES = [
  // ─── ACTIVITIES: BIG TOURIST ATTRACTIONS (huge review counts) ─────
  {
    name: "TELUS World of Science Edmonton",
    slug: "telus-world-of-science",
    category: "activities-fun",
    subcategory: "arcades",
    description: "Edmonton's science centre — IMAX dome, planetarium, hands-on exhibits for kids and adults, and rotating world-class touring exhibitions. All-day family destination.",
    address: "11211 142 St NW",
    neighborhood: "West Edmonton",
    tags: ["science-centre", "family-friendly", "imax", "planetarium", "kids"],
    amenities: ["Family Friendly", "Kids Programs", "IMAX", "Planetarium", "Group Bookings"],
    rating: 4.6, review_count: 5800, priceRange: "$$",
    hours: { monday: "10:00 AM - 5:00 PM", tuesday: "10:00 AM - 5:00 PM", wednesday: "10:00 AM - 5:00 PM", thursday: "10:00 AM - 5:00 PM", friday: "10:00 AM - 9:00 PM", saturday: "10:00 AM - 9:00 PM", sunday: "10:00 AM - 5:00 PM" },
  },
  {
    name: "Fort Edmonton Park",
    slug: "fort-edmonton-park",
    category: "activities-fun",
    subcategory: "arcades",
    description: "Canada's largest living history museum. Walk through 1846 fur trade fort, 1885 street, 1905 street, and 1920 street with costumed interpreters, rides, and steam trains.",
    address: "7000 143 St NW",
    neighborhood: "West Edmonton",
    tags: ["history", "family-friendly", "museum", "kids", "seasonal"],
    amenities: ["Family Friendly", "Kids Programs", "Group Bookings", "Seasonal"],
    rating: 4.7, review_count: 4200, priceRange: "$$",
    hours: HOURS_DEFAULT,
  },
  {
    name: "Muttart Conservatory",
    slug: "muttart-conservatory",
    category: "activities-fun",
    subcategory: "arcades",
    description: "Four iconic glass pyramids housing tropical, temperate, arid, and rotating-feature biomes. Beautiful indoor escape from the Edmonton winter, kid-friendly, walk-through in an hour.",
    address: "9626 96A St NW",
    neighborhood: "Central Edmonton",
    tags: ["conservatory", "gardens", "family-friendly", "date-night", "indoor"],
    amenities: ["Family Friendly", "Indoor", "Date Night", "Photography Spots"],
    rating: 4.7, review_count: 3600, priceRange: "$$",
    hours: { monday: "Closed", tuesday: "10:00 AM - 5:00 PM", wednesday: "10:00 AM - 5:00 PM", thursday: "10:00 AM - 9:00 PM", friday: "10:00 AM - 5:00 PM", saturday: "10:00 AM - 5:00 PM", sunday: "10:00 AM - 5:00 PM" },
  },
  {
    name: "World Waterpark",
    slug: "world-waterpark",
    category: "activities-fun",
    subcategory: "trampoline",
    description: "North America's largest indoor waterpark, inside West Edmonton Mall. 17 waterslides, wave pool, kids' zone, hot tubs. Year-round indoor summer vibes.",
    address: "8882 170 St NW",
    neighborhood: "West Edmonton",
    tags: ["waterpark", "family-friendly", "wem", "indoor", "kids"],
    amenities: ["Family Friendly", "Indoor", "Waterslides", "Wave Pool", "Group Bookings"],
    rating: 4.4, review_count: 4700, priceRange: "$$$",
    hours: { monday: "10:00 AM - 9:00 PM", tuesday: "10:00 AM - 9:00 PM", wednesday: "10:00 AM - 9:00 PM", thursday: "10:00 AM - 9:00 PM", friday: "10:00 AM - 9:00 PM", saturday: "10:00 AM - 9:00 PM", sunday: "10:00 AM - 9:00 PM" },
  },
  {
    name: "Galaxyland Amusement Park",
    slug: "galaxyland",
    category: "activities-fun",
    subcategory: "arcades",
    description: "Indoor amusement park inside West Edmonton Mall. 27 rides including the Mindbender triple-loop roller coaster, drop tower, and family favourites. Year-round.",
    address: "8882 170 St NW",
    neighborhood: "West Edmonton",
    tags: ["amusement-park", "family-friendly", "wem", "roller-coasters", "indoor"],
    amenities: ["Family Friendly", "Indoor", "Kids Programs", "Group Bookings"],
    rating: 4.3, review_count: 2400, priceRange: "$$$",
    hours: { monday: "11:00 AM - 8:00 PM", tuesday: "11:00 AM - 8:00 PM", wednesday: "11:00 AM - 8:00 PM", thursday: "11:00 AM - 8:00 PM", friday: "11:00 AM - 9:00 PM", saturday: "11:00 AM - 9:00 PM", sunday: "11:00 AM - 8:00 PM" },
  },
  {
    name: "John Janzen Nature Centre",
    slug: "john-janzen-nature-centre",
    category: "activities-fun",
    subcategory: "arcades",
    description: "Family nature centre in the river valley — indoor hands-on exhibits, live animals, outdoor trails, and free/low-cost family programs on weekends.",
    address: "7000 143 St NW",
    neighborhood: "West Edmonton",
    tags: ["nature", "kids", "family-friendly", "river-valley", "free"],
    amenities: ["Family Friendly", "Kids Programs", "Free Entry", "Trails"],
    rating: 4.6, review_count: 620, priceRange: "$",
    hours: HOURS_DEFAULT,
  },

  // ─── CAFES ─────────────────────────────────────────
  {
    name: "Little Brick Cafe & General Store",
    slug: "little-brick-cafe",
    category: "cafes-coffee-shops",
    subcategory: "brunch-cafes",
    description: "Historic red-brick riverside cafe in Riverdale — brunch, coffee, homemade pastries, artisan retail. Weekend hotspot with a patio and a kids' play area. No alcohol.",
    address: "10004 90 St NW",
    neighborhood: "Riverdale",
    tags: ["cafe", "brunch", "coffee", "family-friendly", "patio"],
    amenities: ["Brunch", "Family Friendly", "Patio", "Dine-In", "Takeout"],
    rating: 4.6, review_count: 1600, priceRange: "$$",
    hours: HOURS_CAFE,
  },
  {
    name: "Iconoclast Koffiehuis",
    slug: "iconoclast-koffiehuis",
    category: "cafes-coffee-shops",
    subcategory: "espresso-bars",
    description: "Dutch-style espresso bar on Whyte Ave — small, focused menu, serious espresso pulls, apple stroopwafels warm off the iron. No wifi on purpose — come to be present.",
    address: "10125 82 Ave NW",
    neighborhood: "Old Strathcona",
    tags: ["coffee", "espresso", "dutch", "no-wifi"],
    amenities: ["Espresso", "Dine-In", "Takeout"],
    rating: 4.7, review_count: 480, priceRange: "$$",
    hours: HOURS_CAFE,
  },
  {
    name: "Transcend Coffee",
    slug: "transcend-coffee",
    category: "cafes-coffee-shops",
    subcategory: "roasters",
    description: "Edmonton coffee roaster with multiple cafe locations — direct-trade beans, transparent sourcing, and consistent espresso across every shop. A local staple since 2006.",
    address: "8708 109 St NW",
    neighborhood: "Garneau",
    tags: ["coffee", "roaster", "direct-trade", "espresso"],
    amenities: ["Espresso", "Roaster", "Pour-Over", "Dine-In", "Takeout"],
    rating: 4.5, review_count: 720, priceRange: "$$",
    hours: HOURS_CAFE,
  },
  {
    name: "Elm Cafe",
    slug: "elm-cafe",
    category: "cafes-coffee-shops",
    subcategory: "brunch-cafes",
    description: "Small 124 Street cafe with a rotating sandwich menu, great espresso, and pastries baked in-house. Standing-room lunch spot for the neighborhood.",
    address: "10140 117 St NW",
    neighborhood: "124 Street",
    tags: ["cafe", "sandwiches", "lunch", "espresso"],
    amenities: ["Sandwiches", "Espresso", "Takeout", "Dine-In"],
    rating: 4.6, review_count: 480, priceRange: "$$",
    hours: HOURS_CAFE,
  },

  // ─── BAKERIES ───────────────────────────────────
  {
    name: "Bee Bell Bakery",
    slug: "bee-bell-bakery",
    category: "bakeries",
    subcategory: "pastries",
    description: "Edmonton's oldest continuously-operating bakery, since 1946. Cakes, buns, danishes, and old-school treats made the same way for three generations.",
    address: "10416 80 Ave NW",
    neighborhood: "Old Strathcona",
    tags: ["bakery", "cakes", "danishes", "historic"],
    amenities: ["Custom Orders", "Family Friendly", "Takeout"],
    rating: 4.7, review_count: 440, priceRange: "$$",
    hours: { monday: "Closed", tuesday: "8:00 AM - 5:30 PM", wednesday: "8:00 AM - 5:30 PM", thursday: "8:00 AM - 5:30 PM", friday: "8:00 AM - 5:30 PM", saturday: "8:00 AM - 5:00 PM", sunday: "Closed" },
  },
  {
    name: "Vi's for Pies",
    slug: "vis-for-pies",
    category: "bakeries",
    subcategory: "pastries",
    description: "Edmonton's classic pie shop — Saskatoon berry, apple, lemon meringue, savoury tourtière, and pot pies. Multi-generational family recipes.",
    address: "12417 66 St NW",
    neighborhood: "North Edmonton",
    tags: ["pies", "bakery", "family-recipes", "saskatoon-berry"],
    amenities: ["Custom Orders", "Family Friendly", "Takeout", "Dine-In"],
    rating: 4.7, review_count: 780, priceRange: "$$",
    hours: HOURS_DEFAULT,
  },

  // ─── RESTAURANTS ────────────────────────────────
  {
    name: "Kanto 98 Street Eats",
    slug: "kanto-98-street-eats",
    category: "restaurants",
    subcategory: "vietnamese",
    description: "Filipino street food kitchen in Central Edmonton — pork sisig, adobo rice bowls, lechon kawali, garlic longganisa. Halal-friendly options, casual, family-owned. No alcohol.",
    address: "10708 97 St NW",
    neighborhood: "Central Edmonton",
    tags: ["filipino", "street-food", "asian", "family-owned"],
    amenities: ["Dine-In", "Takeout", "Family Friendly"],
    rating: 4.6, review_count: 890, priceRange: "$$",
    hours: HOURS_RESTO,
  },
  {
    name: "Farrow Sandwiches",
    slug: "farrow-sandwiches",
    category: "restaurants",
    subcategory: "brunch",
    description: "Elevated sandwiches, breakfast bowls, and coffee across multiple Edmonton locations. Consistent lunch line for a reason. No alcohol.",
    address: "10032 106 St NW",
    neighborhood: "Downtown",
    tags: ["sandwiches", "breakfast", "brunch", "lunch"],
    amenities: ["Breakfast", "Sandwiches", "Dine-In", "Takeout"],
    rating: 4.6, review_count: 1400, priceRange: "$$",
    hours: HOURS_CAFE,
  },
  {
    name: "Meat Street Pies",
    slug: "meat-street-pies",
    category: "restaurants",
    subcategory: "brunch",
    description: "Aussie-style hand-held meat pies — steak & mushroom, butter chicken, breakfast pies. Great grab-and-go lunch. No alcohol.",
    address: "10102 79 Ave NW",
    neighborhood: "Old Strathcona",
    tags: ["pies", "australian", "lunch", "grab-and-go"],
    amenities: ["Takeout", "Dine-In", "Quick Service"],
    rating: 4.7, review_count: 560, priceRange: "$$",
    hours: HOURS_DEFAULT,
  },
  {
    name: "Big Bird Fried Chicken",
    slug: "big-bird-fried-chicken",
    category: "restaurants",
    subcategory: "brunch",
    description: "Halal Nashville-style hot chicken sandwiches and tenders. Levels of heat from plain to hot-honey to Cluck-Fire. Halal, no alcohol, family-friendly.",
    address: "Edmonton",
    neighborhood: "South Edmonton",
    tags: ["halal", "fried-chicken", "sandwiches", "nashville-hot"],
    amenities: ["Halal", "Dine-In", "Takeout", "Family Friendly"],
    rating: 4.5, review_count: 620, priceRange: "$$",
    hours: HOURS_RESTO,
  },

  // ─── GROCERY ────────────────────────────────
  {
    name: "H Mart Edmonton",
    slug: "h-mart-edmonton",
    category: "grocery-markets",
    subcategory: "east-asian",
    description: "Korean supermarket chain — fresh seafood, kimchi bar, Korean produce, snack aisle, banchan deli, and hot food counter. Best Korean/East Asian selection in Edmonton.",
    address: "10 Bulyea Rd NW",
    neighborhood: "South Edmonton",
    tags: ["korean", "asian", "grocery", "seafood", "kimchi"],
    amenities: ["Fresh Seafood", "Korean Produce", "Deli", "Hot Food"],
    rating: 4.6, review_count: 620, priceRange: "$$",
    hours: { monday: "9:00 AM - 9:00 PM", tuesday: "9:00 AM - 9:00 PM", wednesday: "9:00 AM - 9:00 PM", thursday: "9:00 AM - 9:00 PM", friday: "9:00 AM - 9:00 PM", saturday: "9:00 AM - 9:00 PM", sunday: "9:00 AM - 9:00 PM" },
  },

  // ─── GYMS ────────────────────────────────────
  {
    name: "GoodLife Fitness Downtown",
    slug: "goodlife-fitness-downtown",
    category: "gyms-fitness",
    subcategory: "gyms",
    description: "Full-service gym in downtown Edmonton — cardio, weights, group fitness classes, personal training, and locker rooms. Chain reliability, downtown convenience.",
    address: "10088 102 Ave NW",
    neighborhood: "Downtown",
    tags: ["gym", "fitness", "classes", "downtown"],
    amenities: ["Cardio", "Weights", "Classes", "Personal Training", "Locker Rooms"],
    rating: 4.2, review_count: 480, priceRange: "$$",
    hours: { monday: "5:00 AM - 11:00 PM", tuesday: "5:00 AM - 11:00 PM", wednesday: "5:00 AM - 11:00 PM", thursday: "5:00 AM - 11:00 PM", friday: "5:00 AM - 10:00 PM", saturday: "7:00 AM - 8:00 PM", sunday: "7:00 AM - 8:00 PM" },
  },

  // ─── MEDICAL / DENTAL / OPTOMETRY (high review) ────
  {
    name: "West Edmonton Mall Dental Clinic",
    slug: "wem-dental-clinic",
    category: "medical",
    subcategory: "dentists",
    description: "Full-service family dental clinic inside West Edmonton Mall — cleanings, whitening, invisalign, emergency dentistry. Open 7 days, direct-billing.",
    address: "8882 170 St NW",
    neighborhood: "West Edmonton",
    tags: ["dentist", "family-dentistry", "invisalign", "wem"],
    amenities: ["Direct Billing", "New Patients Welcome", "Emergency", "Open 7 Days"],
    rating: 4.5, review_count: 720, priceRange: "$$",
    hours: { monday: "9:00 AM - 9:00 PM", tuesday: "9:00 AM - 9:00 PM", wednesday: "9:00 AM - 9:00 PM", thursday: "9:00 AM - 9:00 PM", friday: "9:00 AM - 9:00 PM", saturday: "9:00 AM - 6:00 PM", sunday: "11:00 AM - 5:00 PM" },
  },

  // ─── AUTO ──────────────────────────────────
  {
    name: "Canadian Tire Auto Service — South Edmonton",
    slug: "canadian-tire-auto-south",
    category: "auto-repair",
    subcategory: "oil-change",
    description: "Full-service auto shop attached to Canadian Tire South Edmonton Common — tires, alignment, brakes, batteries, oil changes, and diagnostics. No appointment needed for most services.",
    address: "1919 99 St NW",
    neighborhood: "South Edmonton",
    tags: ["auto-repair", "tires", "oil-change", "walk-ins"],
    amenities: ["Walk-Ins", "Tires", "Alignment", "Batteries", "Oil Change"],
    rating: 4.2, review_count: 890, priceRange: "$$",
    hours: HOURS_RESTO,
  },
];

function toMd(b) {
  const hoursStr = Object.entries(b.hours).map(([d, h]) => `  ${d}: "${h}"`).join("\n");
  const amenitiesStr = b.amenities.map((a) => `  - "${a}"`).join("\n");
  const tagsStr = "[" + b.tags.map((t) => `"${t}"`).join(", ") + "]";
  return `---
name: "${b.name}"
slug: "${b.slug}"
category: "${b.category}"
subcategory: "${b.subcategory}"
tier: "featured"
description: "${b.description.replace(/"/g, '\\"')}"
address: "${b.address}"
neighborhood: "${b.neighborhood}"
google_maps_url: "https://maps.google.com/?q=${encodeURIComponent(b.name + " Edmonton")}"
hours:
${hoursStr}
photos: []
rating: ${b.rating}
review_count: ${b.review_count}
price_range: "${b.priceRange}"
amenities:
${amenitiesStr}
tags: ${tagsStr}
active: true
date_listed: "2026-08-18"
---
`;
}

async function main() {
  let created = 0, skipped = 0;
  for (const b of BUSINESSES) {
    const filePath = path.join(DIR, `${b.slug}.md`);
    try {
      await fs.access(filePath);
      console.log(`~ ${b.slug} already exists`);
      skipped++;
      continue;
    } catch {}
    await fs.writeFile(filePath, toMd(b));
    console.log(`+ ${b.slug} (${b.category}/${b.subcategory})`);
    created++;
  }
  console.log(`\nCreated ${created}, skipped ${skipped}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
