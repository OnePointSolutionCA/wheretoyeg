import type { Hours } from "./types";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

/** [open, close] in minutes after that day's midnight. Close runs past 1440 when a shift ends after midnight. */
export type Interval = [number, number];

function clean(s: string) {
  return s.replace(/[   ]/g, " ").replace(/\s+/g, " ").trim();
}

function parseTime(s: string): { mins: number; meridiem: "AM" | "PM" | null } | null {
  // "9:00 AM" -> minutes since midnight
  const m = s.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let hr = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  if (hr > 23 || min > 59) return null;
  const ap = (m[3]?.toUpperCase() ?? null) as "AM" | "PM" | null;
  if (ap === "PM" && hr < 12) hr += 12;
  if (ap === "AM" && hr === 12) hr = 0;
  return { mins: hr * 60 + min, meridiem: ap };
}

/**
 * Opening intervals for one day's hours string, e.g. "11:00 AM–2:00 PM, 5:00–9:00 PM".
 * Returns [] when closed and null when the string can't be read.
 */
export function parseDayHours(value?: string): Interval[] | null {
  if (!value) return null;
  const v = clean(value);
  if (/^closed$/i.test(v)) return [];
  if (/24\s*hours|always\s*open/i.test(v)) return [[0, 1440]];
  const out: Interval[] = [];
  for (const part of v.split(/\s*,\s*|\s+and\s+|\s*&\s*/i)) {
    const ends = part.split(/\s*[–—-]\s*|\s+to\s+/i);
    if (ends.length !== 2) return null;
    const a = parseTime(ends[0]);
    const b = parseTime(ends[1]);
    if (!a || !b) return null;
    let start = a.mins;
    let end = b.mins;
    // "5:00–9:00 PM": a bare opening time shares the closing time's AM/PM unless that lands after the close.
    if (!a.meridiem && b.meridiem) {
      const h = Math.floor(start / 60) % 12;
      const m = start % 60;
      const same = (b.meridiem === "PM" ? h + 12 : h) * 60 + m;
      start = same <= end || end === 0 ? same : (b.meridiem === "PM" ? h : h + 12) * 60 + m;
    }
    if (end === 0 || (start === 0 && end === 1439)) end = 1440; // closes at midnight, or "12:00 AM–11:59 PM"
    if (end <= start) end += 1440; // closes after midnight
    out.push([start, end]);
  }
  return out.sort((x, y) => x[0] - y[0]);
}

/** All seven days, Sunday first (matches Date.getDay()). */
export function weekIntervals(hours?: Hours): (Interval[] | null)[] {
  return DAYS.map((d) => parseDayHours(hours?.[d]));
}

/** The current wall-clock time in Edmonton, as a Date whose local fields read Edmonton time. */
export function edmontonNow(at: Date = new Date()): Date {
  return new Date(at.toLocaleString("en-US", { timeZone: "America/Edmonton" }));
}

export type OpenStatus = {
  isOpen: boolean;
  label: string;
};

export function openStatus(hours: Hours | undefined, now: Date = edmontonNow()): OpenStatus {
  const week = weekIntervals(hours);
  if (week.every((d) => d == null)) return { isOpen: false, label: "Hours unavailable" };
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = week[day] ?? [];
  const tomorrow = week[(day + 1) % 7] ?? [];

  // Still inside a shift that started yesterday and runs past midnight.
  for (const [, close] of week[(day + 6) % 7] ?? []) {
    if (close > 1440 && minutes < close - 1440) return { isOpen: true, label: `Open · Closes ${fmt(close)}` };
  }
  for (const [open, close] of today) {
    if (minutes >= open && minutes < close) {
      const allDay = open === 0 && close === 1440 && tomorrow[0]?.[0] === 0;
      return { isOpen: true, label: allDay ? "Open 24 hours" : `Open · Closes ${fmt(close)}` };
    }
  }
  const later = today.find(([open]) => open > minutes);
  if (later) return { isOpen: false, label: `Closed · Opens ${fmt(later[0])}` };
  for (let i = 1; i <= 7; i++) {
    const next = week[(day + i) % 7];
    if (next?.length) {
      const dayLabel = i === 1 ? "Tomorrow" : capitalise(DAYS[(day + i) % 7]);
      return { isOpen: false, label: `Closed · Opens ${dayLabel} ${fmt(next[0][0])}` };
    }
  }
  return { isOpen: false, label: "Closed" };
}

/** How a day's hours read on the page. */
export function displayDayHours(value?: string): string {
  if (!value) return "Not listed";
  const v = clean(value);
  // Shown to visitors as "9:00 AM to 5:00 PM" (no dashes); parsing above still reads the raw value.
  return /^12:00 AM\s*[–-]\s*11:59 PM$/i.test(v) ? "Open 24 hours" : v.replace(/\s*[–—]\s*/g, " to ");
}

function fmt(mins: number): string {
  const t = mins % 1440;
  if (t === 0) return "midnight";
  const h = Math.floor(t / 60);
  const m = t % 60;
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}${m ? ":" + String(m).padStart(2, "0") : ""} ${ap}`;
}
function capitalise(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}
