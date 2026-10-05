"use client";

import { useCallback, useEffect, useState } from "react";

const cache = new Map<string, Promise<unknown>>();

// Retries a couple of times so one dropped request on a weak connection doesn't leave the page loading forever.
function fetchJson(url: string, tries = 3): Promise<unknown> {
  return fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`${url} ${r.status}`);
      return r.json();
    })
    .catch((e) => (tries > 1 ? new Promise((res) => setTimeout(res, 1500)).then(() => fetchJson(url, tries - 1)) : Promise.reject(e)));
}

/** Fetches a static JSON file once per page session; `load` is safe to call repeatedly. */
export function useRemoteJson<T>(url: string, eager = false) {
  const [data, setData] = useState<T | null>(null);
  const load = useCallback(() => {
    if (!cache.has(url)) {
      cache.set(
        url,
        fetchJson(url).catch((e) => {
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
