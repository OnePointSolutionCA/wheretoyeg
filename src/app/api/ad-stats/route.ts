import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { list } from "@vercel/blob";
import { AD_PREFIX, edmontonDate } from "@/lib/adStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

function authorized(req: Request): boolean {
  const want = process.env.AD_STATS_TOKEN ?? "";
  if (want.length < 24) return false;
  const auth = req.headers.get("authorization") ?? "";
  const got = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const a = Buffer.from(got);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

function daysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  const end = Date.parse(`${to}T00:00:00Z`);
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= end && out.length < 93; t += 86_400_000) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

type Counts = { views: number; clicks: number };
const zero = (): Counts => ({ views: 0, clicks: 0 });

/**
 * Private daily report of sponsor ad views and clicks.
 *   GET /api/ad-stats?day=YYYY-MM-DD
 *   GET /api/ad-stats?from=YYYY-MM-DD&to=YYYY-MM-DD   (up to 93 days)
 * Auth: header "Authorization: Bearer <AD_STATS_TOKEN>". Days are Edmonton dates.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const day = url.searchParams.get("day");
  const from = url.searchParams.get("from") ?? day ?? edmontonDate();
  const to = url.searchParams.get("to") ?? day ?? from;
  if (!DAY.test(from) || !DAY.test(to) || from > to) {
    return NextResponse.json({ error: "Use day=YYYY-MM-DD or from=YYYY-MM-DD&to=YYYY-MM-DD" }, { status: 400 });
  }

  const totals: Record<string, Counts> = {};
  const bySponsorPlacement: Record<string, Record<string, Counts>> = {};
  const byDay: Record<string, Record<string, Counts>> = {};

  for (const d of daysBetween(from, to)) {
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: `${AD_PREFIX}${d}/`, limit: 1000, cursor });
      for (const blob of page.blobs) {
        // ad/<day>/<type>/<pairs>/<file>
        const parts = blob.pathname.split("/");
        const type = parts[2] === "click" ? "clicks" : parts[2] === "view" ? "views" : null;
        if (!type || !parts[3]) continue;
        for (const pair of parts[3].split("~")) {
          const dot = pair.indexOf(".");
          if (dot < 1) continue;
          const sponsor = pair.slice(0, dot);
          const placement = pair.slice(dot + 1);
          (totals[sponsor] ??= zero())[type]++;
          ((bySponsorPlacement[sponsor] ??= {})[placement] ??= zero())[type]++;
          ((byDay[d] ??= {})[sponsor] ??= zero())[type]++;
        }
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  }

  return NextResponse.json(
    { from, to, timezone: "Edmonton (UTC-6)", totals, bySponsorPlacement, byDay, generatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
