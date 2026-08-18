import type { Review } from "@/lib/types";
import { StarRating } from "./StarRating";

const AVATAR_COLORS = [
  "from-coral to-[#c56430]",
  "from-teal to-[#0d5a75]",
  "from-[#3d7c60] to-[#2b5747]",
  "from-[#8355a2] to-[#5c3c6b]",
  "from-[#a37432] to-[#6a4a1e]",
];

function pickColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function formatDate(d: string): string {
  if (!d) return "";
  // ISO date? Format nicely.
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
    const dt = new Date(d);
    if (!isNaN(dt.getTime())) {
      return dt.toLocaleDateString("en-CA", { year: "numeric", month: "short" });
    }
  }
  return d;
}

export function ReviewCard({ review }: { review: Review }) {
  const initial = (review.name?.[0] ?? "?").toUpperCase();
  const color = pickColor(review.name ?? "");

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      {/* Faint quote mark in the background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 -right-2 select-none font-display text-[110px] leading-none text-teal-300/15 transition-transform duration-500 group-hover:scale-110"
      >
        &ldquo;
      </div>

      <div className="relative flex items-start gap-3">
        <div className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-lg font-display font-extrabold text-white shadow-card " + color}>
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="truncate font-semibold text-teal">{review.name}</span>
            <span className="text-xs text-teal-300">{formatDate(review.date)}</span>
          </div>
          <div className="mt-1">
            <StarRating value={review.rating} count={1} compact size={13} />
          </div>
        </div>
      </div>

      <p className="relative mt-3 text-sm text-teal-500 line-clamp-6">{review.comment}</p>
    </div>
  );
}
