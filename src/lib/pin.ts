/** Moves pinned listings to the front and keeps everything else in its current order. */
export function pinnedFirst<T extends { pinned?: boolean }>(list: T[]): T[] {
  return [...list.filter((b) => b.pinned), ...list.filter((b) => !b.pinned)];
}
