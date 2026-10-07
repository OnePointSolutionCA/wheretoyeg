import type { AdvertiserId } from "@/lib/advertisers";
import { advertiser } from "@/lib/advertisers";

type Placement = "category-footer" | "business-sidebar" | "blog-sidebar" | "blog-footer" | "search-top";
type Variant = "banner" | "sidebar";

function withUtm(href: string, advertiserId: AdvertiserId, placement: Placement) {
  // Phone links can't take query strings.
  if (href.startsWith("tel:") || href.startsWith("mailto:")) return href;
  const u = new URL(href);
  u.searchParams.set("utm_source", "wheretoyeg");
  u.searchParams.set("utm_medium", "ad");
  u.searchParams.set("utm_campaign", `${advertiserId}-${placement}`);
  return u.toString();
}

/**
 * Display ad slot. Two shapes:
 * - banner: full width horizontal strip for category and blog pages
 * - sidebar: compact card for business and blog sidebars
 * Props keep the OnePointAd name so earlier page wiring still works; `advertiser`
 * selects which brand's creative renders.
 */
export function OnePointAd({
  placement,
  variant,
  advertiser: id = "onepoint",
}: {
  placement: Placement;
  variant: Variant;
  advertiser?: AdvertiserId;
}) {
  const ad = advertiser(id);
  return variant === "sidebar" ? <SidebarAd ad={ad} placement={placement} /> : <BannerAd ad={ad} placement={placement} />;
}

function BannerAd({ ad, placement }: { ad: ReturnType<typeof advertiser>; placement: Placement }) {
  const primary = withUtm(ad.primary.href, ad.id, placement);
  const secondary = withUtm(ad.secondary.href, ad.id, placement);
  return (
    <aside
      aria-label={`Sponsored message from ${ad.name}`}
      className="relative overflow-hidden rounded-3xl text-white shadow-lift ring-1 ring-white/10"
      style={{ backgroundColor: ad.bg }}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: `${ad.accent}66` }} aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: `${ad.accent}22` }} aria-hidden="true" />
      <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70">Sponsored</span>
      <div className="relative flex flex-col gap-6 p-6 sm:p-10 lg:flex-row lg:items-center lg:gap-10">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-3 rounded-xl bg-white p-2.5 shadow-md">
            {/* Logo renders in its own white chip so every advertiser's full-colour mark reads cleanly. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ad.logoSrc} alt={ad.logoAlt} style={{ height: `${ad.logoHeightPx}px`, width: "auto", display: "block" }} />
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-white/60">{ad.tagline}</p>
          <h3 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            {ad.headline} <span style={{ color: ad.accentSoft }}>{ad.highlight}</span>
          </h3>
          <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">{ad.blurb}</p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-semibold text-white/70 sm:text-sm">
            {ad.bullets.map((b) => (<li key={b}>{b}</li>))}
          </ul>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
          <a
            href={primary}
            target={primary.startsWith("tel:") ? undefined : "_blank"}
            rel="sponsored noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-sm font-bold text-white transition hover:opacity-90"
            style={{ backgroundColor: ad.accent }}
          >
            {ad.primary.label} <span aria-hidden>→</span>
          </a>
          <a
            href={secondary}
            target={secondary.startsWith("tel:") ? undefined : "_blank"}
            rel="sponsored noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white"
            style={{ color: "white" }}
          >
            {ad.secondary.label}
          </a>
        </div>
      </div>
    </aside>
  );
}

function SidebarAd({ ad, placement }: { ad: ReturnType<typeof advertiser>; placement: Placement }) {
  const primary = withUtm(ad.primary.href, ad.id, placement);
  const secondary = withUtm(ad.secondary.href, ad.id, placement);
  return (
    <aside
      aria-label={`Sponsored message from ${ad.name}`}
      className="relative overflow-hidden rounded-2xl text-white shadow-card ring-1 ring-white/10"
      style={{ backgroundColor: ad.bg }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl" style={{ backgroundColor: `${ad.accent}60` }} aria-hidden="true" />
      <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60">Ad</span>
      <div className="relative p-5">
        <div className="inline-flex items-center gap-2 rounded-lg bg-white p-2 shadow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.logoSrc} alt={ad.logoAlt} style={{ height: `${Math.min(ad.logoHeightPx, 30)}px`, width: "auto", display: "block" }} />
        </div>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">{ad.tagline}</p>
        <p className="mt-1 font-display text-lg font-bold leading-snug">
          {ad.headline} <span style={{ color: ad.accentSoft }}>{ad.highlight}</span>
        </p>
        <p className="mt-2 text-sm text-white/80">{ad.blurb}</p>
        <a
          href={primary}
          target={primary.startsWith("tel:") ? undefined : "_blank"}
          rel="sponsored noopener noreferrer"
          className="mt-4 inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold text-white transition hover:opacity-90"
          style={{ backgroundColor: ad.accent }}
        >
          {ad.primary.label} <span aria-hidden>→</span>
        </a>
        <a
          href={secondary}
          target={secondary.startsWith("tel:") ? undefined : "_blank"}
          rel="sponsored noopener noreferrer"
          className="mt-2 block text-center text-xs font-semibold text-white/70 transition hover:text-white"
        >
          {ad.secondary.label}
        </a>
      </div>
    </aside>
  );
}
