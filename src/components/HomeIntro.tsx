"use client";

import { useEffect } from "react";

export function HomeIntro() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("intro-played")) return;
      sessionStorage.setItem("intro-played", "1");
    } catch {
      return;
    }

    const html = document.documentElement;
    html.classList.add("page-home");

    const t = setTimeout(() => {
      document.querySelector(".hero")?.classList.add("is-ready");
    }, 1500);

    return () => {
      clearTimeout(t);
      html.classList.remove("page-home");
      document.querySelector(".hero")?.classList.remove("is-ready");
    };
  }, []);

  return null;
}
