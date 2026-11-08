import { buildSearchIndex } from "@/lib/searchIndex";

export const dynamic = "force-static";
// Content only changes on deploy (every push and the daily refresh job rebuild everything),
// so a once a day safety refresh is enough and keeps Vercel cache writes low.
export const revalidate = 86400;

export function GET() {
  return Response.json(buildSearchIndex());
}
