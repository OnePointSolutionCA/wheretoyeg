"use client";

import { useState } from "react";
import { ShareIcon } from "./icons";

export function ShareButton({ title, className }: { title: string; className: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // user dismissed the share sheet
    }
  }
  return (
    <button type="button" onClick={share} className={className}>
      <ShareIcon />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
