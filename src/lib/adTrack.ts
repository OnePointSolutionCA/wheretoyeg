import type { AdPlacement, AdvertiserId } from "./advertisers";
import { ROTATION } from "./advertisers";

/**
 * Counts sponsor ad views and clicks (Moe 2026-11-23: daily report per sponsor).
 * No personal data: only sponsor, placement and the kind of event.
 * Views are batched into one request per page; clicks go out at once with sendBeacon,
 * which still delivers when the click opens the sponsor's site.
 */

type Pair = [AdvertiserId, AdPlacement];

const queue: Pair[] = [];
const seen = new Set<string>();
let timer: ReturnType<typeof setTimeout> | null = null;

function send(body: object) {
  const data = JSON.stringify(body);
  try {
    if (navigator.sendBeacon?.("/api/ad-event", new Blob([data], { type: "application/json" }))) return;
  } catch {
    /* fall through to fetch */
  }
  fetch("/api/ad-event", { method: "POST", body: data, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
}

function gtagEvent(name: string, sponsor: string, placement: string) {
  const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof g === "function") g("event", name, { sponsor, placement, non_interaction: name === "sponsor_view" });
}

function flush() {
  timer = null;
  if (!queue.length) return;
  send({ type: "view", items: queue.splice(0) });
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}

/** One view per sponsor and placement per page (client side page changes count again). */
export function trackAdView(sponsor: AdvertiserId, placement: AdPlacement) {
  if (typeof window === "undefined") return;
  const key = `${location.pathname}|${sponsor}|${placement}`;
  if (seen.has(key)) return;
  seen.add(key);
  queue.push([sponsor, placement]);
  gtagEvent("sponsor_view", sponsor, placement);
  if (!timer) timer = setTimeout(flush, 2000);
}

export function trackAdClick(sponsor: AdvertiserId, placement: AdPlacement) {
  if (typeof window === "undefined") return;
  gtagEvent("sponsor_click", sponsor, placement);
  send({ type: "click", items: [[sponsor, placement]] });
}

const RR_KEY = "wty_ad_turn";

/** Next sponsor in turn for this visitor, so each page view shows a different one. */
export function nextSponsorInTurn(): AdvertiserId {
  let n = 0;
  try {
    n = Number(localStorage.getItem(RR_KEY)) || 0;
    if (!n) n = Math.floor(Math.random() * ROTATION.length);
    localStorage.setItem(RR_KEY, String(n + 1));
  } catch {
    n = Math.floor(Math.random() * ROTATION.length);
  }
  return ROTATION[n % ROTATION.length];
}

/** Fisher Yates shuffle, used after hydration so the server and first client render match. */
export function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
