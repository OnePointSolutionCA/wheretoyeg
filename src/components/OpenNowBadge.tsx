"use client";

import { useEffect, useState } from "react";
import type { Hours } from "@/lib/types";
import { openStatus, type OpenStatus } from "@/lib/openNow";

// Worked out in the visitor's browser and refreshed every minute. Pages are cached,
// so a status rendered on the server would go stale (a page built at 7 PM would
// still say "Open" at 1 AM).
export function OpenNowBadge({ hours, className = "" }: { hours: Hours; className?: string }) {
  const [s, setS] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const tick = () => setS(openStatus(hours));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [hours]);

  return (
    <span
      className={
        "inline-flex items-center gap-1.5 text-xs font-semibold " +
        (s?.isOpen ? "text-emerald-600" : s ? "text-teal-500" : "text-teal-300") +
        " " +
        className
      }
    >
      <span
        className={
          "inline-block h-2 w-2 rounded-full " +
          (s?.isOpen ? "bg-emerald-500" : s ? "bg-teal-300" : "bg-line")
        }
      />
      {s ? s.label : "Hours"}
    </span>
  );
}
