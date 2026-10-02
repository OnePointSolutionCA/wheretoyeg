import Link from "next/link";
import { getCategories } from "@/lib/content";

export default function NotFound() {
  const cats = getCategories().slice(0, 10);
  return (
    <section className="container-page py-20 text-center sm:py-28">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-6xl">
        We can&apos;t find that.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-teal-500">
        The listing might have closed or moved, or the link is off. Try one of these instead.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/search" className="btn-primary min-h-[44px]">Search Edmonton</Link>
        <Link href="/" className="btn-ghost min-h-[44px]">Back home</Link>
      </div>
      <div className="mx-auto mt-12 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-300">Popular categories</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {cats.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="chip min-h-[40px]">{c.name}</Link>
          ))}
          <Link href="/blog" className="chip min-h-[40px]">Local guides</Link>
        </div>
      </div>
    </section>
  );
}
