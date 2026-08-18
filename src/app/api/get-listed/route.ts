import { NextResponse } from "next/server";
import { sendGetListedEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const data = await req.json().catch(() => ({}));

    if (typeof data.website_url === "string" && data.website_url.length > 0) {
      return NextResponse.json({ ok: true });
    }

    const businessName = String(data.businessName ?? "").trim();
    const contactName = String(data.contactName ?? "").trim();
    const email = String(data.email ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    const website = String(data.website ?? "").trim();
    const category = String(data.category ?? "").trim();
    const tier = String(data.tier ?? "").trim();
    const notes = String(data.notes ?? "").trim();

    if (!businessName || businessName.length < 2) return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    if (!contactName || contactName.length < 2) return NextResponse.json({ error: "Contact name is required." }, { status: 400 });
    if (!validEmail(email)) return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    if (notes.length > 5000) return NextResponse.json({ error: "Notes are too long." }, { status: 400 });

    await sendGetListedEmail({ businessName, contactName, email, phone, website, category, tier, notes });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("get-listed POST failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
