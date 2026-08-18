#!/usr/bin/env node
/**
 * Fetch missing logos from Clearbit's free logo API using each business's website domain.
 * Falls back to Google's favicon service when Clearbit has no logo.
 * Saves logos to public/logos/{slug}.png and updates the .md frontmatter.
 *
 * Usage: node scripts/fetch-logos.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUSINESS_DIR = path.join(ROOT, "content/businesses");
const LOGO_DIR = path.join(ROOT, "public/logos");

async function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function fetchBinary(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) return null; // too small — probably a placeholder
  return buf;
}

async function tryDdg(domain) {
  return await fetchBinary(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
}

async function tryIconHorse(domain) {
  return await fetchBinary(`https://icon.horse/icon/${domain}`);
}

async function tryGoogleFavicon(domain) {
  return await fetchBinary(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
}

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const lines = m[1].split("\n");
  const fields = {};
  for (const line of lines) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (kv) fields[kv[1]] = kv[2];
  }
  return { fields, raw: m[1], body: m[2], full: text };
}

function insertLogoField(text, logoPath) {
  // Insert after the tier: line if present, else after slug:
  const lines = text.split("\n");
  const idx = lines.findIndex((l) => /^tier:/i.test(l));
  const insertAt = idx >= 0 ? idx + 1 : 1;
  if (lines.some((l) => /^logo:/i.test(l))) {
    return lines.map((l) => (/^logo:/i.test(l) ? `logo: "${logoPath}"` : l)).join("\n");
  }
  lines.splice(insertAt, 0, `logo: "${logoPath}"`);
  return lines.join("\n");
}

async function main() {
  await fs.mkdir(LOGO_DIR, { recursive: true });
  const files = (await fs.readdir(BUSINESS_DIR)).filter((f) => f.endsWith(".md"));

  let fetched = 0;
  let skipped = 0;
  let failed = [];

  for (const file of files) {
    const filePath = path.join(BUSINESS_DIR, file);
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = parseFrontmatter(raw);
    if (!parsed) continue;

    const { fields } = parsed;
    const slug = (fields.slug ?? file.replace(/\.md$/, "")).replace(/^"|"$/g, "");
    const website = (fields.website ?? "").replace(/^"|"$/g, "");
    const existingLogo = (fields.logo ?? "").replace(/^"|"$/g, "");

    if (existingLogo) { skipped++; continue; }
    if (!website) { failed.push(`${slug} (no website)`); continue; }

    const domain = await extractDomain(website);
    if (!domain) { failed.push(`${slug} (bad url: ${website})`); continue; }

    let buf = await tryDdg(domain);
    let source = "ddg";
    if (!buf) { buf = await tryIconHorse(domain); source = "iconhorse"; }
    if (!buf) { buf = await tryGoogleFavicon(domain); source = "favicon"; }
    if (!buf) { failed.push(`${slug} (${domain})`); continue; }

    const localPath = `/logos/${slug}.png`;
    const diskPath = path.join(LOGO_DIR, `${slug}.png`);
    await fs.writeFile(diskPath, buf);

    const updated = insertLogoField(raw, localPath);
    await fs.writeFile(filePath, updated);

    fetched++;
    console.log(`✓ ${slug} → ${source} (${(buf.length / 1024).toFixed(1)} KB)`);
  }

  console.log(`\nDone: ${fetched} fetched, ${skipped} skipped (already had logo), ${failed.length} failed`);
  if (failed.length) console.log(`Failed:\n  - ${failed.join("\n  - ")}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
