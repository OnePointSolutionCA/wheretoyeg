import { useId } from "react";

export function StarRating({
  value,
  count,
  size = 14,
  compact = false,
}: {
  value: number;
  count?: number;
  size?: number;
  compact?: boolean;
}) {
  const baseId = useId();
  const stars = Array.from({ length: 5 }, (_, i) => Math.max(0, Math.min(1, value - i)));
  return (
    <span className="inline-flex items-center gap-1.5 align-middle" aria-label={`${value} out of 5`}>
      <span className="inline-flex">
        {stars.map((f, i) => (
          <Star key={i} id={`${baseId}-${i}`} fill={f} size={size} />
        ))}
      </span>
      {!compact && (
        <span className="text-sm font-semibold text-teal">
          {value.toFixed(1)}
          {typeof count === "number" && (
            <span className="ml-1 font-normal text-teal-500">({count})</span>
          )}
        </span>
      )}
    </span>
  );
}

function Star({ id, fill, size }: { id: string; fill: number; size: number }) {
  const pct = Math.round(fill * 100);
  const gradId = `sr-${id.replace(/[:]/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
          <stop offset={`${pct}%`} stopColor="#F1664C" />
          <stop offset={`${pct}%`} stopColor="#E4EAED" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradId})`}
        d="M10 1.5l2.7 5.4 6 .87-4.35 4.23 1.03 5.99L10 15.16l-5.38 2.83 1.03-5.99L1.3 7.77l6-.87L10 1.5z"
      />
    </svg>
  );
}
