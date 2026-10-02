import { getBusinesses, getCategories } from "@/lib/content";
import { toCard, type SearchBusiness } from "@/lib/slim";

export const dynamic = "force-static";
export const revalidate = 3600;

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
