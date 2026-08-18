import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { BusinessCard } from "@/components/BusinessCard";
import { getBusinesses, getCategories } from "@/lib/content";

function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, "-"); }

export async function generateStaticParams() {
  return SITE.neighborhoods.map((n) => ({ slug: toSlug(n) }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const name = SITE.neighborhoods.find((n) => toSlug(n) === params.slug);
  if (!name) return {};
  return {
    title: `Best businesses in ${name}, Edmonton`,
    description: `Local businesses in ${name}, Edmonton — restaurants, cafes, barbers, salons and more on WhereToYEG.`,
  };
}

export default function NeighborhoodPage({ params }: { params: { slug: string } }) {
  const name = SITE.neighborhoods.find((n) => toSlug(n) === params.slug);
  if (!name) notFound();
  const businesses = getBusinesses().filter((b) => b.neighborhood === name);
  const cats = Object.fromEntries(getCategories().map((c) => [c.slug, c.name]));

  return (
    <>
      <section className="border-b border-line bg-mist">
        <div className="container-page py-12">
          <nav className="text-xs text-teal-500">
            <Link href="/neighborhoods" className="hover:text-coral">Neighborhoods</Link>{" "}
            <span className="px-1">›</span>{" "}
            <span className="font-semibold text-teal">{name}</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
            Best businesses in {name}
          </h1>
          <p className="mt-3 max-w-2xl text-teal-500">
            {businesses.length
              ? `${businesses.length} local business${businesses.length === 1 ? "" : "es"} listed in ${name}.`
              : `${name} is on the map — we're adding listings here now.`}
          </p>
        </div>
      </section>
      <section className="container-page py-10">
        {businesses.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b) => (
              <BusinessCard key={b.slug} business={b} categoryName={cats[b.category]} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-mist p-12 text-center">
            <p className="font-display text-2xl font-bold text-teal">Nothing here yet.</p>
            <p className="mt-2 text-teal-500">Know a spot in {name}? Send it our way.</p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/get-listed" className="btn-primary">List a business</Link>
              <Link href="/contact" className="btn-ghost">Suggest a spot</Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
