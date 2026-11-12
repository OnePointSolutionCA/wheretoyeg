"use client";

import Link from "next/link";
import { useId, useState } from "react";

export type Chip = { href: string; label: string; count?: number; active?: boolean };

/**
 * A labelled set of link chips that wraps onto rows instead of scrolling sideways.
 * Shows the first few (fewer on phones) and folds the rest behind a "+N more" button.
 * Every link stays in the HTML, so crawlers still follow them all.
 */
export function ChipGroup({
  label,
  chips,
  mobile = 6,
  desktop = 12,
  className = "",
}: {
  label?: string;
  chips: Chip[];
  /** Chips shown on phones before the "more" button. */
  mobile?: number;
  /** Chips shown on wider screens before the "more" button. */
  desktop?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!chips.length) return null;

  // The current page's chip is never folded away.
  const overM = (c: Chip, i: number) => !c.active && i >= mobile;
  const overD = (c: Chip, i: number) => !c.active && i >= desktop;
  const hiddenM = chips.filter(overM).length;
  const hiddenD = chips.filter(overD).length;
  // With nothing folded on wide screens, the toggle only shows on phones.
  const toggleClass = "chip chip-toggle" + (hiddenD > 0 ? "" : " toggle-m");

  return (
    <div className={className}>
      {label && <p className="mb-2 text-xs font-bold uppercase tracking-wider text-teal-300">{label}</p>}
      <div id={id} className={"chipset flex flex-wrap gap-2" + (open ? " is-open" : "")}>
        {chips.map((c, i) => (
          <Link
            key={c.href + c.label}
            href={c.href}
            aria-current={c.active ? "page" : undefined}
            className={
              "chip" + (c.active ? " chip--active" : "") + (overD(c, i) ? " over-m over-d" : overM(c, i) ? " over-m" : "")
            }
          >
            {c.label}
            {c.count ? <span className={c.active ? "text-white/70" : "text-teal-300"}>{c.count}</span> : null}
          </Link>
        ))}
        {hiddenM > 0 &&
          (open ? (
            <button type="button" className={toggleClass} aria-expanded="true" aria-controls={id} onClick={() => setOpen(false)}>
              Show less
            </button>
          ) : (
            <>
              <button type="button" className="chip chip-toggle toggle-m" aria-expanded="false" aria-controls={id} onClick={() => setOpen(true)}>
                +{hiddenM} more
              </button>
              {hiddenD > 0 && (
                <button type="button" className="chip chip-toggle toggle-d" aria-expanded="false" aria-controls={id} onClick={() => setOpen(true)}>
                  +{hiddenD} more
                </button>
              )}
            </>
          ))}
      </div>
    </div>
  );
}
