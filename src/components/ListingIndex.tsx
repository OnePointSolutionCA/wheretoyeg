import type { Business } from "@/lib/types";

/**
 * Plain A to Z links to every listing on a list page. The card grid only renders the first 24
 * and loads the rest with a button, so this is how people (and search engines) reach the rest.
 */
export function ListingIndex({
  businesses,
  title,
  showArea = true,
  minItems = 25,
  className = "container-page mt-10",
}: {
  businesses: Business[];
  title: string;
  showArea?: boolean;
  minItems?: number;
  className?: string;
}) {
  if (businesses.length < minItems) return null;
  const sorted = [...businesses].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  return (
    <section className={className}>
      <details className="group rounded-2xl border border-line bg-white shadow-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition hover:bg-mist sm:px-6 [&::-webkit-details-marker]:hidden">
          <h2 className="font-display text-base font-bold text-teal sm:text-lg">
            {title} <span className="font-sans text-sm font-semibold text-teal-300">({sorted.length.toLocaleString("en-CA")})</span>
          </h2>
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-lg leading-none text-coral transition-transform duration-300 group-open:rotate-45"
          >
            +
          </span>
        </summary>
        {/* Plain anchors and list-level styles keep this light: it can hold several hundred links. */}
        <ul className="columns-1 gap-8 px-5 pb-5 text-sm sm:columns-2 sm:px-6 lg:columns-3 [&>li]:break-inside-avoid [&>li]:py-1 [&_a:hover]:text-coral [&_a]:font-medium [&_a]:text-teal [&_span]:text-teal-300">
          {sorted.map((b) => (
            <li key={b.slug}>
              <a href={`/${b.category}/${b.slug}`}>{b.name}</a>
              {showArea && b.neighborhood ? <span>{` · ${b.neighborhood}`}</span> : null}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
