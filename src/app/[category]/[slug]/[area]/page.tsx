import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBusinessesBySubcategory, getCategoryBySlug, getSubcategory } from "@/lib/content";
import { HUB_MIN, allHubs, areaFromSlug } from "@/lib/areas";
import { areaSlug } from "@/lib/place";
import { AreaHub, areaHubMetadata } from "@/components/AreaHub";

/**
 * Subcategory in one area, e.g. /medical/dentists/st-albert or /restaurants/pizza/spruce-grove.
 * Exists from HUB_MIN listings; indexed from HUB_INDEX (see AreaHub).
 */

// Content only changes on deploy (every push and the daily refresh job rebuild everything),
// so a once a day safety refresh is enough and keeps Vercel cache writes low.
export const revalidate = 86400;

export async function generateStaticParams() {
  return allHubs()
    .filter((h) => h.sub)
    .map((h) => ({ category: h.category, slug: h.sub as string, area: areaSlug(h.area) }));
}

function load(params: { category: string; slug: string; area: string }) {
  const category = getCategoryBySlug(params.category);
  const sub = category && getSubcategory(params.category, params.slug);
  const area = areaFromSlug(params.area);
  if (!category || !sub || !area) return null;
  const businesses = getBusinessesBySubcategory(category.slug, sub.slug).filter((b) => b.neighborhood === area);
  if (businesses.length < HUB_MIN) return null;
  return { category, sub, area, businesses };
}

export async function generateMetadata({ params }: { params: { category: string; slug: string; area: string } }): Promise<Metadata> {
  const hub = load(params);
  return hub ? areaHubMetadata(hub) : {};
}

export default function SubcategoryAreaPage({ params }: { params: { category: string; slug: string; area: string } }) {
  const hub = load(params);
  if (!hub) notFound();
  return <AreaHub {...hub} />;
}
