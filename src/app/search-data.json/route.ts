import { getBusinesses, getCategories } from "@/lib/content";
import { toCard, type SearchBusiness } from "@/lib/slim";

export const dynamic = "force-static";
// Content only changes on deploy (every push and the daily refresh job rebuild everything),
// so a once a day safety refresh is enough and keeps Vercel cache writes low.
export const revalidate = 86400;

export function GET() {
  const cats = new Map(getCategories().map((c) => [c.slug, c]));
  const data: SearchBusiness[] = getBusinesses().map((b) => {
    const c = cats.get(b.category);
    return {
      ...toCard(b),
      catName: c?.name ?? b.category,
      subName: c?.subcategories?.find((s) => s.slug === b.subcategory)?.name,
      keywords: b.tags ?? [],
    };
  });
  return Response.json(data);
}
