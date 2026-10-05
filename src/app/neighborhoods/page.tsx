import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { getBusinesses } from "@/lib/content";
import { neighborhoodSlug, neighborhoodStats } from "@/lib/neighborhoods";
import { AreaTile } from "@/components/AreaTile";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Edmonton Neighborhoods & Nearby Towns | Local Guides" },
  description:
    "Browse local businesses by area: Downtown, Whyte Ave, 124 Street, Mill Woods and Windermere, plus Sherwood Park, St. Albert, Spruce Grove, Leduc and more.",
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {areas.map((a, i) => (
            <AreaTile
              key={a.name}
              name={a.name}
              href={`/neighborhoods/${neighborhoodSlug(a.name)}`}
              count={a.businesses.length}
              photo={a.photo}
              fallback={a.cover}
              tags={a.topCategories.map((c) => c.name)}
              size={i === 0 ? "lg" : "md"}
              priority={i < 3}
              className={i === 0 ? "col-span-2 aspect-[16/9] lg:col-span-2 lg:row-span-2 lg:aspect-auto" : "aspect-[4/5] sm:aspect-[4/3]"}
            />
          ))}
        </div>
      </section>
    </>
  );
}
