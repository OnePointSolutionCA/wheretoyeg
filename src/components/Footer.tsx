import Link from "next/link";
import { SITE } from "@/lib/site";
import { areaSlug } from "@/lib/place";
import { getCategories } from "@/lib/content";

export function Footer() {
  const cats = getCategories();
  return (
    <footer className="mt-24 border-t border-line bg-mist">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="font-display text-xl font-extrabold text-teal">WhereToYEG</div>
          <p className="mt-2 max-w-xs text-sm text-teal-500">{SITE.description}</p>
          <a href={`mailto:${SITE.deliveryEmail}`} className="mt-4 inline-block text-sm font-semibold text-teal hover:text-coral">
            {SITE.email}
          </a>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-coral">Explore</div>
          <ul className="mt-3 space-y-2 text-sm">
            {cats.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="text-teal hover:text-coral">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/halal-restaurants" className="text-teal hover:text-coral">
                Halal Restaurants
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-coral">Neighborhoods</div>
          <ul className="mt-3 space-y-2 text-sm">
            {SITE.neighborhoods.slice(0, 8).map((n) => (
              <li key={n}>
                <Link
                  href={`/neighborhoods/${areaSlug(n)}`}
                  className="text-teal hover:text-coral"
                >
                  {n}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-coral">Company</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="text-teal hover:text-coral">About</Link></li>
            <li><Link href="/blog" className="text-teal hover:text-coral">Blog</Link></li>
            <li><Link href="/contact" className="text-teal hover:text-coral">Contact</Link></li>
            <li><Link href="/get-listed" className="text-teal hover:text-coral">Get Listed</Link></li>
            <li><Link href="/privacy" className="text-teal hover:text-coral">Privacy</Link></li>
            <li><Link href="/terms" className="text-teal hover:text-coral">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-teal-500 sm:flex-row">
          <span>© {new Date().getFullYear()} WhereToYEG · Edmonton, AB</span>
          <a
            href="https://onepointsolution.ca"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-teal-500 transition hover:text-coral"
          >
            Powered by <span className="text-teal">OnePoint Solutions Marketing Agency</span>
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
