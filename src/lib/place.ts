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

/** Human place name for titles/copy: avoids "Edmonton, Edmonton" and mislabelling nearby towns as Edmonton. */
export function placeLabel(neighborhood?: string): string {
  const n = (neighborhood ?? "").trim();
  if (!n || n === "Edmonton" || n.startsWith("Edmonton (") || /multiple/i.test(n)) return "Edmonton";
  if (/edmonton/i.test(n)) return n;
  if (OUTSIDE_EDMONTON.has(n)) return `${n}, AB`;
  return `${n}, Edmonton`;
}

/** Locality and postal code parsed from a free-form Alberta address. */
export function parseAddress(address?: string): { locality: string; postalCode?: string } {
  const a = address ?? "";
  const locality = a.match(/,\s*([^,]+?),\s*(?:AB|Alberta)\b/i)?.[1]?.trim() || "Edmonton";
  const postalCode = a.match(/\b([A-Z]\d[A-Z])\s?(\d[A-Z]\d)\b/i);
  return {
    locality,
    ...(postalCode ? { postalCode: `${postalCode[1]} ${postalCode[2]}`.toUpperCase() } : {}),
  };
}
