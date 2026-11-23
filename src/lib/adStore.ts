import { edmontonOffset } from "./openNow";

/**
 * Sponsor view and click counts live in the wheretoyeg-ad-stats Vercel Blob store (private).
 * One tiny file per event batch; the counts are in the file name, so the stats endpoint
 * only lists files and never downloads them:
 *   ad/<YYYY-MM-DD Edmonton>/<view|click>/<sponsor>_<placement>~<sponsor>_<placement>/e-<random>.txt
 * (no dots before the file name: Blob puts its random suffix before the first dot)
 */
export const AD_PREFIX = "ad/";

export function edmontonDate(now = new Date()): string {
  return new Date(now.getTime() + edmontonOffset(now) * 60_000).toISOString().slice(0, 10);
}
