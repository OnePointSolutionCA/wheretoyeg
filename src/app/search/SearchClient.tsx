"use client";

import Fuse from "fuse.js";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BusinessCard } from "@/components/BusinessCard";
import { useRemoteJson } from "@/components/useRemoteJson";
import type { SearchBusiness } from "@/lib/slim";

const PAGE = 24;
const SUGGESTIONS = ["Shawarma", "Halal", "Barber", "Coffee", "Lash", "Brunch", "Dentist", "Mechanic"];

type PickerCategory = { name: string; slug: string; subs: { name: string; slug: string }[] };

export function SearchClient({ neighborhoods, categories }: { neighborhoods: string[]; categories: PickerCategory[] }) {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [n, setN] = useState(sp.get("neighborhood") ?? "");
  const [cat, setCat] = useState(sp.get("category") ?? "");
  const [visible, setVisible] = useState(PAGE);
  const [data] = useRemoteJson<SearchBusiness[]>("/search-data.json", true);

  useEffect(() => {
    setQ(sp.get("q") ?? "");
    setN(sp.get("neighborhood") ?? "");
    setCat(sp.get("category") ?? "");
  }, [sp]);

  useEffect(() => setVisible(PAGE), [q, n, cat]);

  const fuse = useMemo(
    () =>
      new Fuse(data ?? [], {
        keys: [
          { name: "name", weight: 2 },
          { name: "subName", weight: 1.4 },
          { name: "catName", weight: 1 },
          { name: "keywords", weight: 1.2 },
          { name: "description", weight: 0.8 },
          { name: "amenities", weight: 0.6 },
          { name: "neighborhood", weight: 0.8 },
        ],
        threshold: 0.36,
        ignoreLocation: true,
      }),
    [data],
  );

  const results = useMemo(() => {
    if (!data) return [];
    let list = q.trim() ? fuse.search(q.trim()).map((r) => r.item) : [...data].sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
    if (cat) list = list.filter((b) => b.category === cat);
    if (n) list = list.filter((b) => b.neighborhood === n);
    return list;
  }, [q, n, cat, fuse, data]);

  const picked = categories.find((c) => c.slug === cat);
  const catName = picked?.name;

  return (
    <div>
      <p className="eyebrow">Search</p>
      <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
        Find it in Edmonton.
      </h1>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mt-6 flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-card focus-within:border-coral focus-within:ring-2 focus-within:ring-coral/20 sm:flex-row"
      >
        <label className="flex flex-1 items-center gap-3 px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="shrink-0 text-teal-300" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <span className="sr-only">Search businesses</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try 'shawarma', 'lash tech', 'fade'…"
            className="w-full bg-transparent text-base text-teal placeholder:text-teal-300 focus:outline-none"
            autoFocus
          />
        </label>
        <div className="hidden w-px shrink-0 self-stretch bg-line sm:block" />
        <label className="flex items-center gap-3 border-t border-line px-4 py-3 sm:min-w-[200px] sm:border-t-0">
          <span className="sr-only">Category</span>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="w-full appearance-none bg-transparent text-base text-teal focus:outline-none"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <span aria-hidden className="text-xs text-teal-300">▾</span>
        </label>
        <div className="hidden w-px shrink-0 self-stretch bg-line sm:block" />
        <label className="flex items-center gap-3 border-t border-line px-4 py-3 sm:min-w-[200px] sm:border-t-0">
          <span className="sr-only">Neighborhood</span>
          <select
            value={n}
            onChange={(e) => setN(e.target.value)}
            className="w-full appearance-none bg-transparent text-base text-teal focus:outline-none"
          >
            <option value="">All Edmonton</option>
            {neighborhoods.map((nn) => (
              <option key={nn} value={nn}>{nn}</option>
            ))}
          </select>
          <span aria-hidden className="text-xs text-teal-300">▾</span>
        </label>
      </form>

      {picked && picked.subs.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">{picked.name}:</span>
          {picked.subs.map((s) => (
            <Link key={s.slug} href={`/${picked.slug}/${s.slug}`} className="chip min-h-[36px]">
              {s.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">Popular:</span>
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => setQ(s)} className={"chip min-h-[36px] " + (q.toLowerCase() === s.toLowerCase() ? "chip--active" : "")}>
            {s}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-teal-500" aria-live="polite">
        {!data
          ? "Loading listings…"
          : `${results.length.toLocaleString("en-CA")} result${results.length === 1 ? "" : "s"}${q ? ` for “${q}”` : ""}${catName ? ` in ${catName}` : ""}${n ? ` in ${n}` : ""}`}
      </p>

      {!data ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl border border-line bg-mist" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(0, visible).map((b) => (
              <BusinessCard key={`${b.category}/${b.slug}`} business={b} categoryName={b.catName} />
            ))}
          </div>
          {visible < results.length && (
            <div className="mt-8 flex justify-center">
              <button type="button" onClick={() => setVisible((v) => v + PAGE)} className="btn-ghost min-h-[44px]">
                Show more ({(results.length - visible).toLocaleString("en-CA")} remaining)
              </button>
            </div>
          )}
          {results.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-line bg-mist p-10 text-center">
              <p className="font-semibold text-teal">Nothing yet for “{q}”.</p>
              <p className="mt-1 text-sm text-teal-500">Try a broader term, or browse a category.</p>
              <div className="mt-4 flex justify-center gap-2">
                <Link href="/#categories" className="btn-primary min-h-[44px]">Browse categories</Link>
                <Link href="/get-listed" className="btn-ghost min-h-[44px]">Suggest a business</Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
