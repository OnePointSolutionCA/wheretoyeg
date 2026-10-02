import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogPosts, getHeadings, renderMarkdown } from "@/lib/blog";
import { postBusinesses, postCategory, postCover } from "@/lib/blogMedia";
import { relatedPosts } from "@/lib/related";
import { breadcrumbSchema, JsonLd } from "@/lib/schema-extra";
import { BusinessCard } from "@/components/BusinessCard";
import { RelatedGuides } from "@/components/RelatedGuides";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = getBlogPost(params.slug);
  if (!p) return {};
  const cover = postCover(p);
  return {
    title: p.seoTitle ? { absolute: p.seoTitle } : p.title,
    description: p.description,
    alternates: { canonical: `${SITE.url}/blog/${p.slug}` },
    openGraph: { title: p.title, description: p.description, type: "article", publishedTime: p.publishedDate, images: [cover] },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const p = getBlogPost(params.slug);
  if (!p) notFound();
  const html = renderMarkdown(p.body);
  const headings = getHeadings(p.body);
  const places = postBusinesses(p).slice(0, 6);
  const cat = postCategory(p);
  const cover = postCover(p);
  const catNames = Object.fromEntries((cat ? [cat] : []).map((c) => [c.slug, c.name]));
  const related = relatedPosts(cat?.slug ?? "restaurants", 3, p.slug);
  const more = related.length >= 3 ? related : [...related, ...getBlogPosts().filter((x) => x.slug !== p.slug && !related.includes(x))].slice(0, 3);

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    datePublished: p.publishedDate,
    image: `${SITE.url}${cover}`,
    url: `${SITE.url}/blog/${p.slug}`,
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/logo-mark.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE.url}/blog/${p.slug}` },
    ...(p.tags?.length ? { keywords: p.tags.join(", ") } : {}),
  };

  return (
    <>
      <JsonLd data={blogPostingSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }, { name: p.title }])} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-teal text-white">
        <Image src={cover} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900 via-teal-900/70 to-teal-900/30" aria-hidden="true" />
        <div className="container-page relative pb-12 pt-10 sm:pb-16 sm:pt-14">
          <nav className="flex flex-wrap items-center gap-x-1.5 text-xs text-white/70" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span aria-hidden>›</span>
            <Link href="/blog" className="hover:text-white">Blog</Link>
            {cat && (
              <>
                <span aria-hidden>›</span>
                <Link href={`/${cat.slug}`} className="hover:text-white">{cat.name}</Link>
              </>
            )}
          </nav>
          <div className="mt-6 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral-300">{cat ? `${cat.name} guide` : "Edmonton guide"}</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">{p.title}</h1>
            <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">{p.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/80">
              <span className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">{formatDate(p.publishedDate)}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">{p.readingMinutes} min read</span>
              {places.length > 0 && <span className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">{places.length} places featured</span>}
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="container-page mt-10 grid gap-10 sm:mt-14 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
        <article className="min-w-0">
          <div className="prose-yeg mx-auto max-w-[68ch] lg:mx-0" dangerouslySetInnerHTML={{ __html: html }} />
          {p.tags && p.tags.length > 0 && (
            <div className="mx-auto mt-10 flex max-w-[68ch] flex-wrap gap-1.5 lg:mx-0">
              {p.tags.map((t) => (<span key={t} className="pill">#{t}</span>))}
            </div>
          )}
        </article>

        <aside className="min-w-0">
          <div className="space-y-4 lg:sticky lg:top-28">
            {headings.length > 2 && (
              <nav className="hidden rounded-2xl border border-line bg-white p-5 shadow-card lg:block" aria-label="In this guide">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-300">In this guide</p>
                <ol className="mt-3 space-y-1">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="block rounded-lg px-2 py-1.5 text-sm font-medium leading-snug text-teal transition hover:bg-mist hover:text-coral">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            {cat && (
              <div className="relative overflow-hidden rounded-2xl bg-teal p-6 text-white shadow-card">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-coral/30 blur-2xl" aria-hidden="true" />
                <p className="relative text-xs font-bold uppercase tracking-[0.14em] text-coral-300">Browse the directory</p>
                <p className="relative mt-2 font-display text-xl font-bold leading-snug">All {cat.name.toLowerCase()} in Edmonton</p>
                <p className="relative mt-1 text-sm text-white/75">Hours, ratings, photos, and directions.</p>
                <Link href={`/${cat.slug}`} className="relative mt-4 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-coral px-5 text-sm font-bold text-white transition hover:bg-coral-500">
                  Explore {cat.name} <span aria-hidden>→</span>
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>

      {places.length > 0 && (
        <section className="container-page mt-16 sm:mt-20" data-reveal="up">
          <p className="eyebrow">Featured in this guide</p>
          <h2 className="section-title mt-1">The places, at a glance</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((b) => (
              <BusinessCard key={`${b.category}/${b.slug}`} business={b} categoryName={catNames[b.category]} />
            ))}
          </div>
        </section>
      )}

      <RelatedGuides posts={more} title="Keep reading" />
      <div className="h-16 sm:h-20" aria-hidden="true" />
    </>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
