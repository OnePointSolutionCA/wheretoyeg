import { buildSearchIndex } from "@/lib/searchIndex";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return Response.json(buildSearchIndex());
}
