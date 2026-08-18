import { Suspense } from "react";
import { SearchClient } from "./SearchClient";
import { getBusinesses, getCategories } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Search Edmonton businesses",
  description: `Search across every business listed on ${SITE.name}.`,
};

export default function SearchPage() {
  const businesses = getBusinesses();
  const cats = Object.fromEntries(getCategories().map((c) => [c.slug, c.name]));
  return (
    <section className="container-page py-10">
      <Suspense fallback={<div className="text-teal-500">Loading search…</div>}>
        <SearchClient businesses={businesses} categoryNames={cats} neighborhoods={SITE.neighborhoods} />
      </Suspense>
    </section>
  );
}
