"use client";

import { useEffect, useState } from "react";
import type { Hours, Season } from "@/lib/types";
import { displayDayHours, edmontonTime, monthDay } from "@/lib/openNow";

const DAYS: (keyof Hours)[] = [
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
];

export function BusinessHours({ hours, season }: { hours: Hours; season?: Season }) {
  // Today's row is picked in the browser so a cached page never highlights yesterday.
  const [todayIdx, setTodayIdx] = useState(-1);
  useEffect(() => {
    const tick = () => setTodayIdx((edmontonTime().day + 6) % 7); // Monday=0
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  // Special days are only shown once the season's dates are confirmed.
  const confirmed = season?.from && season?.to ? season : null;

  return (
    <>
      {season && (
        <p className="mb-2 text-sm text-teal-500">
          {season.note}
          {confirmed && ` Season: ${monthDay(confirmed.from!)} to ${monthDay(confirmed.to!)}.`}
        </p>
      )}
      <table className="w-full text-sm">
        <tbody>
          {DAYS.map((d, i) => (
            <tr key={d} className={i === todayIdx ? "font-semibold text-teal" : "text-teal-500"}>
              <td className="py-1 pr-4 capitalize">{d}</td>
              <td className="py-1 tabular-nums">{displayDayHours(hours?.[d])}</td>
            </tr>
          ))}
          {confirmed &&
            Object.entries(confirmed.dates ?? {}).map(([date, value]) => (
              <tr key={date} className="text-teal-500">
                <td className="py-1 pr-4">{monthDay(date)}</td>
                <td className="py-1 tabular-nums">{displayDayHours(value)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}
