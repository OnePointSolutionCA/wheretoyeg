"use client";

import { useCallback, useEffect, useState } from "react";

const cache = new Map<string, Promise<unknown>>();

/** Fetches a static JSON file once per page session; `load` is safe to call repeatedly. */
export function useRemoteJson<T>(url: string, eager = false) {
  const [data, setData] = useState<T | null>(null);
  const load = useCallback(() => {
    if (!cache.has(url)) {
      cache.set(
        url,
        fetch(url).then((r) => {
          if (!r.ok) throw new Error(`${url} ${r.status}`);
          return r.json();
        }).catch((e) => {
          cache.delete(url);
          throw e;
        }),
      );
    }
    (cache.get(url) as Promise<T>).then(setData).catch(() => {});
  }, [url]);
  useEffect(() => {
    if (eager) load();
  }, [eager, load]);
  return [data, load] as const;
}
