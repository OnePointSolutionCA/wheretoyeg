"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * When WhereToYEG is opened from the home screen there is no browser back button,
 * so show a small one (only in that mode, never on the normal website).
 */
export function StandaloneBack() {
  const pathname = usePathname();
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    setStandalone(window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true);
  }, []);
  if (!standalone || pathname === "/") return null;
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? window.history.back() : (window.location.href = "/"))}
      aria-label="Go back"
      className="fixed left-3 z-50 flex h-11 items-center gap-1 rounded-full bg-teal px-4 text-sm font-semibold text-white shadow-lift"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 14px)" }}
    >
      <span aria-hidden="true">‹</span> Back
    </button>
  );
}
