"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLogo } from "./NavLogo";
import { NavSearch } from "./NavSearch";
import type { SearchIndexItem } from "./HeroSearch";

type NavCategory = { name: string; slug: string };

export function Navbar({ categories = [], searchIndex = [] }: { categories?: NavCategory[]; searchIndex?: SearchIndexItem[] }) {
  const pathname = usePathname();

  return (
    <header className="nav-header sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur">
      <div className="container-page grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 md:h-20 md:gap-6">
        <Link href="/" className="flex items-center justify-self-start" aria-label="WhereToYEG home">
          <NavLogo height={44} />
        </Link>
        <nav className="hidden justify-self-center md:flex md:items-center md:gap-8">
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
          <Link href="/about" className="text-sm font-semibold text-teal transition hover:text-coral">About</Link>
          <Link href="/contact" className="text-sm font-semibold text-teal transition hover:text-coral">Contact</Link>
        </nav>
        <div className="flex items-center gap-3 justify-self-end">
          <NavSearch index={searchIndex} />
          <Link href="/get-listed" className="hidden shrink-0 whitespace-nowrap rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-500 md:inline-flex">
            Get Listed
          </Link>
        </div>
      </div>

      {/* Mobile nav strip — always visible, horizontally scrollable */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-line/50 px-4 py-2 md:hidden" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        <Link href="/search" className={mobilePill(pathname === "/search")}>Search</Link>
        <Link href="/#categories" className={mobilePill(false)}>Categories</Link>
        <Link href="/collections" className={mobilePill(pathname === "/collections")}>Vibes</Link>
        <Link href="/neighborhoods" className={mobilePill(pathname === "/neighborhoods")}>Areas</Link>
        <Link href="/blog" className={mobilePill(pathname === "/blog")}>Blog</Link>
        <Link href="/about" className={mobilePill(pathname === "/about")}>About</Link>
        <Link href="/contact" className={mobilePill(pathname === "/contact")}>Contact</Link>
        <Link href="/get-listed" className="shrink-0 whitespace-nowrap rounded-full bg-coral px-3 py-1.5 text-xs font-bold text-white">Get Listed</Link>
      </nav>
    </header>
  );
}

function mobilePill(active: boolean) {
  return "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition " +
    (active ? "bg-teal text-white" : "bg-mist text-teal hover:bg-teal-100");
}
