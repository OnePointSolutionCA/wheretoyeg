import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

export function RelatedGuides({ posts, title }: { posts: BlogPost[]; title: string }) {
  if (!posts.length) return null;
  return (
    <section className="container-page mt-16" data-reveal="up">
      <p className="eyebrow">Local guides</p>
      <h2 className="section-title mt-1">{title}</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-card"
          >
            <div className="text-xs text-teal-500">{p.readingMinutes} min read</div>
            <h3 className="mt-2 font-display text-lg font-bold text-teal group-hover:text-coral">{p.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-teal-500">{p.description}</p>
            <span className="mt-auto pt-4 text-xs font-bold uppercase tracking-wider text-coral">Read →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
