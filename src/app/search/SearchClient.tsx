"use client";

import Fuse from "fuse.js";
import { useMemo, useState, useEffect } from "react";
import type { Business } from "@/lib/types";
import { BusinessCard } from "@/components/BusinessCard";
import { useSearchParams } from "next/navigation";

export function SearchClient({
  businesses,
  categoryNames,
  neighborhoods,
}: {
  businesses: Business[];
  categoryNames: Record<string, string>;
  neighborhoods: string[];
}) {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [n, setN] = useState(sp.get("neighborhood") ?? "");

  useEffect(() => {
    setQ(sp.get("q") ?? "");
    setN(sp.get("neighborhood") ?? "");
  }, [sp]);

  const fuse = useMemo(
    () =>
      new Fuse(businesses, {
        keys: [
          { name: "name", weight: 2 },
          { name: "description", weight: 1 },
          { name: "tags", weight: 1.4 },
          { name: "amenities", weight: 0.6 },
          { name: "neighborhood", weight: 0.8 },
          { name: "category", weight: 0.8 },
        ],
        threshold: 0.36,
        ignoreLocation: true,
      }),
    [businesses],
  );

  const results = useMemo(() => {
    let list: Business[];
    if (q.trim()) list = fuse.search(q).map((r) => r.item);
    else list = businesses.slice();
    if (n) list = list.filter((b) => b.neighborhood === n);
    return list;
  }, [q, n, fuse, businesses]);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-teal sm:text-4xl">
        Search Edmonton
      </h1>
      <div className="mt-6 flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-card sm:flex-row">
        <div className="flex flex-1 items-center gap-3 px-4 py-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try 'shawarma', 'lash tech', 'fade'..."
            className="w-full bg-transparent text-teal placeholder:text-teal-300 focus:outline-none"
            autoFocus
          />
        </div>
        <div className="hidden w-px shrink-0 self-stretch bg-line sm:block" />
        <div className="flex items-center gap-3 px-4 py-3 sm:min-w-[220px]">
          <select
            value={n}
            onChange={(e) => setN(e.target.value)}
            className="w-full appearance-none bg-transparent text-teal focus:outline-none"
          >
            <option value="">All Edmonton</option>
            {neighborhoods.map((nn) => (
              <option key={nn} value={nn}>{nn}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-4 text-sm text-teal-500">
        {results.length} result{results.length === 1 ? "" : "s"}
        {q ? ` for "${q}"` : ""}
        {n ? ` in ${n}` : ""}
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((b) => (
          <BusinessCard key={b.slug} business={b} categoryName={categoryNames[b.category]} />
        ))}
      </div>
      {results.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-mist p-10 text-center">
          <p className="font-semibold text-teal">Nothing yet for "{q}".</p>
          <p className="mt-1 text-sm text-teal-500">Try a broader term or check a category.</p>
        </div>
      )}
    </div>
  );
}
