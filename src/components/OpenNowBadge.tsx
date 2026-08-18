import type { Hours } from "@/lib/types";
import { openStatus } from "@/lib/openNow";

export function OpenNowBadge({ hours, className = "" }: { hours: Hours; className?: string }) {
  const s = openStatus(hours);
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 text-xs font-semibold " +
        (s.isOpen ? "text-emerald-600" : "text-teal-500") +
        " " +
        className
      }
    >
      <span
        className={
          "inline-block h-2 w-2 rounded-full " +
          (s.isOpen ? "bg-emerald-500" : "bg-teal-300")
        }
      />
      {s.label}
    </span>
  );
}
