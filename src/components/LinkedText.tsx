import Link from "next/link";

/** Turns [text](/path) in hand-written intro copy into internal links; everything else stays plain text. */
export function withLinks(text: string) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) parts.push(text.slice(last, m.index));
    parts.push(
      <Link key={m.index} href={m[2]} className="font-semibold text-[#C63A22] underline decoration-coral/35 decoration-2 underline-offset-[3px] transition hover:text-coral hover:decoration-current">
        {m[1]}
      </Link>,
    );
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Intro paragraphs (blank line separated) with inline links. */
export function IntroText({ text, className = "mb-4 max-w-2xl space-y-3 text-teal-500" }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text.split(/\n\s*\n/).map((para, i) => (
        <p key={i}>{withLinks(para)}</p>
      ))}
    </div>
  );
}
