"use client";

import { useEffect, useState } from "react";
import type { Hours } from "@/lib/types";
import { displayDayHours, edmontonNow } from "@/lib/openNow";

const DAYS: (keyof Hours)[] = [
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
];

export function BusinessHours({ hours }: { hours: Hours }) {
  // Today's row is picked in the browser so a cached page never highlights yesterday.
  const [todayIdx, setTodayIdx] = useState(-1);
  useEffect(() => {
    const tick = () => setTodayIdx((edmontonNow().getDay() + 6) % 7); // Monday=0
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <table className="w-full text-sm">
      <tbody>
        {DAYS.map((d, i) => (
          <tr key={d} className={i === todayIdx ? "font-semibold text-teal" : "text-teal-500"}>
            <td className="py-1 pr-4 capitalize">{d}</td>
            <td className="py-1 tabular-nums">{displayDayHours(hours?.[d])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
