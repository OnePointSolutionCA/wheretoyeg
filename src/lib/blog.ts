import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedDate: string;
  tags?: string[];
  body: string;
  readingMinutes: number;
};

const DIR = path.join(process.cwd(), "content", "blog");

export function getBlogPosts(): BlogPost[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(DIR, file), "utf8");
      const { data, content } = matter(raw);
      const words = content.trim().split(/\s+/).length;
      return {
        slug: (data.slug as string) || file.replace(/\.md$/, ""),
        title: data.title as string,
        description: data.description as string,
        publishedDate: data.publishedDate as string,
        tags: (data.tags as string[]) || [],
        body: content.trim(),
        readingMinutes: Math.max(2, Math.round(words / 220)),
      };
    })
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
}

export function getBlogPost(slug: string) {
  return getBlogPosts().find((p) => p.slug === slug);
}

export function renderMarkdown(md: string): string {
  // Minimal markdown: headings, bold, italics, links, paragraphs, lists.
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  const flushList = () => { if (inList) { out.push("</ul>"); inList = false; } };
  const inline = (s: string) =>
    escape(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-coral hover:underline">$1</a>');

  for (const line of lines) {
    if (/^\s*$/.test(line)) { flushList(); continue; }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^### (.+)/))) { flushList(); out.push(`<h3 class="mt-8 font-display text-xl font-bold text-teal">${inline(m[1])}</h3>`); continue; }
    if ((m = line.match(/^## (.+)/))) { flushList(); out.push(`<h2 class="mt-10 font-display text-2xl font-bold text-teal">${inline(m[1])}</h2>`); continue; }
    if ((m = line.match(/^# (.+)/))) { flushList(); out.push(`<h1 class="mt-10 font-display text-3xl font-extrabold text-teal">${inline(m[1])}</h1>`); continue; }
    if ((m = line.match(/^[-*] (.+)/))) {
      if (!inList) { out.push('<ul class="mt-3 list-disc space-y-1 pl-5 text-teal-500">'); inList = true; }
      out.push(`<li>${inline(m[1])}</li>`);
      continue;
    }
    flushList();
    out.push(`<p class="mt-4 text-teal-500">${inline(line)}</p>`);
  }
  flushList();
  return out.join("\n");
}
