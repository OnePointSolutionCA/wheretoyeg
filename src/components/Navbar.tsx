"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NavLogo } from "./NavLogo";
import { NavSearch } from "./NavSearch";
import type { SearchIndexItem } from "./HeroSearch";

type NavCategory = { name: string; slug: string };

export function Navbar({ categories = [], searchIndex = [] }: { categories?: NavCategory[]; searchIndex?: SearchIndexItem[] }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<"categories" | null>(null);

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
      <div className="container-page grid h-20 grid-cols-[auto_1fr_auto] items-center gap-6">
        <Link href="/" className="flex items-center justify-self-start" aria-label="WhereToYEG home">
          <NavLogo height={56} />
        </Link>
        <nav className="hidden justify-self-center md:flex md:items-center md:gap-8">
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
                    href="/#categories"
                    onClick={(e) => {
                      setOpenMenu(null);
                      if (pathname === "/") {
                        e.preventDefault();
                        document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="flex items-center justify-between border-b border-line bg-mist/60 px-4 py-3 text-sm font-bold text-coral transition hover:bg-mist"
                  >
                    <span>See all categories</span>
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
          <Link href="/search" className="text-sm font-semibold text-teal transition hover:text-coral">Search</Link>
          <Link href="/blog" className="text-sm font-semibold text-teal transition hover:text-coral">Blog</Link>
          <Link href="/about" className="text-sm font-semibold text-teal transition hover:text-coral">About</Link>
          <Link href="/contact" className="text-sm font-semibold text-teal transition hover:text-coral">Contact</Link>
        </nav>
        <div className="flex items-center gap-3 justify-self-end">
          <NavSearch index={searchIndex} />
          <Link href="/get-listed" className="btn-primary shrink-0 whitespace-nowrap text-sm">
            Get Listed
          </Link>
        </div>
      </div>
    </header>
  );
}
