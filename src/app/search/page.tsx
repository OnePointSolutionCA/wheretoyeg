import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchClient } from "./SearchClient";
import { SITE } from "@/lib/site";
import { getBusinesses, getCategories } from "@/lib/content";

export const metadata: Metadata = {
  title: "Search Edmonton businesses",
  description: `Search every business listed on ${SITE.name} by name, cuisine, service, or neighborhood.`,
  alternates: { canonical: `${SITE.url}/search` },
  robots: { index: false, follow: true },
};

// Categories for the picker, each with the services that actually have listings.
function searchCategories() {
  const filled = new Set(getBusinesses().map((b) => `${b.category}/${b.subcategory}`));
  return getCategories().map((c) => ({
    name: c.name,
    slug: c.slug,
    subs: (c.subcategories ?? []).filter((s) => filled.has(`${c.slug}/${s.slug}`)).map((s) => ({ name: s.name, slug: s.slug })),
  }));
}

export default function SearchPage() {
  return (
    <section className="container-page py-10 sm:py-14">
      <Suspense fallback={<div className="text-teal-500">Loading search…</div>}>
        <SearchClient neighborhoods={SITE.neighborhoods} categories={searchCategories()} />
      </Suspense>
    </section>
  );
}
