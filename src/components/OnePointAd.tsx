import Image from "next/image";

type Placement = "category-footer" | "business-sidebar" | "blog-sidebar" | "blog-footer" | "search-top";
type Variant = "banner" | "sidebar";

const BASE = "https://onepointsolution.ca";
const AUDIT = `${BASE}/free-seo-audit/`;

function link(href: string, placement: Placement) {
  const u = new URL(href);
  u.searchParams.set("utm_source", "wheretoyeg");
  u.searchParams.set("utm_medium", "ad");
  u.searchParams.set("utm_campaign", placement);
  return u.toString();
}

/**
 * Display ad for OnePoint Solutions. Two shapes:
 * - banner: full width horizontal strip for category and blog pages
 * - sidebar: compact card for business and blog sidebars
 * Every click adds utm params so Ahrefs can show the referral traffic by placement.
 */
export function OnePointAd({ placement, variant }: { placement: Placement; variant: Variant }) {
  if (variant === "sidebar") return <SidebarAd placement={placement} />;
  return <BannerAd placement={placement} />;
}

function BannerAd({ placement }: { placement: Placement }) {
  return (
    <aside
      aria-label="Sponsored message from OnePoint Solutions"
      className="relative overflow-hidden rounded-3xl bg-[#2D3E50] text-white shadow-lift ring-1 ring-white/10"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#D97B2B]/40 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-[#D97B2B]/15 blur-3xl" aria-hidden="true" />
      <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70">Sponsored</span>
      <div className="relative flex flex-col gap-6 p-6 sm:p-10 lg:flex-row lg:items-center lg:gap-10">
        <div className="min-w-0 flex-1">
          <Image src="/logos/onepoint-horizontal.png" alt="OnePoint Solutions Marketing Agency" width={192} height={48} className="h-10 w-auto brightness-0 invert" />
          <h3 className="mt-4 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            Show up when Edmontonians <span className="text-[#F2A26B]">search for you</span>.
          </h3>
          <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
            OnePoint Solutions builds websites and runs SEO, Google Business Profile and social for Edmonton businesses. Transparent monthly pricing, no contracts.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-semibold text-white/70 sm:text-sm">
            <li>Websites from $499</li>
            <li>SEO from $300/mo</li>
            <li>Social from $300/mo</li>
          </ul>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
          <a
            href={link(AUDIT, placement)}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#D97B2B] px-6 text-sm font-bold text-white transition hover:bg-[#c56a1e]"
          >
            Get a Free SEO Audit <span aria-hidden>→</span>
          </a>
          <a
            href={link(BASE, placement)}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white hover:text-[#2D3E50]"
          >
            Visit OnePoint
          </a>
        </div>
      </div>
    </aside>
  );
}

function SidebarAd({ placement }: { placement: Placement }) {
  return (
    <aside
      aria-label="Sponsored message from OnePoint Solutions"
      className="relative overflow-hidden rounded-2xl bg-[#2D3E50] p-5 text-white shadow-card ring-1 ring-white/10"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#D97B2B]/35 blur-2xl" aria-hidden="true" />
      <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60">Ad</span>
      <div className="relative">
        <Image src="/logos/onepoint-horizontal.png" alt="OnePoint Solutions" width={160} height={40} className="h-7 w-auto brightness-0 invert" />
        <p className="mt-4 font-display text-lg font-bold leading-snug">
          Grow your Edmonton business.
        </p>
        <p className="mt-2 text-sm text-white/80">
          SEO, Google Business Profile, social and websites. Monthly plans, no contracts.
        </p>
        <a
          href={link(AUDIT, placement)}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="mt-4 inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-full bg-[#D97B2B] px-4 text-sm font-bold text-white transition hover:bg-[#c56a1e]"
        >
          Free SEO Audit <span aria-hidden>→</span>
        </a>
        <a
          href={link(BASE, placement)}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="mt-2 block text-center text-xs font-semibold text-white/70 transition hover:text-white"
        >
          onepointsolution.ca
        </a>
      </div>
    </aside>
  );
}
