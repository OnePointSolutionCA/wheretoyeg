#!/usr/bin/env node
/**
 * Lists every (category, subcategory) pair used by a business listing that
 * isn't defined in content/categories/<category>.md → subcategories.
 *
 * Orphaned listings don't appear on /<category>/<subcategory> pages, fall back
 * to the generic category name in titles, and skew subcategory counts.
 *
 * Usage:
 *   node scripts/audit-subcategories.mjs            # active listings only
 *   node scripts/audit-subcategories.mjs --all      # include inactive listings
 *   node scripts/audit-subcategories.mjs --json     # machine-readable output
 *
 * Exits 1 when orphans are found, so it can gate CI or a pre-commit hook.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.join(process.cwd(), "content");
const ALL = process.argv.includes("--all");
const JSON_OUT = process.argv.includes("--json");

function readDir(sub) {
  const dir = path.join(ROOT, sub);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => ({ file, data: matter(fs.readFileSync(path.join(dir, file), "utf8")).data }));
}

const categories = new Map(
  readDir("categories").map(({ file, data }) => [
    data.slug || file.replace(/\.md$/, ""),
    new Set((data.subcategories ?? []).map((s) => s.slug)),
  ]),
);

const orphans = new Map(); // "cat/sub" → { category, subcategory, files: [] }
let missingCategory = 0;
for (const { file, data } of readDir("businesses")) {
  if (!ALL && data.active === false) continue;
  if (!data.subcategory) continue;
  const subs = categories.get(data.category);
  if (!subs) {
    missingCategory++;
    console.error(`! ${file}: unknown category "${data.category}"`);
    continue;
  }
  if (subs.has(data.subcategory)) continue;
  const key = `${data.category}/${data.subcategory}`;
  if (!orphans.has(key)) orphans.set(key, { category: data.category, subcategory: data.subcategory, files: [] });
  orphans.get(key).files.push(file);
}

const rows = [...orphans.values()].sort(
  (a, b) => b.files.length - a.files.length || a.category.localeCompare(b.category) || a.subcategory.localeCompare(b.subcategory),
);
const total = rows.reduce((n, r) => n + r.files.length, 0);

if (JSON_OUT) {
  console.log(JSON.stringify(rows.map(({ category, subcategory, files }) => ({ category, subcategory, count: files.length, files })), null, 2));
} else if (rows.length === 0) {
  console.log(`No orphaned subcategories (${ALL ? "all" : "active"} listings).`);
} else {
  const w = Math.max(...rows.map((r) => `${r.category}/${r.subcategory}`.length));
  for (const r of rows) console.log(`${String(r.files.length).padStart(4)}  ${`${r.category}/${r.subcategory}`.padEnd(w)}`);
  console.log(`\n${total} ${ALL ? "" : "active "}listings across ${rows.length} orphaned (category, subcategory) pairs.`);
}

process.exit(rows.length || missingCategory ? 1 : 0);
