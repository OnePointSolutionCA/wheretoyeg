import type { Hours } from "./types";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

function parseTime(s: string): number | null {
  // "9:00 AM" -> minutes since midnight
  const m = s.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let hr = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3]?.toUpperCase();
  if (ap === "PM" && hr < 12) hr += 12;
  if (ap === "AM" && hr === 12) hr = 0;
  return hr * 60 + min;
}

function parseRange(range: string): [number, number] | null {
  if (!range || /closed/i.test(range)) return null;
  const parts = range.split(/[-–]/);
  if (parts.length !== 2) return null;
  const a = parseTime(parts[0]);
  const b = parseTime(parts[1]);
  if (a == null || b == null) return null;
  return [a, b];
}

export function edmontonNow(): Date {
  // Use system time — server may not be MT, so parse from formatted string
  const parts = new Date().toLocaleString("en-US", {
    timeZone: "America/Edmonton",
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Edmonton" }));
}

export type OpenStatus = {
  isOpen: boolean;
  label: string;
};

export function openStatus(hours: Hours, now: Date = edmontonNow()): OpenStatus {
  if (!hours) return { isOpen: false, label: "Hours unavailable" };
  const dayIdx = now.getDay();
  const todayKey = DAYS[dayIdx] as keyof Hours;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = hours[todayKey];
  const range = parseRange(today);
  if (range) {
    const [open, close] = range;
    if (minutes >= open && minutes < close) {
      return { isOpen: true, label: `Open · Closes ${fmt(close)}` };
    }
    if (minutes < open) return { isOpen: false, label: `Closed · Opens ${fmt(open)}` };
  }
  // find next open day
  for (let i = 1; i <= 7; i++) {
    const next = DAYS[(dayIdx + i) % 7] as keyof Hours;
    const r = parseRange(hours[next]);
    if (r) {
      const dayLabel = i === 1 ? "Tomorrow" : capitalise(next);
      return { isOpen: false, label: `Closed · Opens ${dayLabel} ${fmt(r[0])}` };
    }
  }
  return { isOpen: false, label: "Closed" };
}

function fmt(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}${m ? ":" + String(m).padStart(2, "0") : ""} ${ap}`;
}
function capitalise(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}
