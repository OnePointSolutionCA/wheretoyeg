/**
 * Turns Google Places `regularOpeningHours.periods` into the listing `hours` block
 * (monday…sunday). Keeps every shift in a day ("11:00 AM–2:00 PM, 5:00 PM–9:00 PM"),
 * marks 24-hour days, and writes shifts that end after midnight on the day they start.
 */
const GOOGLE_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function fmt(hour = 0, minute = 0) {
  const ap = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${ap}`;
}

export function googleHours(regularOpeningHours) {
  const periods = regularOpeningHours?.periods;
  if (!periods?.length) return null;
  if (periods.length === 1 && !periods[0].close) return Object.fromEntries(WEEK.map((d) => [d, "Open 24 hours"]));

  const shifts = Object.fromEntries(WEEK.map((d) => [d, []]));
  for (const { open, close } of periods) {
    if (open?.day == null) continue;
    const o = { h: open.hour ?? 0, m: open.minute ?? 0 };
    const c = close ? { h: close.hour ?? 0, m: close.minute ?? 0, day: close.day } : null;
    const allDay = c && o.h === 0 && o.m === 0 && c.h === 0 && c.m === 0 && c.day === (open.day + 1) % 7;
    shifts[GOOGLE_DAYS[open.day]].push({
      start: o.h * 60 + o.m,
      text: allDay ? "Open 24 hours" : `${fmt(o.h, o.m)}–${c ? fmt(c.h, c.m) : "11:59 PM"}`,
    });
  }
  return Object.fromEntries(
    WEEK.map((d) => [d, shifts[d].length ? shifts[d].sort((a, b) => a.start - b.start).map((s) => s.text).join(", ") : "Closed"]),
  );
}
