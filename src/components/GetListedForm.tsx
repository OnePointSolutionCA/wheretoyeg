"use client";

import { useState } from "react";

const CATEGORIES = [
  "Restaurants", "Cafes & Coffee Shops", "Bakeries", "Grocery & Markets",
  "Barbers", "Hair Salons", "Nail Salons", "Lash Techs", "Spas & Esthetics",
  "Medical Care", "Gyms & Fitness", "Auto Repair", "Cleaning Services",
  "Photographers", "Plumbers", "Electricians", "Catering", "Henna Artists",
  "Activities & Fun", "Professional Services", "Other",
];

const TIERS = ["Basic — $25/mo", "Featured — $50/mo", "Premium — $100/mo", "Not sure yet"];

export function GetListedForm({ defaultTier }: { defaultTier?: string }) {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");
  const [tier, setTier] = useState(defaultTier ?? "");
  const [notes, setNotes] = useState("");
  const [website_url, setHoney] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/get-listed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, contactName, email, phone, website, category, tier, notes, website_url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to submit.");
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral/10 text-2xl">
          <span aria-hidden>🎉</span>
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold text-teal">Request received.</h3>
        <p className="mt-2 text-teal-500">
          We&apos;ll email you back within 1 business day to confirm details and get your listing live.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <label>Website (leave blank)<input tabIndex={-1} autoComplete="off" value={website_url} onChange={(e) => setHoney(e.target.value)} /></label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-500">Business name</span>
          <input required minLength={2}
            value={businessName} onChange={(e) => setBusinessName(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-teal focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            placeholder="Your business" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-500">Your name</span>
          <input required minLength={2}
            value={contactName} onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-teal focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            placeholder="Who should we reply to?" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-500">Email</span>
          <input type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-teal focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            placeholder="you@business.com" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-500">Phone <span className="font-normal normal-case text-teal-300">(optional)</span></span>
          <input type="tel"
            value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-teal focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            placeholder="780-555-0100" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-500">Website or social <span className="font-normal normal-case text-teal-300">(optional)</span></span>
        <input
          value={website} onChange={(e) => setWebsite(e.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-teal focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
          placeholder="https://yourbusiness.com or @yourhandle" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-500">Category</span>
          <select
            value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-teal focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20">
            <option value="">Pick a category</option>
            {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-500">Plan you&apos;re interested in</span>
          <select
            value={tier} onChange={(e) => setTier(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-teal focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20">
            <option value="">Pick a plan</option>
            {TIERS.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-500">Anything we should know? <span className="font-normal normal-case text-teal-300">(optional)</span></span>
        <textarea rows={4}
          value={notes} onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-teal focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
          placeholder="Tell us about your business, or ask a question." />
      </label>

      {state === "error" && (
        <div className="rounded-xl border border-coral bg-coral/5 px-4 py-3 text-sm text-coral">{error}</div>
      )}

      <button type="submit" disabled={state === "sending"} className="btn-primary w-full text-base disabled:opacity-60 sm:w-auto">
        {state === "sending" ? "Submitting…" : "Submit request →"}
      </button>
    </form>
  );
}
