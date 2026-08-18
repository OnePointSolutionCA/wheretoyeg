import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { getBusinesses } from "@/lib/content";

export const metadata: Metadata = {
  title: "Edmonton neighborhoods",
  description:
    "Browse Edmonton neighborhoods — Downtown, Whyte Ave, Jasper Ave, Mill Woods, Windermere and more. Find local businesses near you.",
};

export default function NeighborhoodsPage() {
  const businesses = getBusinesses();
  return (
    <section className="container-page py-16" data-reveal="left">
      <p className="eyebrow">Neighborhoods</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
        Edmonton, by where you are.
      </h1>
      <p className="mt-4 max-w-2xl text-teal-500">
        Every corner of the city has spots worth knowing. Pick a neighborhood.
      </p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SITE.neighborhoods.map((n) => {
          const count = businesses.filter((b) => b.neighborhood === n).length;
          return (
            <Link
              key={n}
              href={`/neighborhoods/${n.toLowerCase().replace(/\s+/g, "-")}`}
              className="group flex items-center justify-between rounded-2xl border border-line bg-white p-5 transition hover:border-teal-300 hover:shadow-card"
            >
              <div>
                <div className="font-display text-lg font-bold text-teal group-hover:text-coral">{n}</div>
                <div className="text-xs text-teal-500">
                  {count ? `${count} listing${count === 1 ? "" : "s"}` : "New area"}
                </div>
              </div>
              <span className="text-teal-300 transition group-hover:translate-x-1 group-hover:text-coral">→</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
