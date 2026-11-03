import type { Hours, Season } from "./types";

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

// Alberta stopped changing clocks on 1 Nov 2026 and stays on UTC-6 ("Alberta Time") all year.
// Phones and browsers with older time zone data still put America/Edmonton on UTC-7 in winter,
// which made every open/closed check an hour early, so the offset is worked out here instead.
const ALBERTA_TIME_FROM = Date.UTC(2026, 10, 1, 8); // 2:00 AM MDT, Sunday 1 Nov 2026

/** Minutes to add to UTC to get Edmonton wall-clock time at that instant (-360 or -420). */
export function edmontonOffset(at: Date = new Date()): number {
  const t = at.getTime();
  if (t >= ALBERTA_TIME_FROM) return -360;
  // Before the switch: MDT from 2 AM on the second Sunday of March to 2 AM on the first Sunday of November.
  const y = at.getUTCFullYear();
  const mdtStart = nthSunday(y, 2, 2) + 9 * 3_600_000;
  const mdtEnd = nthSunday(y, 10, 1) + 8 * 3_600_000;
  return t >= mdtStart && t < mdtEnd ? -360 : -420;
}

function nthSunday(year: number, month: number, n: number): number {
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return Date.UTC(year, month, 1 + ((7 - first) % 7) + 7 * (n - 1));
}

/** Edmonton day of the week (0 = Sunday) and minutes after midnight at that instant. */
export function edmontonTime(at: Date = new Date()): { day: number; minutes: number } {
  const local = new Date(at.getTime() + edmontonOffset(at) * 60_000);
  return { day: local.getUTCDay(), minutes: local.getUTCHours() * 60 + local.getUTCMinutes() };
}

/** Edmonton calendar date ("YYYY-MM-DD") at that instant, moved by whole days. */
export function edmontonDate(at: Date = new Date(), days = 0): string {
  return new Date(at.getTime() + edmontonOffset(at) * 60_000 + days * 86_400_000).toISOString().slice(0, 10);
}

/** Whether a seasonal place is open for the season on that Edmonton date. Dates not confirmed yet count as closed. */
export function inSeason(season: Season | undefined, date: string = edmontonDate()): boolean {
  if (!season) return true;
  return !!season.from && !!season.to && date >= season.from && date <= season.to;
}

export type OpenStatus = {
  isOpen: boolean;
  label: string;
};

export function openStatus(hours: Hours | undefined, at: Date = new Date(), season?: Season): OpenStatus {
  const week = weekIntervals(hours);
  if (week.every((d) => d == null)) return { isOpen: false, label: "Hours unavailable" };
  const { day, minutes } = edmontonTime(at);
  // Hours for the day `i` days from today: the weekday's, or for a seasonal place its own date's, or closed out of season.
  const raw = (i: number) => (season ? season.dates?.[edmontonDate(at, i)] : undefined) ?? hours?.[DAYS[(day + i + 7) % 7]];
  const on = (i: number): Interval[] | null => {
    if (!season) return week[(day + i + 7) % 7];
    const date = edmontonDate(at, i);
    if (!inSeason(season, date)) return [];
    return season.dates?.[date] ? parseDayHours(season.dates[date]) : week[(day + i + 7) % 7];
  };
  const today = on(0);
  const tomorrow = on(1) ?? [];

  // Still inside a shift that started yesterday and runs past midnight.
  for (const [, close] of on(-1) ?? []) {
    if (close > 1440 && minutes < close - 1440) return { isOpen: true, label: `Open · Closes ${fmt(close)}` };
  }
  // Today's hours can't be read ("By appointment", or held back as a likely typo): never guess.
  if (today == null) return { isOpen: false, label: raw(0) ? displayDayHours(raw(0)) : "Hours not listed today" };
  for (const [open, close] of today) {
    if (minutes >= open && minutes < close) {
      const allDay = open === 0 && close === 1440 && tomorrow[0]?.[0] === 0;
      return { isOpen: true, label: allDay ? "Open 24 hours" : `Open · Closes ${fmt(close)}` };
    }
  }
  const later = today.find(([open]) => open > minutes);
  if (later) return { isOpen: false, label: `Closed · Opens ${fmt(later[0])}` };
  for (let i = 1; i <= 7; i++) {
    const next = on(i);
    if (next?.length) {
      const dayLabel = i === 1 ? "Tomorrow" : capitalise(DAYS[(day + i) % 7]);
      return { isOpen: false, label: `Closed · Opens ${dayLabel} ${fmt(next[0][0])}` };
    }
  }
  if (season?.from && edmontonDate(at) < season.from) return { isOpen: false, label: `Closed · Season opens ${monthDay(season.from)}` };
  if (season) return { isOpen: false, label: "Closed for the season" };
  return { isOpen: false, label: "Closed" };
}

export type HoursFlag = { day: (typeof DAYS)[number]; reason: string };

/**
 * Days whose hours look like a typo on Google rather than real hours, e.g. "8:30 AM–5:00 AM"
 * or "1:00 AM–11:00 PM" when every other day opens at 11 AM. Left alone, these make a place
 * show as open in the middle of the night. scripts/hours-fixes.json holds the checked answer
 * for each day flagged here, and the refresh job holds back any new one until it is checked.
 */
export function suspiciousDays(hours?: Hours): HoursFlag[] {
  const week = weekIntervals(hours).map((d) => (d ?? []).filter(([o, c]) => !(o === 0 && c === 1440)));
  const reasons = new Map<number, string[]>();
  const flag = (i: number, why: string) => reasons.set(i, [...(reasons.get(i) ?? []), why]);
  const openDays = week.map((d, i) => (d.length ? i : -1)).filter((i) => i >= 0);

  week.forEach((d, i) => {
    for (const [o, c] of d) if (c - o > 20 * 60) flag(i, `open ${Math.round((c - o) / 60)} hours straight`);
  });

  // A shift that starts at midnight, or runs only through the night, without carrying on from the day before.
  const continues = (i: number) => week[(i + 6) % 7].some(([, c]) => c >= 1440);
  week.forEach((d, i) => {
    for (const [o, c] of d) {
      if (o === 0 && !continues(i)) flag(i, "opens at midnight");
      else if (o < 300 && c <= 720 && !continues(i)) flag(i, `open only overnight, ${fmt(o)} to ${fmt(c)}`);
    }
  });

  // Opens before 5 AM on one or two days while the rest of the week opens at 6 AM or later.
  const early = openDays.filter((i) => week[i][0][0] > 0 && week[i][0][0] < 300);
  const lateOpeners = openDays.filter((i) => week[i][0][0] >= 360);
  if (early.length && early.length <= 2 && lateOpeners.length >= 3) {
    for (const i of early) flag(i, `opens at ${fmt(week[i][0][0])} but other days open after 6 AM`);
  }

  // Closes after midnight on one or two days while the rest of the week closes by 8 PM.
  const lastClose = (i: number) => week[i][week[i].length - 1][1];
  const late = openDays.filter((i) => lastClose(i) > 1440);
  const others = openDays.filter((i) => !late.includes(i));
  if (late.length && late.length <= 2 && others.length >= 3 && others.every((i) => lastClose(i) <= 20 * 60)) {
    for (const i of late) flag(i, `closes at ${fmt(lastClose(i))} but other days close by 8 PM`);
  }

  return [...reasons].sort(([a], [b]) => a - b).map(([i, why]) => ({ day: DAYS[i], reason: why.join("; ") }));
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
/** "2026-11-29" -> "Nov 29" */
export function monthDay(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${d}`;
}
function capitalise(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}
