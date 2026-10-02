import Link from "next/link";

/** Slow ticker of what people search for; pauses on hover, static for reduced motion. */
export function Marquee({ items }: { items: { label: string; href: string }[] }) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center">
          <Link
            href={it.href}
            tabIndex={hidden ? -1 : undefined}
            className="whitespace-nowrap px-5 font-editorial text-2xl italic text-teal transition hover:text-coral sm:text-3xl"
          >
            {it.label}
          </Link>
          <span className="text-coral" aria-hidden="true">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee overflow-hidden border-b border-line bg-white py-5">
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
