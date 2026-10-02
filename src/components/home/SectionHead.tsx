import Link from "next/link";

/** Editorial section header: numbered kicker, headline with a serif-italic accent, optional "see all" link. */
export function SectionHead({
  index,
  kicker,
  title,
  accent,
  intro,
  href,
  linkLabel,
  tone = "light",
}: {
  index: string;
  kicker: string;
  title: string;
  accent?: string;
  intro?: string;
  href?: string;
  linkLabel?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-4xl"> 
        <p className={"flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] " + (dark ? "text-coral-300" : "text-coral")}>
          <span className={"font-editorial text-sm normal-case italic tracking-normal " + (dark ? "text-white/60" : "text-teal-300")}>{index}</span>
          <span className={"h-px w-8 " + (dark ? "bg-white/25" : "bg-line")} aria-hidden="true" />
          {kicker}
        </p>
        <h2 className={"mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl " + (dark ? "text-white" : "text-teal")}>
          {title}
          {accent && (
            <>
              {" "}
              <span className="font-editorial font-medium italic text-coral">{accent}</span>
            </>
          )}
        </h2>
        {intro && <p className={"mt-3 max-w-xl sm:text-lg " + (dark ? "text-white/75" : "text-teal-500")}>{intro}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className={
            "group inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-semibold transition sm:self-auto " +
            (dark ? "border-white/25 text-white hover:bg-white hover:text-teal" : "border-line text-teal hover:border-teal hover:bg-teal hover:text-white")
          }
        >
          {linkLabel ?? "See all"}
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      )}
    </div>
  );
}
