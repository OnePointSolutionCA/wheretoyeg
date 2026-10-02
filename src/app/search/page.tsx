import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchClient } from "./SearchClient";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Search Edmonton businesses",
  description: `Search every business listed on ${SITE.name} by name, cuisine, service, or neighborhood.`,
  alternates: { canonical: `${SITE.url}/search` },
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <section className="container-page py-10 sm:py-14">
      <Suspense fallback={<div className="text-teal-500">Loading search…</div>}>
        <SearchClient neighborhoods={SITE.neighborhoods} />
      </Suspense>
    </section>
  );
}
