import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { AD_PLACEMENTS, ROTATION } from "@/lib/advertisers";
import { AD_PREFIX, edmontonDate } from "@/lib/adStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SPONSORS = new Set<string>(ROTATION);
const PLACES = new Set<string>(AD_PLACEMENTS);
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|monitor|facebookexternalhit|curl|wget|python|axios/i;

/** Records sponsor ad views and clicks. No personal data is kept: no IP, no cookies, no user agent. */
export async function POST(req: Request) {
  try {
    if (BOT.test(req.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });
    const body = await req.json().catch(() => null);
    const type = body?.type === "click" ? "click" : body?.type === "view" ? "view" : null;
    const items: unknown[] = Array.isArray(body?.items) ? body.items.slice(0, 20) : [];
    const pairs = new Set<string>();
    for (const it of items) {
      if (!Array.isArray(it) || it.length !== 2) continue;
      const [s, p] = it;
      if (typeof s === "string" && typeof p === "string" && SPONSORS.has(s) && PLACES.has(p)) pairs.add(`${s}_${p}`);
    }
    if (!type || !pairs.size) return new NextResponse(null, { status: 204 });
    if (type === "click" && pairs.size > 1) return new NextResponse(null, { status: 204 });
    if (!process.env.BLOB_READ_WRITE_TOKEN) return new NextResponse(null, { status: 204 });
    // Preview deployments never count, so test visits do not reach the sponsor report.
    if (process.env.VERCEL_ENV === "preview") return new NextResponse(null, { status: 204 });
    const name = `${AD_PREFIX}${edmontonDate()}/${type}/${[...pairs].sort().join("~")}/e.txt`;
    await put(name, "1", { access: "private", addRandomSuffix: true, contentType: "text/plain" });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("ad-event failed", err);
    return new NextResponse(null, { status: 204 });
  }
}
