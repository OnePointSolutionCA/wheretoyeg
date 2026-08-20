"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import type { SearchIndexItem } from "./HeroSearch";

export function NavSearch({ index }: { index: SearchIndexItem[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLFormElement>(null);

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
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = fuse.search(query).map((r) => {
      const nameLc = r.item.name.toLowerCase();
      const nameWords = nameLc.split(/\W+/).filter(Boolean);
      const strongMatch = words.some((w) =>
        nameLc.includes(w) || w.includes(nameLc) ||
        nameWords.some((nw) => nw.startsWith(w.slice(0, 4)) || w.startsWith(nw.slice(0, 4)))
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
      setOpen(false);
      return;
    }
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form
      ref={wrapRef}
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      className="relative hidden md:block"
    >
      <div className="flex items-center rounded-full border border-line bg-white px-3 py-1.5 shadow-sm transition focus-within:border-coral focus-within:ring-2 focus-within:ring-coral/20">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-teal-300">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open || suggestions.length === 0) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, suggestions.length - 1)); }
            if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Escape")    setOpen(false);
          }}
          placeholder="Search Edmonton…"
          className="w-40 bg-transparent text-sm text-teal placeholder:text-teal-300 focus:outline-none lg:w-52"
          aria-label="Search Edmonton businesses"
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="dropdown-anim absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
          <li className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-teal-300">
            Suggestions
          </li>
          {suggestions.map((s, i) => (
            <li key={s.href}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => { router.push(s.href); setOpen(false); setQ(""); }}
                className={
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors " +
                  (i === active ? "bg-mist" : "hover:bg-mist")
                }
              >
                <SuggestionIcon kind={s.kind} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-teal">{s.name}</span>
                  {s.hint && <span className="block truncate text-xs text-teal-500">{s.hint}</span>}
                </span>
                <KindBadge kind={s.kind} />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => { router.push(`/search?q=${encodeURIComponent(q.trim())}`); setOpen(false); }}
              className="flex w-full items-center justify-center gap-2 border-t border-line bg-mist/50 px-4 py-2.5 text-xs font-semibold text-coral transition hover:bg-mist"
            >
              See all results for &ldquo;{q}&rdquo; <span aria-hidden>→</span>
            </button>
          </li>
        </ul>
      )}
    </form>
  );
}

function KindBadge({ kind }: { kind: SearchIndexItem["kind"] }) {
  const label = kind === "business" ? "Biz" : kind === "category" ? "Cat" : "Area";
  const cls =
    kind === "business" ? "bg-coral/10 text-coral"
    : kind === "category" ? "bg-teal/10 text-teal"
    : "bg-emerald-50 text-emerald-700";
  return (
    <span className={"inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider " + cls}>
      {label}
    </span>
  );
}

function SuggestionIcon({ kind }: { kind: SearchIndexItem["kind"] }) {
  const bg = kind === "business" ? "bg-coral/10 text-coral"
    : kind === "category" ? "bg-teal/10 text-teal"
    : "bg-emerald-50 text-emerald-700";
  const icon = kind === "business" ? (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/></svg>
  ) : kind === "category" ? (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>
  );
  return (
    <span className={"flex h-7 w-7 shrink-0 items-center justify-center rounded-lg " + bg}>{icon}</span>
  );
}
