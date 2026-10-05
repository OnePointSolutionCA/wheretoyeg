/** Listing text from Google or owners shown without em or en dashes (site copy rule). */
export function plainDashes(s: string): string {
  return s.replace(/[ \t]+[—–][ \t]+/g, ", ").replace(/[—–]/g, ", ").replace(/,\s*,/g, ",");
}

/** Trim to max chars on a word boundary, adding an ellipsis when cut. */
export function clip(s: string, max: number): string {
  const clean = s.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:—-]+$/, "")}…`;
}
