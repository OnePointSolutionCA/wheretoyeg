import { edmontonOffset } from "./openNow";

/** Day number that ticks over at midnight Edmonton time (MST/MDT before Nov 2026, Alberta Time after). */
export function edmontonDay(now = new Date()): number {
  return Math.floor((now.getTime() + edmontonOffset(now) * 60_000) / 86_400_000);
}

/** Deterministic shuffle: same order all day, new order each Edmonton day. `salt` keeps different sections from moving in lockstep. */
export function dailyShuffle<T>(arr: T[], salt = 0): T[] {
  const a = [...arr];
  let s = (edmontonDay() * 2654435761 + salt * 40503) >>> 0 || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
