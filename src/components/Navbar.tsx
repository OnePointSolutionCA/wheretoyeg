import Link from "next/link";
import { NavLogo } from "./NavLogo";

const NAV = [
  { href: "/#categories", label: "Browse" },
  { href: "/neighborhoods", label: "Neighborhoods" },
  { href: "/search", label: "Search" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur">
      <div className="container-page grid h-20 grid-cols-[auto_1fr_auto] items-center gap-6">
        <Link href="/" className="flex items-center justify-self-start" aria-label="WhereToYEG home">
          <NavLogo height={56} />
        </Link>
        <nav className="hidden justify-self-center md:flex md:items-center md:gap-8">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-semibold text-teal transition hover:text-coral"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="justify-self-end">
          <Link href="/get-listed" className="btn-primary text-sm">
            Get Listed
          </Link>
        </div>
      </div>
    </header>
  );
}
