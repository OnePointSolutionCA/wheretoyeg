import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const data = await req.json().catch(() => ({}));

    // Honeypot — if a bot filled it, silently 200
    if (typeof data.website_url === "string" && data.website_url.length > 0) {
      return NextResponse.json({ ok: true });
    }

    const name = String(data.name ?? "").trim();
    const email = String(data.email ?? "").trim();
    const message = String(data.message ?? "").trim();
    const subject = String(data.subject ?? "").trim();

    if (!name || name.length < 2) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (!validEmail(email)) return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    if (!message || message.length < 5) return NextResponse.json({ error: "Message is too short." }, { status: 400 });
    if (message.length > 5000) return NextResponse.json({ error: "Message is too long." }, { status: 400 });

    await sendContactEmail({ name, email, message, subject: subject || undefined });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact POST failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
