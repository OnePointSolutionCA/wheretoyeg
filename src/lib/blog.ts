import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPost = {
  slug: string;
  title: string;
  seoTitle?: string;
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
    .map((file): BlogPost | null => {
      const raw = fs.readFileSync(path.join(DIR, file), "utf8");
      const { data, content } = matter(raw);
      const words = content.trim().split(/\s+/).length;
      if (data.draft === true) return null;
      return {
        slug: (data.slug as string) || file.replace(/\.md$/, ""),
        title: data.title as string,
        seoTitle: (data.seoTitle as string) || undefined,
        description: data.description as string,
        publishedDate: data.publishedDate as string,
        tags: (data.tags as string[]) || [],
        body: content.trim(),
        readingMinutes: Math.max(2, Math.round(words / 220)),
      };
    })
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
}

export function getBlogPost(slug: string) {
  return getBlogPosts().find((p) => p.slug === slug);
}

export function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>|\*\*|\*|\[|\]\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Level-2 headings, for the in-article table of contents. */
export function getHeadings(md: string): { id: string; text: string }[] {
  return md
    .split(/\r?\n/)
    .map((l) => l.match(/^## (.+)/)?.[1])
    .filter((x): x is string => !!x)
    .map((text) => {
      const clean = text.replace(/\*\*|\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      return { id: headingId(clean), text: clean };
    });
}

export function renderMarkdown(md: string): string {
  // Minimal markdown: headings, bold, italics, links, paragraphs, bullet and numbered lists, tables.
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    escape(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text: string, href: string) =>
        /^https?:\/\//.test(href) ? `<a href="${href}" target="_blank" rel="noreferrer">${text}</a>` : `<a href="${href}">${text}</a>`,
      );
  const cells = (row: string) => row.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  let table: string[] = [];
  const flushList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((r) => !/^\|?\s*:?-{2,}/.test(r.trim()));
    const [head, ...body] = rows;
    out.push(
      `<div class="table-wrap"><table><thead><tr>${cells(head).map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${body
        .map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table></div>`,
    );
    table = [];
  };
  const openList = (kind: "ul" | "ol") => {
    if (list !== kind) { flushList(); out.push(`<${kind}>`); list = kind; }
  };

  for (const line of lines) {
    if (/^\s*\|/.test(line)) { flushList(); table.push(line); continue; }
    flushTable();
    if (/^\s*$/.test(line)) { flushList(); continue; }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^### (.+)/))) { flushList(); out.push(`<h3 id="${headingId(m[1])}">${inline(m[1])}</h3>`); continue; }
    if ((m = line.match(/^## (.+)/))) { flushList(); out.push(`<h2 id="${headingId(m[1])}">${inline(m[1])}</h2>`); continue; }
    if ((m = line.match(/^# (.+)/))) { flushList(); out.push(`<h2 id="${headingId(m[1])}">${inline(m[1])}</h2>`); continue; }
    if ((m = line.match(/^[-*] (.+)/))) { openList("ul"); out.push(`<li>${inline(m[1])}</li>`); continue; }
    if ((m = line.match(/^\d+\. (.+)/))) { openList("ol"); out.push(`<li>${inline(m[1])}</li>`); continue; }
    flushList();
    out.push(`<p>${inline(line)}</p>`);
  }
  flushList();
  flushTable();
  return out.join("\n");
}
