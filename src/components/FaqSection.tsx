import Link from "next/link";
import { faqSchema, JsonLd } from "@/lib/schema-extra";

export type FaqEntry = { q: string; a: string; links?: { label: string; href: string }[] };

export function FaqSection({ title, items, eyebrow = "Questions, answered", className = "mt-16 sm:mt-20" }: { title: string; items: FaqEntry[]; eyebrow?: string; className?: string }) {
  if (!items.length) return null;
  return (
    <section className={"container-page " + className} data-reveal="up">
      <JsonLd data={faqSchema(items.map(({ q, a }) => ({ q, a })))} />
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-1">{title}</h2>
      <div className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {items.map((it, i) => (
          <details key={it.q} className="group" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition hover:bg-mist sm:px-6 [&::-webkit-details-marker]:hidden">
              <h3 className="font-display text-base font-bold text-teal sm:text-lg">{it.q}</h3>
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-lg leading-none text-coral transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="px-5 pb-5 sm:px-6">
              <p className="max-w-3xl text-teal-500">{it.a}</p>
              {it.links && it.links.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {it.links.map((l) => (
                    <Link key={l.href} href={l.href} className="chip">
                      {l.label} <span aria-hidden>→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
