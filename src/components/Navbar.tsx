"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NavLogo } from "./NavLogo";
import { NavSearch } from "./NavSearch";

type NavCategory = { name: string; slug: string };

export function Navbar({ categories = [] }: { categories?: NavCategory[] }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<"categories" | "mobile-categories" | null>(null);

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!openMenu) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest?.("[data-nav-menu]")) setOpenMenu(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenu]);

  return (
    <header className="nav-header sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur">
      <div className="container-page grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 md:h-20 md:gap-6">
        <Link href="/" className="flex items-center justify-self-start" aria-label="WhereToYEG home">
          <NavLogo height={44} />
        </Link>
        <nav className="hidden justify-self-center lg:flex lg:items-center lg:gap-6 xl:gap-8">
          {/* Categories dropdown */}
          {categories.length > 0 && (
            <div className="relative" data-nav-menu>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === "categories" ? null : "categories"); }}
                className={"flex items-center gap-1 text-sm font-semibold transition " + (openMenu === "categories" ? "text-coral" : "text-teal hover:text-coral")}
                aria-expanded={openMenu === "categories"}
              >
                Categories <span className="text-xs">▾</span>
              </button>
              {openMenu === "categories" && (
                <div className="dropdown-anim absolute left-1/2 top-full z-50 mt-3 w-[520px] -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
                  <Link
                    href="/categories"
                    onClick={() => setOpenMenu(null)}
                    className="flex items-center justify-between border-b border-line bg-mist/60 px-4 py-3 text-sm font-bold text-coral transition hover:bg-mist"
                  >
                    <span>Every category and service</span>
                    <span aria-hidden>→</span>
                  </Link>
                  <div className="grid grid-cols-2 gap-1 p-3">
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/${c.slug}`}
                        onClick={() => setOpenMenu(null)}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-teal transition hover:bg-mist hover:text-coral"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <a
            href="/#categories"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="text-sm font-semibold text-teal transition hover:text-coral"
          >
            Browse
          </a>
          <Link href="/collections" className="text-sm font-semibold text-teal transition hover:text-coral">Vibes</Link>
          <Link href="/neighborhoods" className="text-sm font-semibold text-teal transition hover:text-coral">Neighborhoods</Link>
          <Link href="/blog" className="text-sm font-semibold text-teal transition hover:text-coral">Blog</Link>
          <Link href="/about" className="hidden text-sm font-semibold text-teal transition hover:text-coral xl:inline">About</Link>
          <Link href="/contact" className="hidden text-sm font-semibold text-teal transition hover:text-coral xl:inline">Contact</Link>
        </nav>
        <div className="flex items-center gap-3 justify-self-end">
          <NavSearch />
          <Link href="/get-listed" className="shrink-0 whitespace-nowrap rounded-full bg-coral px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-coral-500 md:px-5 md:py-2.5 md:text-sm">
            Get Listed
          </Link>
        </div>
      </div>

      {/* Mobile nav strip — always visible, horizontally scrollable */}
      <nav className="flex items-center gap-1 overflow-x-auto overscroll-x-contain touch-pan-x border-t border-line/50 px-4 py-2 lg:hidden" style={{ scrollbarWidth: "none" }}>
        {categories.length > 0 ? (
          <button
            type="button"
            data-nav-menu
            onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === "mobile-categories" ? null : "mobile-categories"); }}
            className={mobilePill(openMenu === "mobile-categories" || pathname === "/categories") + " inline-flex items-center gap-1"}
            aria-expanded={openMenu === "mobile-categories"}
            aria-controls="mobile-categories"
          >
            Categories <span className="text-[10px]" aria-hidden>{openMenu === "mobile-categories" ? "▴" : "▾"}</span>
          </button>
        ) : (
          <Link href="/categories" className={mobilePill(pathname === "/categories")}>Categories</Link>
        )}
        <Link href="/collections" className={mobilePill(pathname === "/collections")}>Vibes</Link>
        <Link href="/neighborhoods" className={mobilePill(pathname === "/neighborhoods")}>Areas</Link>
        <Link href="/blog" className={mobilePill(pathname === "/blog")}>Blog</Link>
        <Link href="/about" className={mobilePill(pathname === "/about")}>About</Link>
        <Link href="/contact" className={mobilePill(pathname === "/contact")}>Contact</Link>
      </nav>

      {/* Mobile categories panel */}
      {openMenu === "mobile-categories" && (
        <div
          id="mobile-categories"
          data-nav-menu
          className="dropdown-anim max-h-[70vh] overflow-y-auto overscroll-contain border-t border-line bg-white shadow-lift lg:hidden"
        >
          <div className="grid grid-cols-2 gap-1 px-3 py-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                onClick={() => setOpenMenu(null)}
                className={
                  "flex min-h-[44px] items-center rounded-xl px-3 text-sm font-semibold transition " +
                  (pathname === `/${c.slug}` || pathname.startsWith(`/${c.slug}/`) ? "bg-teal text-white" : "bg-mist/60 text-teal active:bg-mist")
                }
              >
                {c.name}
              </Link>
            ))}
          </div>
          <Link
            href="/categories"
            onClick={() => setOpenMenu(null)}
            className="flex min-h-[48px] items-center justify-between border-t border-line bg-mist/60 px-4 text-sm font-bold text-coral"
          >
            <span>Every category and service</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </header>
  );
}

function mobilePill(active: boolean) {
  return "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition " +
    (active ? "bg-teal text-white" : "bg-mist text-teal hover:bg-teal-100");
}
