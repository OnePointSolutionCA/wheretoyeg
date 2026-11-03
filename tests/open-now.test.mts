// Open now badge and filter, checked against a fixed clock. Run with `npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { edmontonTime, openStatus, suspiciousDays } from "../src/lib/openNow.ts";

// Edmonton wall-clock time from 1 Nov 2026 on is UTC-6 all year (Alberta Time).
const at = (iso: string) => new Date(iso);

// Pizza Palace, North Town Centre, with Tuesday corrected from Google's "1:00 AM".
const pizzaPalace = {
  monday: "11:00 AM–11:00 PM",
  tuesday: "11:00 AM–11:00 PM",
  wednesday: "11:00 AM–11:00 PM",
  thursday: "11:00 AM–12:00 AM",
  friday: "11:00 AM–1:00 AM",
  saturday: "11:00 AM–1:00 AM",
  sunday: "11:00 AM–11:00 PM",
};

test("Edmonton clock: Alberta Time after 1 Nov 2026, MST/MDT before", () => {
  assert.deepEqual(edmontonTime(at("2026-11-03T07:14:00Z")), { day: 2, minutes: 74 }); // Tue 1:14 AM
  assert.deepEqual(edmontonTime(at("2026-11-01T07:59:00Z")), { day: 0, minutes: 119 }); // Sun 1:59 AM MDT
  assert.deepEqual(edmontonTime(at("2026-11-01T08:00:00Z")), { day: 0, minutes: 120 }); // 2:00 AM, no fall back
  assert.deepEqual(edmontonTime(at("2027-01-15T18:00:00Z")), { day: 5, minutes: 720 }); // winter noon is UTC-6 now
  assert.deepEqual(edmontonTime(at("2026-01-15T19:00:00Z")), { day: 4, minutes: 720 }); // MST noon
  assert.deepEqual(edmontonTime(at("2026-07-01T18:00:00Z")), { day: 3, minutes: 720 }); // MDT noon
  assert.deepEqual(edmontonTime(at("2026-03-08T09:00:00Z")), { day: 0, minutes: 180 }); // spring forward to 3 AM
});

test("Edmonton clock does not depend on the visitor's own time zone", () => {
  const before = process.env.TZ;
  const results = ["UTC", "America/Edmonton", "Pacific/Auckland", "America/Toronto"].map((tz) => {
    process.env.TZ = tz;
    return openStatus(pizzaPalace, at("2026-11-03T07:14:00Z"));
  });
  process.env.TZ = before;
  for (const r of results) assert.deepEqual(r, results[0]);
});

test("1:14 AM Tuesday: Pizza Palace is closed (Moe's report)", () => {
  assert.deepEqual(openStatus(pizzaPalace, at("2026-11-03T07:14:00Z")), { isOpen: false, label: "Closed · Opens 11 AM" });
});

test("noon Tuesday: open", () => {
  assert.deepEqual(openStatus(pizzaPalace, at("2026-11-03T18:00:00Z")), { isOpen: true, label: "Open · Closes 11 PM" });
});

test("10:59 PM Tuesday: still open, 11:01 PM: closed", () => {
  assert.equal(openStatus(pizzaPalace, at("2026-11-04T04:59:00Z")).isOpen, true);
  assert.deepEqual(openStatus(pizzaPalace, at("2026-11-04T05:01:00Z")), { isOpen: false, label: "Closed · Opens Tomorrow 11 AM" });
});

test("past midnight: Friday's 11 AM to 1 AM shift is open at 12:30 AM Saturday, closed at 1:01 AM", () => {
  assert.deepEqual(openStatus(pizzaPalace, at("2026-11-07T06:30:00Z")), { isOpen: true, label: "Open · Closes 1 AM" });
  assert.deepEqual(openStatus(pizzaPalace, at("2026-11-07T07:01:00Z")), { isOpen: false, label: "Closed · Opens 11 AM" });
});

test("after midnight, yesterday's hours only count if they ran past midnight", () => {
  // Monday closes at 11 PM, so 12:30 AM Tuesday is closed.
  assert.equal(openStatus(pizzaPalace, at("2026-11-03T06:30:00Z")).isOpen, false);
  // Thursday closes at midnight exactly, so 12:00 AM Friday is closed.
  assert.equal(openStatus(pizzaPalace, at("2026-11-06T05:59:00Z")).isOpen, true); // Thu 11:59 PM
  assert.equal(openStatus(pizzaPalace, at("2026-11-06T06:00:00Z")).isOpen, false); // Fri 12:00 AM
});

