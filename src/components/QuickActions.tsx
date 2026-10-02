import type { Business } from "@/lib/types";
import { GlobeIcon, NavIcon, PhoneIcon } from "./icons";
import { ShareButton } from "./ShareButton";

const base = "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition active:translate-y-px";
const solidCoral = `${base} bg-coral text-white shadow-card hover:bg-coral-500`;
const solidTeal = `${base} bg-teal text-white shadow-card hover:bg-teal-600`;
const ghost = `${base} border border-line bg-white text-teal hover:border-teal-300 hover:bg-mist`;

export function QuickActions({ b }: { b: Business }) {
  return (
    <div className="flex flex-wrap gap-2">
      {b.phone && (
        <a href={`tel:${b.phone}`} className={`${solidCoral} max-lg:hidden`}>
          <PhoneIcon /> Call
        </a>
      )}
      {b.google_maps_url && (
        <a href={b.google_maps_url} target="_blank" rel="noreferrer" className={`${solidTeal} max-lg:hidden`}>
          <NavIcon /> Directions
        </a>
      )}
      {b.website && (
        <a href={b.website} target="_blank" rel="noreferrer" className={`${ghost} max-lg:hidden`}>
          <GlobeIcon /> Website
        </a>
      )}
      <ShareButton title={b.name} className={ghost} />
    </div>
  );
}

/** Thumb-reach action bar pinned to the bottom of the screen on phones and tablets. */
export function MobileActionBar({ b }: { b: Business }) {
  const actions = [
    b.phone && { label: "Call", href: `tel:${b.phone}`, icon: PhoneIcon, cls: "bg-coral text-white", external: false },
    b.google_maps_url && { label: "Directions", href: b.google_maps_url, icon: NavIcon, cls: "bg-teal text-white", external: true },
    b.website && { label: "Website", href: b.website, icon: GlobeIcon, cls: "border border-line bg-white text-teal", external: true },
  ].filter(Boolean) as { label: string; href: string; icon: typeof PhoneIcon; cls: string; external: boolean }[];
  if (!actions.length) return null;
  return (
    <>
      <div aria-hidden="true" className="h-24 lg:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pt-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="mx-auto flex max-w-page gap-2">
          {actions.map((a) => (
            <a
              key={a.label}
              href={a.href}
              {...(a.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold transition active:translate-y-px ${a.cls}`}
            >
              <a.icon /> {a.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
