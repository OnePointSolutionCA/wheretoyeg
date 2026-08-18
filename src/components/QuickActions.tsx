import type { Business } from "@/lib/types";

export function QuickActions({ b }: { b: Business }) {
  const items = [
    b.phone && { label: "Call", href: `tel:${b.phone}`, icon: PhoneIcon },
    b.website && { label: "Website", href: b.website, icon: GlobeIcon, external: true },
    b.google_maps_url && { label: "Directions", href: b.google_maps_url, icon: NavIcon, external: true },
    { label: "Share", href: `/${b.category}/${b.slug}`, icon: ShareIcon },
  ].filter(Boolean) as { label: string; href: string; icon: any; external?: boolean }[];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          {...(it.external ? { target: "_blank", rel: "noreferrer" } : {})}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-teal transition hover:border-teal-300 hover:bg-mist"
        >
          <it.icon />
          {it.label}
        </a>
      ))}
    </div>
  );
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function PhoneIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6 6l1.2-1.1a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2z" /></svg>;
}
function GlobeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></svg>;
}
function NavIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg>;
}
function ShareIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>;
}
