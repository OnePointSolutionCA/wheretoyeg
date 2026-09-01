import Link from "next/link";
import type { Metadata } from "next";
import { GetListedForm } from "@/components/GetListedForm";

export const metadata: Metadata = {
  title: "Get your Edmonton business listed",
  description:
    "Get your business listed on WhereToYEG for free. Show up when Edmontonians search for what you do.",
};

const BENEFITS = [
  "Your business name, address, phone, and website — front and centre",
  "Up to 5 photos pulled from your Google listing",
  "Real Google reviews displayed on your page",
  "Listed on your category page and searchable site-wide",
  "Included in curated collections and blog features",
  "Permanent SEO page that ranks for your name + Edmonton",
];

export default function GetListedPage() {
  return (
    <>
      <section className="border-b border-line bg-mist">
        <div className="container-page py-16 text-center">
          <p className="eyebrow">For Edmonton business owners</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
            Get your business on WhereToYEG.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-teal-500">
            Free listing. No contracts. No dashboards. When Edmontonians google what you do, you show up.
          </p>
        </div>
      </section>

      <section className="container-page mt-12" data-reveal="up">
        <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-white p-8 sm:p-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-4 py-2 text-sm font-bold text-coral">
              100% Free — No Catch
            </div>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-teal">
              Every listing includes
            </h2>
          </div>
          <ul className="mt-8 space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex gap-3 text-teal-500">
                <span className="mt-0.5 text-coral">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-teal-300">
            Want premium placement, a featured badge, or a dedicated SEO blog post?{" "}
            <a href="mailto:hello@wheretoyeg.ca" className="text-coral hover:underline">
              Reach out
            </a>{" "}
            — we'll work something out.
          </p>
        </div>
      </section>

      <section id="apply" className="container-page mt-16" data-reveal="left">
        <div className="rounded-3xl border border-line bg-mist p-8 sm:p-12">
          <p className="eyebrow">Submit your business</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-teal">
            Tell us about your business.
          </h2>
          <p className="mt-2 max-w-xl text-teal-500">
            Fill out the form below. We&apos;ll get your listing live within a few days — no payment required.
          </p>
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-card sm:p-8">
            <GetListedForm />
          </div>
        </div>
      </section>
    </>
  );
}
