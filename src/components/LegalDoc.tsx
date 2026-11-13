import type { ReactNode } from "react";

export const OPERATOR = {
  name: "OnePoint Solutions Marketing Agency",
  address: "15020 116 Ave NW, Unit 2, Edmonton, Alberta T5M 3T4",
  email: "hello@wheretoyeg.ca",
  phone: "(780) 229 8464",
  officer: "Moe Zidane, Privacy Officer",
};

export interface LegalSection { id: string; h: string; body: ReactNode }

/** Privacy policy and terms layout: title, effective date, table of contents, sections. */
export function LegalDoc({ title, effective, intro, sections }: { title: string; effective: string; intro: ReactNode; sections: LegalSection[] }) {
  return (
    <section className="container-page py-16">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-teal-300">Effective {effective}</p>
      <div className="mt-6 max-w-3xl space-y-4 text-teal-500 leading-relaxed">
        {intro}
        <nav aria-label="On this page" className="rounded-xl2 border border-line bg-mist p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-300">On this page</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm sm:columns-2 sm:gap-8">
            {sections.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="text-teal hover:text-coral hover:underline">{s.h}</a></li>
            ))}
          </ol>
        </nav>
        {sections.map((s) => (
          <div key={s.id} id={s.id} className="scroll-mt-24 space-y-3 pt-4 [&_a]:text-coral [&_a:hover]:underline [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-5">
            <h2 className="font-display text-xl font-bold text-teal">{s.h}</h2>
            {s.body}
          </div>
        ))}
      </div>
    </section>
  );
}
