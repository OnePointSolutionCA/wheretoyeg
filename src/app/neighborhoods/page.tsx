import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { getBusinesses } from "@/lib/content";
import { neighborhoodSlug, neighborhoodStats } from "@/lib/neighborhoods";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Edmonton neighborhoods",
  description:
    "Browse Edmonton neighborhoods: Downtown, Whyte Ave, 124 Street, Mill Woods, Windermere, Sherwood Park and more. Find the best local businesses near you.",
  alternates: { canonical: `${SITE.url}/neighborhoods` },
};

export default function NeighborhoodsPage() {
  const all = getBusinesses();
  const areas = SITE.neighborhoods.map((n) => ({ name: n, ...neighborhoodStats(n, all) }));
  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-mist to-white">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow">Neighborhoods</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-6xl">
            Edmonton, by where you are.
          </h1>
          <p className="mt-4 max-w-2xl text-teal-500 sm:text-lg">
            Every corner of the city has spots worth knowing. Pick a neighborhood to see what&apos;s nearby.
          </p>
        </div>
      </section>
      <section className="container-page py-10 sm:py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((a, i) => (
            <Link
              key={a.name}
              href={`/neighborhoods/${neighborhoodSlug(a.name)}`}
              className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-teal text-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              {a.cover && (
                <Image
                  src={a.cover}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority={i < 3}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" aria-hidden="true" />
              <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-teal backdrop-blur">
                {a.businesses.length} spots
              </span>
              <div className="relative p-5">
                <div className="font-display text-2xl font-extrabold leading-tight drop-shadow">{a.name}</div>
                {a.topCategories.length > 0 && (
                  <div className="mt-1 text-sm text-white/80">{a.topCategories.slice(0, 3).map((c) => c.name).join(" · ")}</div>
                )}
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-coral-300">
                  Explore <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
