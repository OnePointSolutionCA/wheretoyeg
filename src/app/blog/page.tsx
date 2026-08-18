import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "The WhereToYEG Blog",
  description:
    "Neighborhood guides, best-of lists, and local Edmonton picks from the WhereToYEG team.",
};

export default function BlogIndex() {
  const posts = getBlogPosts();
  return (
    <>
      <section className="border-b border-line bg-mist">
        <div className="container-page py-16">
          <p className="eyebrow">Blog</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
            Edmonton, worth reading about.
          </h1>
          <p className="mt-4 max-w-2xl text-teal-500">
            Neighborhood guides, best-of lists, and the local spots we love. Written by the team behind WhereToYEG.
          </p>
        </div>
      </section>
      <section className="container-page py-12" data-reveal="right">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-mist p-12 text-center text-teal-500">
            First posts landing soon.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-card"
              >
                <div className="text-xs text-teal-500">
                  {formatDate(p.publishedDate)} · {p.readingMinutes} min read
                </div>
                <h2 className="mt-2 font-display text-xl font-bold text-teal group-hover:text-coral">
                  {p.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-teal-500">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tags?.slice(0, 3).map((t) => (
                    <span key={t} className="pill">#{t}</span>
                  ))}
                </div>
                <span className="mt-auto pt-4 text-xs font-bold uppercase tracking-wider text-coral">
                  Read →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}
