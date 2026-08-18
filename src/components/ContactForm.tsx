"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website_url, setHoney] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, website_url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to send.");
      setState("sent");
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral/10 text-2xl">
          <span aria-hidden>✓</span>
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold text-teal">Message sent.</h3>
        <p className="mt-2 text-teal-500">
          We&apos;ll get back to you within 1 business day. Usually much sooner.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-4 text-sm font-semibold text-coral hover:underline"
        >
          Send another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* honeypot */}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <label>
          Website (leave blank)
          <input tabIndex={-1} autoComplete="off" value={website_url} onChange={(e) => setHoney(e.target.value)} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-500">Name</span>
          <input
            required minLength={2}
            value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-teal focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-500">Email</span>
          <input
            type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-teal focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-500">Subject <span className="font-normal normal-case text-teal-300">(optional)</span></span>
        <input
          value={subject} onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-teal focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
          placeholder="What's this about?"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-500">Message</span>
        <textarea
          required minLength={5} rows={6}
          value={message} onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-teal focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
          placeholder="Tell us what's on your mind."
        />
      </label>

      {state === "error" && (
        <div className="rounded-xl border border-coral bg-coral/5 px-4 py-3 text-sm text-coral">{error}</div>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="btn-primary w-full text-base disabled:opacity-60 sm:w-auto"
      >
        {state === "sending" ? "Sending…" : "Send message →"}
      </button>
    </form>
  );
}
