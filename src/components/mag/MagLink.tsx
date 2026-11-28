import Link from "next/link";

/** Frameless action: bold mono label plus a small arrow; an underline draws in on hover and focus. */
export function MagLink({
  href,
  children,
  external = false,
  big = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  big?: boolean;
}) {
  const cls = "mag-link" + (big ? " mag-link--big" : "");
  const arrow = (
    <svg className="mag-link__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {external ? <path d="M7 17 17 7M8 7h9v9" /> : <path d="M4 12h15M13 6l6 6-6 6" />}
    </svg>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        <span className="mag-link__label">{children}</span>
        {arrow}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      <span className="mag-link__label">{children}</span>
      {arrow}
    </Link>
  );
}
