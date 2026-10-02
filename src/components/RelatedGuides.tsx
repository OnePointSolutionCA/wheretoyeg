import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { distinctCovers, postCategory, postCover } from "@/lib/blogMedia";

export function GuideCard({ post: p, cover, priority = false }: { post: BlogPost; cover?: string; priority?: boolean }) {
  const cat = postCategory(p);
  return (
    <Link
      href={`/blog/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-teal">
        <Image
          src={cover ?? postCover(p)}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden="true" />
        {cat && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-teal backdrop-blur">
            {cat.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs text-teal-300">
          {formatDate(p.publishedDate)} · {p.readingMinutes} min read
        </div>
        <h3 className="mt-2 font-display text-lg font-bold leading-snug text-teal transition-colors group-hover:text-coral">{p.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-teal-500">{p.description}</p>
        <span className="mt-auto pt-4 text-xs font-bold uppercase tracking-wider text-coral">
          Read guide <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}

export function RelatedGuides({ posts, title }: { posts: BlogPost[]; title: string }) {
  if (!posts.length) return null;
  const covers = distinctCovers(posts);
  return (
    <section className="container-page mt-16" data-reveal="up">
      <p className="eyebrow">Local guides</p>
      <h2 className="section-title mt-1">{title}</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <GuideCard key={p.slug} post={p} cover={covers.get(p.slug)} />
        ))}
      </div>
    </section>
  );
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
