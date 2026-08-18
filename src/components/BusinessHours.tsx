import type { Hours } from "@/lib/types";
import { edmontonNow } from "@/lib/openNow";

const DAYS: (keyof Hours)[] = [
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
];

export function BusinessHours({ hours }: { hours: Hours }) {
  const now = edmontonNow();
  const todayIdx = (now.getDay() + 6) % 7; // Monday=0
  return (
    <table className="w-full text-sm">
      <tbody>
        {DAYS.map((d, i) => (
          <tr key={d} className={i === todayIdx ? "font-semibold text-teal" : "text-teal-500"}>
            <td className="py-1 pr-4 capitalize">{d}</td>
            <td className="py-1 tabular-nums">{hours?.[d] || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
