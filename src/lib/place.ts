const OUTSIDE_EDMONTON = new Set([
  "Spruce Grove",
  "Beaumont",
  "St. Albert",
  "Sherwood Park",
  "Leduc",
  "Fort Saskatchewan",
  "Stony Plain",
  "Acheson",
  "Devon",
  "Morinville",
  "Nisku",
]);

// Other provinces, for the few listings outside Alberta that ship or deliver
// to Edmonton (Moe 2026-11-22). Their place name is shown as is, never as Edmonton.
const OTHER_PROVINCE = /,\s*(BC|SK|MB|ON|QC|NS|NB|NL|PE|YT|NT|NU)\b/;

/** True for a place in another province, like "Surrey, BC". */
export function isOutOfProvince(place?: string): boolean {
  return OTHER_PROVINCE.test(place ?? "");
}

/** URL slug for a neighborhood or town. Drops periods so "St. Albert" becomes "st-albert". */
export function areaSlug(name: string): string {
  return name.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-");
}

/** True for the towns around Edmonton (Sherwood Park, St. Albert, Leduc...). */
export function isOutsideEdmonton(neighborhood?: string): boolean {
  return OUTSIDE_EDMONTON.has((neighborhood ?? "").trim());
}

/**
 * Short place name for titles and headings, the way people search it:
 * "Sherwood Park", "Downtown Edmonton", "Mill Woods, Edmonton", "West Edmonton".
 */
export function areaTitle(neighborhood: string): string {
  const n = neighborhood.trim();
  if (OUTSIDE_EDMONTON.has(n) || /edmonton/i.test(n) || isOutOfProvince(n)) return n;
  if (n === "Downtown") return "Downtown Edmonton";
  return `${n}, Edmonton`;
}

/** Human place name for titles/copy: avoids "Edmonton, Edmonton" and mislabelling nearby towns as Edmonton. */
export function placeLabel(neighborhood?: string): string {
  const n = (neighborhood ?? "").trim();
  if (!n || n === "Edmonton" || n.startsWith("Edmonton (") || /multiple/i.test(n)) return "Edmonton";
  if (/edmonton/i.test(n) || isOutOfProvince(n)) return n;
  if (OUTSIDE_EDMONTON.has(n)) return `${n}, AB`;
  return `${n}, Edmonton`;
}

/** Locality and postal code parsed from a free-form Alberta address. */
export function parseAddress(address?: string): { locality: string; region: string; postalCode?: string } {
  const a = address ?? "";
  const other = a.match(/,\s*([^,]+?),\s*(BC|SK|MB|ON|QC|NS|NB|NL|PE|YT|NT|NU)\b/);
  const locality = other?.[1]?.trim() || a.match(/,\s*([^,]+?),\s*(?:AB|Alberta)\b/i)?.[1]?.trim() || "Edmonton";
  const region = other?.[2] ?? "AB";
  const postalCode = a.match(/\b([A-Z]\d[A-Z])\s?(\d[A-Z]\d)\b/i);
  return {
    locality,
    region,
    ...(postalCode ? { postalCode: `${postalCode[1]} ${postalCode[2]}`.toUpperCase() } : {}),
  };
}
