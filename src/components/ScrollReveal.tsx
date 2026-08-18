"use client";

import { useEffect } from "react";

export function ScrollRevealProvider() {
  useEffect(() => {
    document.documentElement.classList.add("js-reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    function processElements() {
      document.querySelectorAll("[data-reveal]:not(.revealed):not(.no-anim)").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 40 && rect.bottom > -40) {
          el.classList.add("revealed");
        } else {
          io.observe(el);
        }
      });
    }

    processElements();

    const mo = new MutationObserver(processElements);
    mo.observe(document.body, { childList: true, subtree: true });

    const safety = setTimeout(() => {
      document.querySelectorAll("[data-reveal]:not(.revealed)").forEach((el) => {
        el.classList.add("revealed");
      });
    }, 2000);

    return () => {
      io.disconnect();
      mo.disconnect();
      clearTimeout(safety);
    };
  }, []);

  return null;
}
