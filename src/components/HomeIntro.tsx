"use client";

import { useEffect } from "react";

/**
 * Cinematic homepage intro trigger.
 * - Adds `page-home` to <html> so scoped intro CSS kicks in.
 * - After 1050ms, marks the hero as `is-ready` so hero copy staggers in.
 * - Cleans everything up on unmount so navigating away doesn't leak the class.
 */
export function HomeIntro() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("page-home");

    const t = setTimeout(() => {
      document.querySelector(".hero")?.classList.add("is-ready");
    }, 1050);

    return () => {
      clearTimeout(t);
      html.classList.remove("page-home");
      document.querySelector(".hero")?.classList.remove("is-ready");
    };
  }, []);

  return null;
}
