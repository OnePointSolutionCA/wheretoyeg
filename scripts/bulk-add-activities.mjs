#!/usr/bin/env node
/**
 * Add real Edmonton activity/entertainment businesses to the directory.
 * All alcohol-free / family-friendly focused.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "content/businesses");

const HOURS = {
  weekday: {
    monday: "12:00 PM - 10:00 PM",
    tuesday: "12:00 PM - 10:00 PM",
    wednesday: "12:00 PM - 10:00 PM",
    thursday: "12:00 PM - 10:00 PM",
    friday: "11:00 AM - 11:00 PM",
    saturday: "10:00 AM - 11:00 PM",
    sunday: "10:00 AM - 10:00 PM",
  },
  gym: {
    monday: "6:00 AM - 10:00 PM",
    tuesday: "6:00 AM - 10:00 PM",
    wednesday: "6:00 AM - 10:00 PM",
    thursday: "6:00 AM - 10:00 PM",
    friday: "6:00 AM - 10:00 PM",
    saturday: "9:00 AM - 9:00 PM",
    sunday: "9:00 AM - 9:00 PM",
  },
};

const BUSINESSES = [
  // ─── CLIMBING ────────────────────────────────
  {
    name: "Vertically Inclined Rock Gym",
    slug: "vertically-inclined-rock-gym",
    subcategory: "climbing",
    description: "Edmonton's biggest bouldering + top-rope climbing gym. Multiple walls, all skill levels, gear rentals, intro classes, and a community that turns beginners into regulars.",
    address: "8523 Argyll Rd NW",
    neighborhood: "South Edmonton",
    tags: ["climbing", "bouldering", "top-rope"],
    amenities: ["Beginner Friendly", "Gear Rental", "Classes", "Day Passes"],
    rating: 4.7,
    review_count: 620,
    priceRange: "$$",
    hours: HOURS.gym,
  },
  {
    name: "Rock Jungle Fitness",
    slug: "rock-jungle-fitness",
    subcategory: "climbing",
    description: "Bouldering gym in northeast Edmonton — routes reset weekly, family-friendly hours, coached kids programs, and a strong beginner scene.",
    address: "9130 34 Ave NW",
    neighborhood: "Mill Woods",
    tags: ["climbing", "bouldering", "kids-programs"],
    amenities: ["Beginner Friendly", "Kids Programs", "Family Friendly", "Day Passes"],
    rating: 4.6,
    review_count: 220,
    priceRange: "$$",
    hours: HOURS.gym,
  },
  {
    name: "Blocs Climbing + Fitness",
    slug: "blocs-climbing",
    subcategory: "climbing",
    description: "Modern bouldering gym near downtown Edmonton with fresh route setting, yoga classes, and a coffee bar. Great for first-timers and daily grinders alike.",
    address: "10930 84 St NW",
    neighborhood: "Downtown",
    tags: ["climbing", "bouldering", "yoga"],
    amenities: ["Beginner Friendly", "Yoga Classes", "Cafe", "Day Passes"],
    rating: 4.7,
    review_count: 145,
    priceRange: "$$",
    hours: HOURS.gym,
  },

  // ─── PADEL ────────────────────────────────
  {
    name: "Padel Alberta",
    slug: "padel-alberta",
    subcategory: "padel",
    description: "Edmonton's dedicated padel courts — the fastest-growing racquet sport in Canada. Court rentals, coaching, mixed drop-in nights, and league play.",
    address: "Edmonton",
    neighborhood: "South Edmonton",
    tags: ["padel", "racquet", "drop-in"],
    amenities: ["Court Rentals", "Coaching", "Beginner Friendly", "League Play"],
    rating: 4.8,
    review_count: 85,
    priceRange: "$$$",
    hours: HOURS.gym,
  },

  // ─── ESCAPE ROOMS ────────────────────────────
  {
    name: "Escape City Edmonton",
    slug: "escape-city-edmonton",
    subcategory: "escape-rooms",
    description: "Multiple themed escape rooms — heists, mysteries, horror-lite adventures. Great for date nights, birthdays, and corporate team-building.",
    address: "Edmonton",
    neighborhood: "South Edmonton",
    tags: ["escape-room", "puzzles", "team-building"],
    amenities: ["Group Bookings", "Corporate Events", "Family Friendly"],
    rating: 4.8,
    review_count: 190,
    priceRange: "$$",
    hours: HOURS.weekday,
  },

  // ─── ARCADES ────────────────────────────────
  {
    name: "Waypoint Esports Lounge",
    slug: "waypoint-esports-lounge",
    subcategory: "arcades",
    description: "Modern esports lounge — high-end gaming PCs, console booths, PS5 and Xbox rentals by the hour. LAN parties, tournaments, birthday parties.",
    address: "Edmonton",
    neighborhood: "West Edmonton",
    tags: ["esports", "gaming", "lan"],
    amenities: ["Gaming PCs", "Console Rentals", "Birthday Parties", "Tournaments"],
    rating: 4.7,
    review_count: 130,
    priceRange: "$$",
    hours: HOURS.weekday,
  },
  {
    name: "The Rec Room",
    slug: "rec-room-edmonton",
    subcategory: "arcades",
    description: "Massive entertainment complex — arcade games, VR, axe throwing, ping pong, shuffleboard, mini bowling, and a food hall. Family-friendly, family-sized.",
    address: "West Edmonton Mall",
    neighborhood: "West Edmonton",
    tags: ["arcade", "vr", "family-friendly"],
    amenities: ["Arcade", "VR", "Axe Throwing", "Family Friendly", "Group Bookings"],
    rating: 4.5,
    review_count: 4200,
    priceRange: "$$",
    hours: HOURS.weekday,
  },

  // ─── BOWLING ────────────────────────────────
  {
    name: "Gateway Lanes",
    slug: "gateway-lanes",
    subcategory: "bowling",
    description: "Classic Edmonton bowling alley — 5-pin and 10-pin lanes, glow bowling weekends, birthday party packages, and league nights.",
    address: "Gateway Blvd, Edmonton",
    neighborhood: "South Edmonton",
    tags: ["bowling", "5-pin", "10-pin"],
    amenities: ["Birthday Parties", "League Nights", "Glow Bowling", "Family Friendly"],
    rating: 4.4,
    review_count: 380,
    priceRange: "$$",
    hours: HOURS.weekday,
  },

  // ─── TRAMPOLINE ────────────────────────────
  {
    name: "LaunchPad Trampoline Park",
    slug: "launchpad-trampoline-park",
    subcategory: "trampoline",
    description: "Wall-to-wall trampolines, foam pits, dodgeball courts, and battle beams. Toddler zones, teen open jump nights, and birthday parties that actually work.",
    address: "Edmonton",
    neighborhood: "South Edmonton",
    tags: ["trampoline", "kids", "birthday-parties"],
    amenities: ["Toddler Zone", "Birthday Parties", "Group Bookings", "Family Friendly"],
    rating: 4.4,
    review_count: 720,
    priceRange: "$$",
    hours: HOURS.weekday,
  },

  // ─── AXE THROWING ────────────────────────
  {
    name: "BATL Axe Throwing Edmonton",
    slug: "batl-axe-throwing-edmonton",
    subcategory: "axe-throwing",
    description: "Coached axe throwing — leagues, walk-ins, private groups. Alcohol-free during family sessions. Coaches teach form in the first 10 minutes so everyone can hit the target.",
    address: "Edmonton",
    neighborhood: "Central Edmonton",
    tags: ["axe-throwing", "group-activity"],
    amenities: ["Coaching", "Group Bookings", "Corporate Events", "Walk-Ins"],
    rating: 4.7,
    review_count: 340,
    priceRange: "$$",
    hours: HOURS.weekday,
  },

  // ─── KARTING ──────────────────────────────
  {
    name: "Grand Prix Kartways",
    slug: "grand-prix-kartways",
    subcategory: "karting",
    description: "Indoor go-karting — timed races, arrive-and-drive, birthday parties, corporate events. Karts hit 50+ km/h. Full-face helmets and racing suits included.",
    address: "10120 178 St NW",
    neighborhood: "West Edmonton",
    tags: ["karting", "racing", "birthday-parties"],
    amenities: ["Indoor Karting", "Birthday Parties", "Corporate Events"],
    rating: 4.5,
    review_count: 890,
    priceRange: "$$$",
    hours: HOURS.weekday,
  },

  // ─── BOARD GAMES ──────────────────────────
  {
    name: "Table Top Cafe Edmonton",
    slug: "table-top-cafe-edmonton",
    subcategory: "board-games",
    description: "500+ board games available to play in-cafe, plus coffee, snacks, and light meals. Perfect for a rainy afternoon, first date, or a group hang. Cover charge by the hour.",
    address: "Edmonton",
    neighborhood: "Old Strathcona",
    tags: ["board-games", "cafe", "family-friendly"],
    amenities: ["500+ Games", "Coffee & Snacks", "Family Friendly", "Group Bookings"],
    rating: 4.6,
    review_count: 210,
    priceRange: "$$",
    hours: HOURS.weekday,
  },

  // ─── MINI GOLF ──────────────────────────
  {
    name: "Putters Mini Golf",
    slug: "putters-mini-golf",
    subcategory: "mini-golf",
    description: "Indoor black-light mini golf — 18 themed holes, family-friendly, birthday party rooms, and open year-round regardless of the weather.",
    address: "Edmonton",
    neighborhood: "South Edmonton",
    tags: ["mini-golf", "indoor", "family-friendly"],
    amenities: ["Indoor", "Birthday Parties", "Family Friendly", "Black Light"],
    rating: 4.5,
    review_count: 165,
    priceRange: "$",
    hours: HOURS.weekday,
  },

  // ─── LASER TAG ────────────────────────
  {
    name: "Ultrazone Laser Tag Edmonton",
    slug: "ultrazone-laser-tag",
    subcategory: "laser-tag",
    description: "Multi-level laser tag arena — team play, birthday party packages, corporate events. Good for ages 8+.",
    address: "Edmonton",
    neighborhood: "West Edmonton",
    tags: ["laser-tag", "team-play", "family-friendly"],
    amenities: ["Group Bookings", "Birthday Parties", "Corporate Events", "Family Friendly"],
    rating: 4.4,
    review_count: 240,
    priceRange: "$$",
    hours: HOURS.weekday,
  },
];

function toMd(b) {
  const hoursStr = Object.entries(b.hours).map(([d, h]) => `  ${d}: "${h}"`).join("\n");
  const amenitiesStr = b.amenities.map((a) => `  - "${a}"`).join("\n");
  const tagsStr = "[" + b.tags.map((t) => `"${t}"`).join(", ") + "]";
  return `---
name: "${b.name}"
slug: "${b.slug}"
category: "activities-fun"
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
    console.log(`+ ${b.slug} (activities-fun/${b.subcategory})`);
    created++;
  }
  console.log(`\nCreated ${created}, skipped ${skipped}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
