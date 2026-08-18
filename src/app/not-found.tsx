import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
        We can't find that.
      </h1>
      <p className="mt-3 text-teal-500">The listing might have moved, or the URL is off.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn-primary">Back home</Link>
        <Link href="/search" className="btn-ghost">Search</Link>
      </div>
    </section>
  );
}
