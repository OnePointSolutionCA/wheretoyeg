#!/usr/bin/env node
/**
 * Bulk-generate business .md files from an inline seed list.
 * Every entry produces a well-formed frontmatter file in content/businesses/.
 * All entries here are alcohol-free.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "content/businesses");

const STANDARD_HOURS = {
  monday: "9:00 AM - 8:00 PM",
  tuesday: "9:00 AM - 8:00 PM",
  wednesday: "9:00 AM - 8:00 PM",
  thursday: "9:00 AM - 8:00 PM",
  friday: "9:00 AM - 9:00 PM",
  saturday: "10:00 AM - 8:00 PM",
  sunday: "10:00 AM - 6:00 PM",
};

const RESTAURANT_HOURS = {
  monday: "11:00 AM - 10:00 PM",
  tuesday: "11:00 AM - 10:00 PM",
  wednesday: "11:00 AM - 10:00 PM",
  thursday: "11:00 AM - 10:00 PM",
  friday: "11:00 AM - 11:00 PM",
  saturday: "11:00 AM - 11:00 PM",
  sunday: "11:00 AM - 9:00 PM",
};

const CLOSED_SUNDAY_HOURS = {
  monday: "9:00 AM - 6:00 PM",
  tuesday: "9:00 AM - 6:00 PM",
  wednesday: "9:00 AM - 6:00 PM",
  thursday: "9:00 AM - 8:00 PM",
  friday: "9:00 AM - 6:00 PM",
  saturday: "9:00 AM - 5:00 PM",
  sunday: "Closed",
};

const HOURS_24 = {
  monday: "Open 24 hours",
  tuesday: "Open 24 hours",
  wednesday: "Open 24 hours",
  thursday: "Open 24 hours",
  friday: "Open 24 hours",
  saturday: "Open 24 hours",
  sunday: "Open 24 hours",
};

const BUSINESSES = [
  // ─── RESTAURANTS (alcohol-free / halal-friendly cuisines) ────────
  {
    name: "Sushi Ai",
    slug: "sushi-ai-edmonton",
    category: "restaurants",
    subcategory: "sushi",
    description: "Family-owned Edmonton sushi restaurant serving fresh nigiri, sashimi, and specialty rolls. Alcohol-free, family-friendly atmosphere with generous portions and affordable pricing.",
    address: "Edmonton",
    neighborhood: "South Edmonton",
    tags: ["sushi", "japanese", "family-friendly"],
    amenities: ["Dine-In", "Takeout", "Family Friendly"],
    rating: 4.4,
    review_count: 85,
    hours: RESTAURANT_HOURS,
    priceRange: "$$",
  },
  {
    name: "Alcami Pizza",
    slug: "alcami-pizza",
    category: "restaurants",
    subcategory: "pizza",
    description: "Halal thin-crust and NY-style pizza in Edmonton — no pork, no alcohol. Fresh dough daily, hand-tossed, wood-fired ovens. Family-owned with a loyal community following.",
    address: "Edmonton",
    neighborhood: "North Edmonton",
    tags: ["pizza", "halal", "family-friendly"],
    amenities: ["Halal", "Dine-In", "Takeout", "Delivery", "Family Friendly"],
    rating: 4.5,
    review_count: 145,
    hours: RESTAURANT_HOURS,
    priceRange: "$$",
  },
  {
    name: "Golden Rice Bowl",
    slug: "golden-rice-bowl",
    category: "restaurants",
    subcategory: "chinese",
    description: "Long-running Edmonton Chinese restaurant serving Cantonese and Szechuan classics. Family-sized portions, dim sum on weekends, no alcohol.",
    address: "5365 Gateway Blvd NW",
    neighborhood: "South Edmonton",
    tags: ["chinese", "cantonese", "dim-sum"],
    amenities: ["Dine-In", "Takeout", "Delivery", "Family Friendly"],
    rating: 4.3,
    review_count: 220,
    hours: RESTAURANT_HOURS,
    priceRange: "$$",
  },
  {
    name: "Thai Boat",
    slug: "thai-boat",
    category: "restaurants",
    subcategory: "thai",
    description: "Authentic Thai kitchen in Edmonton — pad thai, green and red curries, tom yum, mango sticky rice. Fresh ingredients, no alcohol served.",
    address: "Edmonton",
    neighborhood: "West Edmonton",
    tags: ["thai", "curry", "pad-thai"],
    amenities: ["Dine-In", "Takeout", "Delivery"],
    rating: 4.4,
    review_count: 130,
    hours: RESTAURANT_HOURS,
    priceRange: "$$",
  },
  {
    name: "Pho Boat Vietnamese",
    slug: "pho-boat-vietnamese",
    category: "restaurants",
    subcategory: "vietnamese",
    description: "Classic Vietnamese pho, banh mi, and vermicelli bowls. Broth simmered daily, generous portions, alcohol-free family restaurant.",
    address: "Edmonton",
    neighborhood: "Central Edmonton",
    tags: ["vietnamese", "pho", "banh-mi"],
    amenities: ["Dine-In", "Takeout", "Family Friendly"],
    rating: 4.5,
    review_count: 175,
    hours: RESTAURANT_HOURS,
    priceRange: "$",
  },
  {
    name: "Namaste Diner",
    slug: "namaste-diner",
    category: "restaurants",
    subcategory: "indian",
    description: "Northern Indian classics in Edmonton — butter chicken, tandoori, biryani, samosas. Halal meat, no alcohol, family-friendly.",
    address: "Edmonton",
    neighborhood: "South Edmonton",
    tags: ["indian", "halal", "tandoori", "biryani"],
    amenities: ["Halal", "Dine-In", "Takeout", "Delivery", "Family Friendly"],
    rating: 4.6,
    review_count: 240,
    hours: RESTAURANT_HOURS,
    priceRange: "$$",
  },
  {
    name: "Zaatar w Zeit Mediterranean",
    slug: "zaatar-w-zeit",
    category: "restaurants",
    subcategory: "mediterranean",
    description: "Mediterranean and Levantine kitchen serving manakish, mezze, grilled meats, and fresh salads. Halal, no alcohol, family-friendly.",
    address: "Edmonton",
    neighborhood: "West Edmonton",
    tags: ["mediterranean", "lebanese", "halal", "manakish"],
    amenities: ["Halal", "Dine-In", "Takeout", "Family Friendly"],
    rating: 4.5,
    review_count: 165,
    hours: RESTAURANT_HOURS,
    priceRange: "$$",
  },
  {
    name: "Langano Skies Ethiopian",
    slug: "langano-skies",
    category: "restaurants",
    subcategory: "ethiopian",
    description: "Traditional Ethiopian and Eritrean cuisine — injera, tibs, kitfo, doro wat. Communal-plate dining, vegan-friendly, alcohol-free.",
    address: "9920 82 Ave NW",
    neighborhood: "Old Strathcona",
    tags: ["ethiopian", "vegan-friendly", "communal"],
    amenities: ["Dine-In", "Takeout", "Vegan Options", "Family Friendly"],
    rating: 4.6,
    review_count: 195,
    hours: RESTAURANT_HOURS,
    priceRange: "$$",
  },
  {
    name: "Padmanadi Vegetarian",
    slug: "padmanadi-vegetarian",
    category: "restaurants",
    subcategory: "vegan",
    description: "Edmonton's beloved vegan restaurant — Southeast Asian and Indonesian-inspired plant-based dishes. Fully vegetarian, no alcohol, big portions.",
    address: "10740 101 St NW",
    neighborhood: "Downtown",
    tags: ["vegan", "vegetarian", "indonesian", "asian"],
    amenities: ["Vegan", "Vegetarian", "Dine-In", "Takeout"],
    rating: 4.5,
    review_count: 280,
    hours: RESTAURANT_HOURS,
    priceRange: "$$",
  },

  // ─── BAKERIES ────────────────────────────────────────
  {
    name: "Prairie Sourdough Co",
    slug: "prairie-sourdough-co",
    category: "bakeries",
    subcategory: "sourdough",
    description: "Wild-fermented sourdough baked daily in Edmonton — country loaves, seeded rye, focaccia. No preservatives, small batches, sell out by 2pm.",
    address: "Edmonton",
    neighborhood: "124 Street",
    tags: ["sourdough", "bread", "artisan"],
    amenities: ["Takeout", "Family Friendly"],
    rating: 4.7,
    review_count: 90,
    hours: CLOSED_SUNDAY_HOURS,
    priceRange: "$$",
  },
  {
    name: "Sweet Lollapalooza Custom Cakes",
    slug: "sweet-lollapalooza",
    category: "bakeries",
    subcategory: "custom-cakes",
    description: "Custom celebration cakes, cupcakes, and dessert tables for weddings, birthdays, and corporate events. Halal, egg-free, and gluten-free options available.",
    address: "Edmonton",
    neighborhood: "South Edmonton",
    tags: ["custom-cakes", "wedding-cakes", "cupcakes"],
    amenities: ["Custom Orders", "Delivery", "Halal Options", "Gluten-Free Options"],
    rating: 4.8,
    review_count: 120,
    hours: CLOSED_SUNDAY_HOURS,
    priceRange: "$$$",
  },

  // ─── GYMS & FITNESS ────────────────────────────────
  {
    name: "The Yoga Loft Edmonton",
    slug: "yoga-loft-edmonton",
    category: "gyms-fitness",
    subcategory: "yoga",
    description: "Vinyasa, hot yoga, restorative, and yin classes in downtown Edmonton. Drop-in friendly, community-focused studio with props included.",
    address: "10345 106 St NW",
    neighborhood: "Downtown",
    tags: ["yoga", "hot-yoga", "vinyasa"],
    amenities: ["Drop-Ins", "Beginner Friendly", "Props Provided"],
    rating: 4.7,
    review_count: 145,
    hours: STANDARD_HOURS,
    priceRange: "$$",
  },
  {
    name: "CrossFit Terminus",
    slug: "crossfit-terminus",
    category: "gyms-fitness",
    subcategory: "crossfit",
    description: "Coached CrossFit workouts, Olympic lifting, and functional fitness in Edmonton. Small classes, all levels welcome, community-driven.",
    address: "Edmonton",
    neighborhood: "West Edmonton",
    tags: ["crossfit", "coached", "functional-fitness"],
    amenities: ["Coached Classes", "Beginner Friendly", "Community"],
    rating: 4.8,
    review_count: 110,
    hours: STANDARD_HOURS,
    priceRange: "$$$",
  },
  {
    name: "Panther Gym Boxing",
    slug: "panther-gym-boxing",
    category: "gyms-fitness",
    subcategory: "boxing",
    description: "Boxing and kickboxing gym in Edmonton — coached classes, sparring, heavy bag work. Beginner and competitor tracks available.",
    address: "Edmonton",
    neighborhood: "North Edmonton",
    tags: ["boxing", "kickboxing", "combat-sports"],
    amenities: ["Coached Classes", "Beginner Friendly", "Sparring"],
    rating: 4.6,
    review_count: 95,
    hours: STANDARD_HOURS,
    priceRange: "$$",
  },

  // ─── HAIR SALONS ─────────────────────────────────
  {
    name: "Colour Bar Edmonton",
    slug: "colour-bar-edmonton",
    category: "hair-salons",
    subcategory: "colour",
    description: "Specialist colour and balayage salon — highlights, ombre, tone corrections, and vivid colour. Book with senior stylists 1-2 weeks ahead.",
    address: "Edmonton",
    neighborhood: "124 Street",
    tags: ["colour", "balayage", "highlights"],
    amenities: ["Consultations", "Colour Specialist"],
    rating: 4.8,
    review_count: 175,
    hours: CLOSED_SUNDAY_HOURS,
    priceRange: "$$$",
  },

  // ─── NAIL SALONS ────────────────────────────────
  {
    name: "Polished Nail Art Studio",
    slug: "polished-nail-art-studio",
    category: "nail-salons",
    subcategory: "nail-art",
    description: "Custom nail art, gel, acrylic, dip powder. Hand-painted designs, French tips, seasonal art. Sanitized tools, clean studio.",
    address: "Edmonton",
    neighborhood: "South Edmonton",
    tags: ["nail-art", "gel", "acrylic", "dip"],
    amenities: ["Nail Art", "Gel", "Acrylic", "Dip Powder"],
    rating: 4.7,
    review_count: 165,
    hours: STANDARD_HOURS,
    priceRange: "$$",
  },

  // ─── MEDICAL ────────────────────────────────────
  {
    name: "Century Dental Edmonton",
    slug: "century-dental-edmonton",
    category: "medical",
    subcategory: "dentists",
    description: "Full-service family dental practice in Edmonton — cleanings, fillings, crowns, invisalign, whitening. Direct-billing to most benefits providers.",
    address: "Edmonton",
    neighborhood: "West Edmonton",
    tags: ["dentist", "dental", "family-dentistry"],
    amenities: ["Direct Billing", "New Patients Welcome", "Emergency Appointments"],
    rating: 4.7,
    review_count: 260,
    hours: STANDARD_HOURS,
    priceRange: "$$",
  },
  {
    name: "Vertex Physiotherapy",
    slug: "vertex-physiotherapy",
    category: "medical",
    subcategory: "physiotherapy",
    description: "Registered physiotherapists specializing in sports injuries, post-surgical rehab, and chronic pain. Direct-billing to Alberta Blue Cross and most insurers.",
    address: "Edmonton",
    neighborhood: "South Edmonton",
    tags: ["physiotherapy", "sports-injury", "rehab"],
    amenities: ["Direct Billing", "Sports Injury", "New Patients Welcome"],
    rating: 4.8,
    review_count: 180,
    hours: STANDARD_HOURS,
    priceRange: "$$",
  },

  // ─── PHOTOGRAPHERS ──────────────────────────────
  {
    name: "Whitewood Photography",
    slug: "whitewood-photography",
    category: "photographers",
    subcategory: "wedding",
    description: "Edmonton wedding and engagement photography — documentary-style, natural light, edited galleries within 4 weeks. Books 6-12 months out for peak season.",
    address: "Edmonton",
    neighborhood: "Edmonton (city-wide)",
    tags: ["wedding-photography", "engagement", "documentary"],
    amenities: ["Wedding", "Engagement", "Consultations"],
    rating: 4.9,
    review_count: 85,
    hours: STANDARD_HOURS,
    priceRange: "$$$",
  },

  // ─── AUTO REPAIR ────────────────────────────────
  {
    name: "Kal Tire South Edmonton",
    slug: "kal-tire-south-edmonton",
    category: "auto-repair",
    subcategory: "tires",
    description: "Full-service tire shop — winter tires, summer tires, all-season, wheel alignment, tire storage. Multiple locations across Edmonton.",
    address: "Edmonton",
    neighborhood: "South Edmonton",
    tags: ["tires", "winter-tires", "alignment"],
    amenities: ["Free Estimates", "Tire Storage", "Alignment", "Same-Day Service"],
    rating: 4.5,
    review_count: 320,
    hours: STANDARD_HOURS,
    priceRange: "$$",
  },
  {
    name: "Mr. Lube Edmonton",
    slug: "mr-lube-edmonton",
    category: "auto-repair",
    subcategory: "oil-change",
    description: "Drive-through oil change service — synthetic and conventional oil, fluid top-ups, tire pressure, wiper blades. No appointment needed.",
    address: "Edmonton",
    neighborhood: "Edmonton (multiple locations)",
    tags: ["oil-change", "quick-service", "no-appointment"],
    amenities: ["Walk-Ins", "Quick Service", "Drive-Through"],
    rating: 4.4,
    review_count: 280,
    hours: STANDARD_HOURS,
    priceRange: "$",
  },

  // ─── GROCERY & MARKETS ──────────────────────────
  {
    name: "Old Strathcona Farmers Market",
    slug: "old-strathcona-farmers-market",
    category: "grocery-markets",
    subcategory: "farmers-markets",
    description: "Year-round indoor farmers market featuring 130+ local vendors. Fresh produce, meats, cheese, baked goods, prepared food. Saturdays 8am-3pm.",
    address: "10310 83 Ave NW",
    neighborhood: "Old Strathcona",
    tags: ["farmers-market", "local-produce", "artisan"],
    amenities: ["Family Friendly", "Local Vendors", "Weekly Market"],
    rating: 4.8,
    review_count: 620,
    hours: {
      monday: "Closed",
      tuesday: "Closed",
      wednesday: "Closed",
      thursday: "Closed",
      friday: "Closed",
      saturday: "8:00 AM - 3:00 PM",
      sunday: "Closed",
    },
    priceRange: "$$",
  },
  {
    name: "T&T Supermarket Edmonton",
    slug: "tt-supermarket-edmonton",
    category: "grocery-markets",
    subcategory: "east-asian",
    description: "Large East Asian grocery — fresh seafood, Asian produce, Chinese/Japanese/Korean snacks, hot food deli, bakery. Best selection of Asian pantry staples in Edmonton.",
    address: "8882 170 St NW",
    neighborhood: "West Edmonton",
    tags: ["chinese", "japanese", "korean", "asian", "seafood"],
    amenities: ["Fresh Seafood", "Asian Produce", "Deli", "Bakery"],
    rating: 4.5,
    review_count: 890,
    hours: STANDARD_HOURS,
    priceRange: "$$",
  },

  // ─── CLEANING SERVICES ──────────────────────────
  {
    name: "Sparkle Fresh Home Cleaning",
    slug: "sparkle-fresh-home-cleaning",
    category: "cleaning-services",
    subcategory: "house-cleaning",
    description: "Weekly, bi-weekly, and one-time home cleaning across Edmonton. Insured, bonded, and eco-friendly products. Fixed pricing, no upsells.",
    address: "Edmonton",
    neighborhood: "Edmonton (city-wide)",
    tags: ["house-cleaning", "residential", "eco-friendly"],
    amenities: ["Weekly Service", "One-Time Cleans", "Move-Out", "Eco Products"],
    rating: 4.7,
    review_count: 130,
    hours: STANDARD_HOURS,
    priceRange: "$$",
  },
  {
    name: "Alberta Carpet Cleaning",
    slug: "alberta-carpet-cleaning",
    category: "cleaning-services",
    subcategory: "carpet",
    description: "Deep steam-extraction carpet cleaning, upholstery, and rug cleaning across Edmonton. Same-day dry, pet stain and odour removal specialists.",
    address: "Edmonton",
    neighborhood: "Edmonton (city-wide)",
    tags: ["carpet-cleaning", "upholstery", "pet-stains"],
    amenities: ["Same-Day Dry", "Pet Stains", "Steam Extraction"],
    rating: 4.6,
    review_count: 210,
    hours: STANDARD_HOURS,
    priceRange: "$$",
  },

  // ─── PROFESSIONAL SERVICES ──────────────────────
  {
    name: "Edmonton Notary Services",
    slug: "edmonton-notary-services",
    category: "professional-services",
    subcategory: "notaries",
    description: "Commissioner for Oaths and Notary Public — document commissioning, statutory declarations, affidavits, travel consent letters. Walk-ins welcome.",
    address: "Edmonton",
    neighborhood: "Downtown",
    tags: ["notary", "commissioner-oaths", "documents"],
    amenities: ["Walk-Ins", "Same-Day Service"],
    rating: 4.8,
    review_count: 145,
    hours: CLOSED_SUNDAY_HOURS,
    priceRange: "$",
  },
];

function toMd(b) {
  const hoursStr = Object.entries(b.hours).map(([d, h]) => `  ${d}: "${h}"`).join("\n");
  const amenitiesStr = b.amenities.map((a) => `  - "${a}"`).join("\n");
  const tagsStr = "[" + b.tags.map((t) => `"${t}"`).join(", ") + "]";
  const isFood = b.category === "restaurants" || b.category === "cafes-coffee-shops" || b.category === "bakeries";
  const deliveryDefaults = isFood ? "" : "";
  return `---
name: "${b.name}"
slug: "${b.slug}"
category: "${b.category}"
subcategory: "${b.subcategory}"
tier: "featured"
description: "${b.description}"
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
date_listed: "2026-08-18"${deliveryDefaults}
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
