"use client";

import { useEffect } from "react";

/**
 * Motion for the magazine homepage: Lenis smooth scroll (wheel only) + GSAP ScrollTrigger.
 * One signature moment: category cards dealt out over "YEG.".
 * Reduced motion (or any error): nothing is hidden or moved, every element shows its final state.
 * Everything is torn down on unmount so other pages keep native scrolling.
 */
export function MagMotion() {
  useEffect(() => {
    const html = document.documentElement;
    const root = document.querySelector<HTMLElement>("[data-mag-root]");
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled) return;
      try {
        gsap.registerPlugin(ScrollTrigger);

        // A refresh always opens at the top (the layout script handles the native position).
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        if (nav?.type === "reload" || window.scrollY < 4) window.scrollTo(0, 0);

        const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, syncTouch: false, gestureOrientation: "vertical" });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (t: number) => lenis.raf(t * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        if (nav?.type === "reload") lenis.scrollTo(0, { immediate: true });

        html.classList.add("js-mag");
        const mm = gsap.matchMedia();

        const ctx = gsap.context(() => {
          // Reveal headings and lines once.
          gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((el) => {
            gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
          });

          // Hero: the giant word drifts slower than the page, the pyramid lifts a little.
          const hero = root.querySelector("[data-mag-hero]");
          if (hero) {
            gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 } })
              .to("[data-mag-word]", { yPercent: 18, ease: "none" }, 0)
              .to("[data-mag-cutout]", { yPercent: -10, ease: "none" }, 0);
          }

          // River valley line art draws in.
          const paths = gsap.utils.toArray<SVGPathElement>("[data-mag-art] [data-draw]");
          if (paths.length) {
            gsap.fromTo(paths, { strokeDashoffset: 1 }, {
              strokeDashoffset: 0, ease: "none", stagger: 0.04,
              scrollTrigger: { trigger: "[data-mag-art]", start: "top 85%", end: "bottom 45%", scrub: 0.8 },
            });
          }

          // Signature: the deck sits stacked on "YEG.", scroll deals the cards into a fan.
          const deal = root.querySelector<HTMLElement>("[data-mag-deal]");
          const cards = gsap.utils.toArray<HTMLElement>("[data-mag-card]");
          if (deal && cards.length) {
            mm.add({ wide: "(min-width: 768px)", narrow: "(max-width: 767px)" }, (c) => {
              const wide = !!c.conditions?.wide;
              const table = deal.querySelector<HTMLElement>(".mag-deal__table");
              const spread = () => {
                const w = table?.clientWidth ?? window.innerWidth;
                return wide ? Math.min(w * 0.4, 400) : Math.min(window.innerWidth * 0.31, 150);
              };
              const tl = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: { trigger: deal, start: "top top", end: wide ? "+=130%" : "+=110%", pin: "[data-mag-deal-pin]", scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true },
              });
              cards.forEach((card, i) => {
                const t = Number(card.dataset.t) || 0;
                tl.fromTo(
                  card,
                  { xPercent: -50, yPercent: 0, x: () => t * 6, y: () => (wide ? 140 : 90) + i * -2, rotation: t * 4 },
                  { xPercent: -50, yPercent: 0, x: () => t * spread(), y: () => t * t * (wide ? 42 : 26), rotation: t * (wide ? 22 : 18) },
                  0,
                );
              });
              tl.fromTo("[data-mag-yeg]", { scale: 0.9 }, { scale: 1, transformOrigin: "50% 70%" }, 0);
              return () => tl.scrollTrigger?.kill();
            });
          }
        }, root);

        // Fonts change the size of the giant words: measure again once they load.
        document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh());

        cleanup = () => {
          mm.revert();
          ctx.revert();
          gsap.ticker.remove(tick);
          lenis.destroy();
          html.classList.remove("js-mag");
        };
      } catch (err) {
        // Never leave content hidden or offset if something fails.
        html.classList.remove("js-mag");
        console.warn("magazine motion off", err);
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
