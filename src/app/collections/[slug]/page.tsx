import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusinesses, getCategories } from "@/lib/content";
import { COLLECTIONS, getCollectionBySlug, getBusinessesForCollection } from "@/lib/collections";
import { BusinessCard } from "@/components/BusinessCard";
import { Card3D } from "@/components/Card3D";
import { SITE } from "@/lib/site";

export async function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = getCollectionBySlug(params.slug);
  if (!c) return {};
  const title = `${c.title} in Edmonton — ${c.headline} | WhereToYEG`;
  return {
    title,
    description: c.description,
    alternates: { canonical: `${SITE.url}/collections/${c.slug}` },
    openGraph: { title, description: c.description, images: ["/og.png"] },
  };
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const c = getCollectionBySlug(params.slug);
  if (!c) notFound();

  const all = getBusinesses();
  const businesses = getBusinessesForCollection(c, all);
  const cats = getCategories();
  const catBySlug = Object.fromEntries(cats.map((k) => [k.slug, k.name]));

  return (
    <>
      {/* HERO */}
      <section className={"relative overflow-hidden bg-gradient-to-br text-white " + c.gradient}>
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-[500px] w-[500px] rounded-full bg-white/8 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden="true"
        />
        <div className="container-page relative py-14 sm:py-20">
          <nav className="text-xs text-white/70">
            <Link href="/" className="hover:text-white">Home</Link> <span className="px-1">›</span>{" "}
            <Link href="/collections" className="hover:text-white">Collections</Link> <span className="px-1">›</span>{" "}
            <span className="font-semibold text-white">{c.title}</span>
          </nav>
          <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <span className="text-6xl sm:text-7xl">{c.emoji}</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">{c.headline}</p>
              <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{c.title}</h1>
              <p className="mt-2 max-w-2xl text-white/85 sm:text-lg">{c.description}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
                {businesses.length} {businesses.length === 1 ? "spot" : "spots"} in this collection
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="container-page mt-10">
        {businesses.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b) => (
              <Card3D key={b.slug}>
                <BusinessCard business={b} categoryName={catBySlug[b.category]} />
              </Card3D>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-mist p-10 text-center">
            <p className="font-semibold text-teal">Nothing here yet.</p>
            <p className="mt-1 text-sm text-teal-500">Check back soon — we&apos;re always adding new spots.</p>
          </div>
        )}
      </section>

      {/* OTHER COLLECTIONS */}
      <section className="container-page mt-20 mb-16">
        <p className="eyebrow">Keep exploring</p>
        <h2 className="section-title mt-1">Other collections</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS
            .filter((x) => x.slug !== c.slug)
            .slice(0, 4)
            .map((x) => (
              <Link
                key={x.slug}
                href={`/collections/${x.slug}`}
                className={
                  "collection-tile group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lift " +
                  x.gradient
                }
              >
                <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-3xl transition-transform duration-500 group-hover:scale-125" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "18px 18px" }} aria-hidden="true" />
                <div className="relative z-10 flex items-start justify-between">
                  <span className="text-4xl">{x.emoji}</span>
                </div>
                <div className="relative z-10">
                  <div className="font-display text-xl font-extrabold">{x.title}</div>
                  <div className="mt-1 text-xs text-white/85">{x.headline}</div>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}