test("a closed day stays closed even when the next day opens early", () => {
  const h = { ...pizzaPalace, tuesday: "Closed" };
  assert.deepEqual(openStatus(h, at("2026-11-03T18:00:00Z")), { isOpen: false, label: "Closed · Opens Tomorrow 11 AM" });
});

test("missing or unreadable hours never show as open", () => {
  assert.deepEqual(openStatus(undefined, at("2026-11-03T18:00:00Z")), { isOpen: false, label: "Hours unavailable" });
  assert.deepEqual(openStatus({} as never, at("2026-11-03T18:00:00Z")), { isOpen: false, label: "Hours unavailable" });
  const unknownToday = { ...pizzaPalace, tuesday: "Hours not confirmed" };
  assert.deepEqual(openStatus(unknownToday, at("2026-11-03T18:00:00Z")), { isOpen: false, label: "Hours not confirmed" });
  const appointment = { ...pizzaPalace, tuesday: "By appointment" };
  assert.deepEqual(openStatus(appointment, at("2026-11-03T18:00:00Z")), { isOpen: false, label: "By appointment" });
  const missingToday = { ...pizzaPalace, tuesday: undefined as unknown as string };
  assert.deepEqual(openStatus(missingToday, at("2026-11-03T18:00:00Z")), { isOpen: false, label: "Hours not listed today" });
});

test("open 24 hours", () => {
  const h = Object.fromEntries(Object.keys(pizzaPalace).map((d) => [d, "Open 24 hours"])) as typeof pizzaPalace;
  assert.deepEqual(openStatus(h, at("2026-11-03T07:14:00Z")), { isOpen: true, label: "Open 24 hours" });
});

test("Google typos are caught before they reach the site", () => {
  const flagged = (h: Record<string, string>) => suspiciousDays(h as typeof pizzaPalace).map((f) => f.day);
  assert.deepEqual(flagged({ ...pizzaPalace, tuesday: "1:00 AM–11:00 PM" }), ["tuesday"]);
  assert.deepEqual(flagged({ ...pizzaPalace, monday: "11:00 AM–11:00 AM" }), ["monday"]);
  const dentist = { monday: "8:00 AM–4:30 AM", tuesday: "8:00 AM–4:30 PM", wednesday: "10:00 AM–6:00 PM", thursday: "10:00 AM–6:00 PM", friday: "8:00 AM–4:00 PM", saturday: "Closed", sunday: "Closed" };
  assert.deepEqual(flagged(dentist), ["monday"]);
  const bakery = { monday: "Closed", tuesday: "12:00 AM–4:00 PM", wednesday: "Closed", thursday: "12:00 PM–4:00 PM", friday: "12:00 PM–4:00 PM", saturday: "12:00 PM–4:00 PM", sunday: "Closed" };
  assert.deepEqual(flagged(bakery), ["tuesday"]);
  // Real late nights and early gyms are left alone.
  assert.deepEqual(flagged(pizzaPalace), []);
  const donair = { monday: "10:00 AM–12:00 AM", tuesday: "10:00 AM–12:00 AM", wednesday: "10:00 AM–12:00 AM", thursday: "10:00 AM–12:00 AM", friday: "10:00 AM–4:00 AM", saturday: "10:00 AM–4:00 AM", sunday: "11:00 AM–8:00 PM" };
  assert.deepEqual(flagged(donair), []);
  const gym = { monday: "5:00 AM–10:00 PM", tuesday: "5:00 AM–10:00 PM", wednesday: "5:00 AM–10:00 PM", thursday: "5:00 AM–10:00 PM", friday: "5:00 AM–10:00 PM", saturday: "7:00 AM–8:00 PM", sunday: "8:00 AM–8:00 PM" };
  assert.deepEqual(flagged(gym), []);
});

test("no live listing has hours that look like a typo", () => {
  const root = path.resolve(import.meta.dirname, "..");
  const fixes = JSON.parse(fs.readFileSync(path.join(root, "scripts/hours-fixes.json"), "utf8"));
  const dir = path.join(root, "content/businesses");
  const problems: string[] = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const { data } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    if (data.active === false || !data.hours) continue;
    for (const { day, reason } of suspiciousDays(data.hours)) {
      // A day checked by hand and confirmed as real is recorded with `use` equal to `google`.
      const fix = fixes[data.slug]?.[day];
      if (fix && fix.use === fix.google && fix.use === data.hours[day]) continue;
      problems.push(`${data.slug} ${day} "${data.hours[day]}": ${reason}`);
    }
  }
  assert.deepEqual(problems, []);
});
