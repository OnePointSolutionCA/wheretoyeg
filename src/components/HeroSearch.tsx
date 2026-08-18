"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";

export type SearchIndexItem = {
  kind: "business" | "category" | "neighborhood";
  name: string;
  href: string;
  hint?: string;
};

export function HeroSearch({
  neighborhoods,
  index,
}: {
  neighborhoods: string[];
  index: SearchIndexItem[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [n, setN] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(index, {
        keys: [{ name: "name", weight: 2 }, { name: "hint", weight: 0.6 }],
        threshold: 0.42,
        minMatchCharLength: 2,
        ignoreLocation: true,
        includeScore: true,
        distance: 100,
      }),
    [index],
  );

  const suggestions = useMemo(() => {
    const query = q.trim();
    if (!query) return [];
    // Fuzzy match, plus a boost for items whose name contains any query word as a substring.
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = fuse.search(query).map((r) => {
      const nameLc = r.item.name.toLowerCase();
      const nameWords = nameLc.split(/\W+/).filter(Boolean);
      const strongMatch = words.some((w) =>
        nameLc.includes(w) ||
        w.includes(nameLc) ||
        nameWords.some((nw) => nw.startsWith(w.slice(0, 4)) || w.startsWith(nw.slice(0, 4))),
      );
      return { item: r.item, score: (r.score ?? 1) + (strongMatch ? -0.3 : 0) };
    });
    return scored
      .sort((a, b) => a.score - b.score)
      .filter((r) => r.score <= 0.55)
      .slice(0, 5)
      .map((r) => r.item);
  }, [q, fuse]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function submit() {
    if (open && suggestions[active]) {
      router.push(suggestions[active].href);
      return;
    }
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (n) params.set("neighborhood", n);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      className="mx-auto mt-8 flex w-full max-w-3xl flex-col overflow-visible rounded-2xl border border-line bg-white p-1.5 shadow-lift sm:flex-row"
    >
      <div ref={wrapRef} className="relative flex flex-1 items-center gap-3 px-4 py-3">
        <SearchIcon />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open || suggestions.length === 0) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, suggestions.length - 1)); }
            if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Escape")    setOpen(false);
          }}
          placeholder="What are you looking for?"
          className="w-full bg-transparent text-teal placeholder:text-teal-300 focus:outline-none"
          aria-label="What are you looking for"
          aria-autocomplete="list"
          aria-expanded={open && suggestions.length > 0}
        />
        {open && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-white shadow-lift">
            {suggestions.map((s, i) => (
              <li key={s.href}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => { router.push(s.href); setOpen(false); }}
                  className={
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition " +
                    (i === active ? "bg-mist" : "hover:bg-mist")
                  }
                >
                  <KindBadge kind={s.kind} />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-teal">{s.name}</span>
                    {s.hint && <span className="block text-xs text-teal-500">{s.hint}</span>}
                  </span>
                  <span className="text-xs text-teal-300">↵</span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => { setOpen(false); submit(); }}
                className="flex w-full items-center justify-center gap-2 border-t border-line px-4 py-3 text-sm font-semibold text-coral transition hover:bg-mist"
              >
                See all results for &ldquo;{q}&rdquo; →
              </button>
            </li>
          </ul>
        )}
      </div>
      <div className="hidden w-px shrink-0 self-stretch bg-line sm:block" />
      <div className="flex items-center gap-3 px-4 py-3 sm:min-w-[220px]">
        <PinIcon />
        <select
          value={n}
          onChange={(e) => setN(e.target.value)}
          className="w-full appearance-none bg-transparent text-teal focus:outline-none"
          aria-label="Neighborhood"
        >
          <option value="">All Edmonton</option>
          {neighborhoods.map((nh) => (
            <option key={nh} value={nh}>{nh}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary m-1.5 shrink-0 px-6 py-3">
        Search
      </button>
    </form>
  );
}

function KindBadge({ kind }: { kind: SearchIndexItem["kind"] }) {
  const label = kind === "business" ? "Business" : kind === "category" ? "Category" : "Area";
  const cls =
    kind === "business"
      ? "bg-coral/10 text-coral"
      : kind === "category"
      ? "bg-teal/10 text-teal"
      : "bg-emerald-50 text-emerald-700";
  return (
    <span className={"inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider " + cls}>
      {label}
    </span>
  );
}
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-teal-300">
      <circle cx="11" cy="11" r="7" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-teal-300">
      <path strokeWidth="2" d="M12 21s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" strokeWidth="2" />
    </svg>
  );
}
