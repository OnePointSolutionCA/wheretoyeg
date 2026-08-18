import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogPosts, renderMarkdown } from "@/lib/blog";
import { SITE } from "@/lib/site";

export async function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = getBlogPost(params.slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `${SITE.url}/blog/${p.slug}` },
    openGraph: { title: p.title, description: p.description, type: "article" },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const p = getBlogPost(params.slug);
  if (!p) notFound();
  const html = renderMarkdown(p.body);
  const others = getBlogPosts().filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <>
      <article className="container-page py-14" data-reveal="left">
        <nav className="text-xs text-teal-500">
          <Link href="/blog" className="hover:text-coral">Blog</Link> <span className="px-1">›</span>{" "}
          <span className="font-semibold text-teal">{p.title}</span>
        </nav>
        <div className="mt-6 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-500">
            <span>{formatDate(p.publishedDate)}</span>
            <span aria-hidden>·</span>
            <span>{p.readingMinutes} min read</span>
          </div>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight text-teal sm:text-5xl">
            {p.title}
          </h1>
          <p className="mt-4 text-lg text-teal-500">{p.description}</p>
          <div className="mt-8 border-t border-line pt-2" dangerouslySetInnerHTML={{ __html: html }} />
          {p.tags && p.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (<span key={t} className="pill">#{t}</span>))}
            </div>
          )}
        </div>
      </article>

      {others.length > 0 && (
        <section className="container-page pb-20" data-reveal="right">
          <h2 className="section-title">More from the blog</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <Link key={o.slug} href={`/blog/${o.slug}`} className="group rounded-2xl border border-line bg-white p-6 transition hover:border-teal-300 hover:shadow-card">
                <div className="text-xs text-teal-500">{formatDate(o.publishedDate)}</div>
                <div className="mt-1 font-display text-lg font-bold text-teal group-hover:text-coral">{o.title}</div>
                <p className="mt-1 line-clamp-2 text-sm text-teal-500">{o.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}
