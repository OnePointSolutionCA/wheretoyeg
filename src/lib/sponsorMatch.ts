/**
 * Does a search query clearly ask for what a sponsor does?
 * Every query word (3+ letters) must match one of the sponsor's own search words,
 * as the same word, the start of it ("chiro" → "chiropractor"), or its plural
 * ("florists" → "florist"). Strict on purpose: no fuzzy matching, so a search for
 * "dentist" never puts a chiropractor on top.
 */
export function sponsorMatch(query: string, terms: string | undefined): boolean {
  if (!terms) return false;
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
  if (!words.length) return false;
  const tokens = terms.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return words.every((w) =>
    tokens.some((t) => t === w || t.startsWith(w) || (w.length >= 5 && t.length >= 4 && w.startsWith(t) && w.length - t.length <= 2)),
  );
}
