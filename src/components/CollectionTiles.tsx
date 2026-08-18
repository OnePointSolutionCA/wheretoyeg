import Link from "next/link";
import { COLLECTIONS } from "@/lib/collections";
import { getBusinesses } from "@/lib/content";

export function CollectionTiles({ limit = 8 }: { limit?: number }) {
  const all = getBusinesses();
  const tiles = COLLECTIONS
    .map((c) => ({ c, count: all.filter(c.match).length }))
    .filter((t) => t.count > 0)
    .slice(0, limit);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map(({ c, count }) => (
        <Link
          key={c.slug}
          href={`/collections/${c.slug}`}
          className={
            "collection-tile group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lift " +
            c.gradient
          }
        >
          {/* Ambient orbs */}
          <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-3xl transition-transform duration-500 group-hover:scale-125" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-white/8 blur-3xl transition-transform duration-500 group-hover:scale-110" />
          {/* Dot pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex items-start justify-between">
            <span className="text-4xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">{c.emoji}</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
              {count} {count === 1 ? "spot" : "spots"}
            </span>
          </div>

          <div className="relative z-10">
            <div className="font-display text-2xl font-extrabold leading-tight">{c.title}</div>
            <div className="mt-1 text-sm font-medium text-white/85">{c.headline}</div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white/95">
              Explore <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
