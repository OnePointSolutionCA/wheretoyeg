#!/usr/bin/env node
/**
 * Download one high-quality free stock photo per category from loremflickr.
 * Saves to public/photos/_stock/ so businesses without a website can fall
 * back to something category-appropriate.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STOCK_DIR = path.join(ROOT, "public/photos/_stock");

const STOCKS = {
  "restaurant.jpg": "restaurant,dinner,plate",
  "cafe.jpg": "coffee,cafe,latte",
  "bakery.jpg": "bakery,bread,pastry",
  "grocery.jpg": "grocery,supermarket,produce",
  "barber.jpg": "barbershop,haircut",
  "salon.jpg": "hairsalon,stylist",
  "lash.jpg": "eyelash,makeup",
  "nails.jpg": "manicure,nails",
  "spa.jpg": "spa,relax,massage",
  "clinic.jpg": "medical,clinic,doctor",
  "gym.jpg": "gym,fitness,weights",
  "auto.jpg": "carrepair,mechanic",
  "cleaning.jpg": "cleaning,housekeeping",
  "photography.jpg": "camera,photography,studio",
  "plumber.jpg": "plumber,pipes",
  "electrician.jpg": "electrician,wiring",
  "catering.jpg": "catering,buffet",
  "henna.jpg": "henna,mehndi",
  "office.jpg": "office,professional",
};

async function fetchBinary(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  const res = await fetch(url, { redirect: "follow", signal: controller.signal });
  clearTimeout(timer);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  await fs.mkdir(STOCK_DIR, { recursive: true });
  let ok = 0, fail = 0;
  for (const [file, tags] of Object.entries(STOCKS)) {
    const disk = path.join(STOCK_DIR, file);
    try {
      await fs.access(disk);
      console.log(`~ ${file} already exists`);
      continue;
    } catch {}
    try {
      // loremflickr returns a redirect to an actual Flickr photo matching the tags
      const url = `https://loremflickr.com/1200/800/${tags}`;
      const buf = await fetchBinary(url);
      if (buf.length < 3000) throw new Error("too small");
      await fs.writeFile(disk, buf);
      console.log(`✓ ${file} (${(buf.length / 1024).toFixed(1)}KB)`);
      ok++;
    } catch (e) {
      console.log(`✗ ${file}: ${e.message}`);
      fail++;
    }
  }
  console.log(`\nDone: ${ok} downloaded, ${fail} failed`);
}

main().catch((e) => { console.error(e); process.exit(1); });
