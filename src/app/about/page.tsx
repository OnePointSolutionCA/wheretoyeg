import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About WhereToYEG",
  description:
    "WhereToYEG is a local discovery directory built to make Edmonton easier and more exciting to explore.",
};

export default function AboutPage() {
  return (
    <section className="container-page py-16">
      <p className="eyebrow">About</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
        Edmonton discovery, made easy.
      </h1>
      <div className="mt-8 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6 text-teal-500">
          <p className="text-lg">
            WhereToYEG is a local business directory built for the people who live, work, and eat here. It exists because searching Yelp for a barber in Edmonton shouldn't feel like a chore.
          </p>
          <p>
            Every listing is hand-added. No user accounts, no fake reviews farmed from bots, no cluttered dashboards to sign into. Businesses submit their info, we verify it, we put them on the map.
          </p>
          <p>
            If you own a spot in Edmonton, list it. If you're just looking for good coffee near Whyte Ave, start browsing.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/get-listed" className="btn-primary">List a business</Link>
            <Link href="/#categories" className="btn-ghost">Start exploring</Link>
          </div>
        </div>
        <div>
          <div className="rounded-2xl border border-line bg-mist p-6">
            <p className="eyebrow">Voice</p>
            <p className="mt-2 font-display text-2xl font-bold text-teal">
              Helpful, local, direct.
            </p>
            <p className="mt-2 text-sm text-teal-500">
              No corporate jargon. No hype. Just short, useful recommendations from a directory that actually knows the city.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
