"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

export const BADGE_SRC = `${SITE.url}/badge/wheretoyeg-badge.svg`;

/** The copy and paste HTML: one link, brand anchor text, pointing at the business's own listing. */
export function badgeHtml(listingUrl: string): string {
  return (
    `<a href="${listingUrl}" style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;border:1px solid #E4EAED;border-radius:999px;background:#fff;font:600 14px/1.2 Arial,Helvetica,sans-serif;color:#053F52;text-decoration:none">` +
    `<img src="${BADGE_SRC}" alt="" width="20" height="24" style="border:0">Find us on WhereToYEG</a>`
  );
}

/**
 * Small, collapsed box on listing pages: a free, optional badge a business can put on its own website.
 * It is never tied to ranking, reviews or any paid offer.
 */
export function BadgeSnippet({ listingUrl }: { listingUrl: string }) {
  const [copied, setCopied] = useState(false);
  const html = badgeHtml(listingUrl);

  async function copy() {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <details className="group rounded-2xl border border-line bg-mist">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-semibold text-teal [&::-webkit-details-marker]:hidden">
        <span>Got a website? Add your free WhereToYEG badge</span>
        <span aria-hidden="true" className="shrink-0 text-lg leading-none text-coral transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="min-w-0 space-y-3 px-5 pb-5 text-sm text-teal-500">
        <p>
          If this is your business, you can show this badge on your own website so customers can find your listing. It is free and
          optional, and it has no effect on your ranking or reviews here.
        </p>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-teal-300">Preview</p>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-2 pr-3.5 text-sm font-semibold text-teal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/badge/wheretoyeg-badge.svg" alt="" width={20} height={24} />
            Find us on WhereToYEG
          </span>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-teal-300">HTML to paste into your site</span>
          <textarea
            readOnly
            value={html}
            rows={5}
            onFocus={(e) => e.currentTarget.select()}
            className="block w-full resize-none break-all rounded-xl border border-line bg-white p-3 font-mono text-xs text-teal"
          />
        </label>
        <button type="button" onClick={copy} className="btn-primary min-h-[44px] text-sm">
          {copied ? "Copied" : "Copy the code"}
        </button>
      </div>
    </details>
  );
}
