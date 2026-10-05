import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/blog";
import { distinctCovers, postCategory } from "@/lib/blogMedia";
import { GuideCard, formatDate } from "@/components/RelatedGuides";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Edmonton Guides & Best Of Lists | The WhereToYEG Blog" },
  description:
    "Neighborhood guides, best of lists and local Edmonton picks from the WhereToYEG team. Where to eat, who to call, and what to do in Edmonton and nearby towns.",
  alternates: { canonical: `${SITE.url}/blog` },
};

export default function BlogIndex() {
  const posts = getBlogPosts();
  const [lead, ...rest] = posts;
  const leadCat = lead ? postCategory(lead) : undefined;
  const covers = distinctCovers(posts);

  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-mist to-white">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow">Blog</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-6xl">
            Edmonton, worth reading about.
          </h1>
          <p className="mt-4 max-w-2xl text-teal-500 sm:text-lg">
            {posts.length} local guides: where to eat, who to call, and what to do across YEG. Written by the team behind WhereToYEG.
          </p>
        </div>
      </section>

      {lead && (
        <section className="container-page mt-10">
          <Link
            href={`/blog/${lead.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-line bg-white shadow-card transition-all duration-300 hover:shadow-lift md:grid-cols-[1.25fr_1fr]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-teal md:aspect-auto md:min-h-[360px]">
              <Image
                src={covers.get(lead.slug)!}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 660px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-full bg-coral px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                Latest guide
              </span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-10">
              {leadCat && <p className="eyebrow">{leadCat.name}</p>}
              <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight text-teal transition-colors group-hover:text-coral sm:text-3xl">
                {lead.title}
              </h2>
              <p className="mt-3 text-teal-500">{lead.description}</p>
              <div className="mt-5 text-xs text-teal-300">
                {formatDate(lead.publishedDate)} · {lead.readingMinutes} min read
              </div>
              <span className="mt-6 inline-flex w-fit min-h-[44px] items-center gap-1.5 rounded-full bg-teal px-5 text-sm font-bold text-white transition group-hover:bg-coral">
                Read the guide <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="container-page py-12">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-mist p-12 text-center text-teal-500">
            First posts landing soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <GuideCard key={p.slug} post={p} cover={covers.get(p.slug)} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
