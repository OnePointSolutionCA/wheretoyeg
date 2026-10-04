/**
 * Keeps Google Places API usage inside Google's free monthly caps.
 *
 * Google dropped the $200 monthly credit in March 2025. Each SKU now has its own
 * free allowance per billing month (Pacific time), then bills per call:
 *   search: Text Search Enterprise + Atmosphere (reviews / servesBeer fields) · 1,000 free, then $40 per 1,000
 *   hours:  Text Search Enterprise (opening hours only, no reviews)          · 1,000 free, then $35 per 1,000
 *   photo:  Place Details Photos                                             · 1,000 free, then $7 per 1,000
 *
 * Every script that calls Places records its calls in scripts/places-usage.json
 * (committed, so the GitHub Action and local runs share one count). On top of the
 * monthly caps, the Cloud console caps each request type at 32 a day.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "places-usage.json");
export const FREE_CAP = { search: 1000, hours: 1000, photo: 1000 };
export const PRICE = { search: 0.04, hours: 0.035, photo: 0.007 };
const HEADROOM = 50; // left for manual tests

function pacificParts(d = new Date()) {
  const [y, m, day] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d).split("-").map(Number);
  return { y, m, day };
}

export function billingMonth(d = new Date()) {
  const { y, m } = pacificParts(d);
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function daysLeftInMonth(d = new Date()) {
  const { y, m, day } = pacificParts(d);
  return new Date(Date.UTC(y, m, 0)).getUTCDate() - day + 1;
}

export function loadUsage() {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return {}; }
}

export function saveUsage(u) {
  fs.writeFileSync(FILE, JSON.stringify(u, null, 2) + "\n");
}

export function used(kind, u = loadUsage()) {
  return u[billingMonth()]?.[kind] ?? 0;
}

export function addUsage(kind, n = 1) {
  const u = loadUsage();
  const month = billingMonth();
  u[month] = { ...u[month], [kind]: (u[month]?.[kind] ?? 0) + n };
  saveUsage(u);
}

/** Calls of this kind still free this month (after headroom). */
export function freeLeft(kind) {
  return Math.max(0, FREE_CAP[kind] - HEADROOM - used(kind));
}

/** Rough charge for `n` more calls this month, counting what's already used. */
export function costOf(kind, n) {
  const over = Math.max(0, used(kind) + n - FREE_CAP[kind]) - Math.max(0, used(kind) - FREE_CAP[kind]);
  return over * PRICE[kind];
}
