import Image from "next/image";
import type { Advertiser, AdvertiserId } from "@/lib/advertisers";
import { adHref, advertiser } from "@/lib/advertisers";

type Placement = "category-footer" | "business-sidebar" | "blog-sidebar" | "blog-footer" | "search-top";
type Variant = "banner" | "sidebar";

/**
 * Sponsor ad slot. Two shapes:
 * - banner: wide card for category and blog pages (photo beside the copy, stacked on phones)
 * - sidebar: compact card for business and blog sidebars
 * Each ad is a real photo, the sponsor's logo, one short line and one button.
 * Props keep the OnePointAd name so earlier page wiring still works; `advertiser`
 * selects which sponsor renders.
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
  const href = adHref(ad.cta.href, ad.id, placement);
  return variant === "sidebar" ? <SidebarAd ad={ad} href={href} /> : <BannerAd ad={ad} href={href} />;
}

function Logo({ ad, maxHeight }: { ad: Advertiser; maxHeight: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ad.logoSrc}
      alt={ad.logoAlt}
      width={ad.logoSize[0]}
      height={ad.logoSize[1]}
      loading="lazy"
      decoding="async"
      style={{
        height: `${Math.min(ad.logoHeightPx, maxHeight)}px`,
        width: "auto",
        maxWidth: "100%",
        display: "block",
        alignSelf: "flex-start",
        objectFit: "contain",
      }}
    />
  );
}

function Cta({ ad, href, className = "" }: { ad: Advertiser; href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={
        "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-7 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md " +
        className
      }
      style={{ backgroundColor: ad.color }}
    >
      {ad.cta.label} <span aria-hidden>→</span>
    </a>
  );
}

function BannerAd({ ad, href }: { ad: Advertiser; href: string }) {
  return (
    <aside
      aria-label={`Sponsored message from ${ad.name}`}
      className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-line"
    >
      <div className="grid sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative aspect-[3/2] sm:aspect-auto sm:min-h-[280px]">
          <Image src={ad.photo.src} alt={ad.photo.alt} fill sizes="(min-width: 1024px) 480px, (min-width: 640px) 42vw, 100vw" className="object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm">
            Sponsored
          </span>
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-10" style={{ backgroundColor: ad.tint }}>
          <Logo ad={ad} maxHeight={72} />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: ad.color }}>
            {ad.kicker}
          </p>
          <p className="mt-2 max-w-md font-display text-2xl font-extrabold leading-snug tracking-tight text-teal sm:text-[1.75rem]">
            {ad.line}
          </p>
          <Cta ad={ad} href={href} className="mt-6 w-full sm:w-auto sm:self-start" />
        </div>
      </div>
    </aside>
  );
}

function SidebarAd({ ad, href }: { ad: Advertiser; href: string }) {
  return (
    <aside
      aria-label={`Sponsored message from ${ad.name}`}
      className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line"
    >
      <div className="relative aspect-[3/2]">
        <Image src={ad.photo.src} alt={ad.photo.alt} fill sizes="(min-width: 1024px) 340px, 100vw" className="object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm">
          Ad
        </span>
      </div>
      <div className="p-5" style={{ backgroundColor: ad.tint }}>
        <Logo ad={ad} maxHeight={64} />
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: ad.color }}>
          {ad.kicker}
        </p>
        <p className="mt-1.5 font-display text-lg font-bold leading-snug text-teal">{ad.line}</p>
        <Cta ad={ad} href={href} className="mt-5 w-full" />
      </div>
    </aside>
  );
}
