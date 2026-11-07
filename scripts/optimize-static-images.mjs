#!/usr/bin/env node
/**
 * Pre-built, responsive copies of the big static images, so pages never ship the raw JPGs/PNGs
 * and none of these go through Vercel's on-demand image optimiser (no extra transformations).
 *
 *   npm i --no-save sharp && node scripts/optimize-static-images.mjs
 *
 * Writes:
 *  - public/photos/_hero/opt/{slug}-w{width}.webp   several widths (category heroes + home tiles)
 *  - public/photos/_hero/opt/{slug}-m{width}.webp   1.3:1 centre crop (full height) for phone heroes
 *  - public/opt/hero-edmonton-w{width}.webp          same for the homepage hero, plus
 *    public/opt/hero-edmonton-m{width}.webp          a 3:4 centre crop (full height) for phones
 *  - src/lib/heroImages.json                         which widths exist per image (read by HeroPicture)
 *  - small copies of the nav logo, favicon and sponsor logos (sizes below)
 * and re-compresses public/photos/_hero/*.jpg in place (same size, mozjpeg q80, only when that saves
 * 10%+). Those JPGs are still used by next/image placeholders and as the halal page's social image.
 * Safe to re-run.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(ROOT, "public");
const WIDTHS = [480, 800, 1200, 1600, 2000];
const Q = 72;

/**
 * Full-frame WebPs at WIDTHS (capped at the source width). With `mobile`, also a centre crop
 * (`aspect` = width / height, full height) for phones, where an object-cover hero only shows a
 * narrow slice of a wide photo.
 */
async function responsive(src, outBase, mobile) {
  const { width: W, height: H } = await sharp(src).metadata();
  const w = [];
  for (const width of WIDTHS) {
    const target = Math.min(width, W);
    if (w.includes(target)) break;
    await sharp(src).resize({ width: target }).webp({ quality: Q, effort: 6 }).toFile(`${outBase}-w${target}.webp`);
    w.push(target);
  }
  const m = [];
  if (mobile) {
    const cropW = Math.min(W, Math.round(H * mobile.aspect));
    for (const h of [...mobile.heights, H]) {
      const target = Math.min(h, H);
      const outW = Math.round(target * (cropW / H));
      if (m.includes(outW)) continue;
      await sharp(src)
        .extract({ left: Math.round((W - cropW) / 2), top: 0, width: cropW, height: H })
        .resize({ width: outW, height: target })
        .webp({ quality: Q, effort: 6 })
        .toFile(`${outBase}-m${outW}.webp`);
      m.push(outW);
    }
  }
  return { width: W, height: H, w, m };
}

async function recompressJpeg(file) {
  const before = (await fs.stat(file)).size;
  const buf = await sharp(file)
    .jpeg({ quality: 80, mozjpeg: true, progressive: true })
    .toBuffer();
  if (buf.length < before * 0.9) {
    await fs.writeFile(file, buf);
    return [before, buf.length];
  }
  return [before, before];
}

async function main() {
  const manifest = {};
  const heroDir = path.join(PUB, "photos/_hero");
  const optDir = path.join(heroDir, "opt");
  await fs.mkdir(optDir, { recursive: true });
  const files = (await fs.readdir(heroDir)).filter((f) => f.endsWith(".jpg")).sort();
  for (const f of files) {
    const slug = f.replace(/\.jpg$/, "");
    const src = path.join(heroDir, f);
    // Phone crop at 1.3:1: category heroes on phones up to 430 px wide are at most about 1.12:1, so
    // object-cover still shows the crop's full height, exactly what it showed of the full photo.
    manifest[`/photos/_hero/${slug}`] = {
      ...(await responsive(src, path.join(optDir, slug), { aspect: 1.3, heights: [600, 800] })),
      dir: "/photos/_hero/opt/" + slug,
    };
    const [a, b] = await recompressJpeg(src);
    console.log(`${f}: jpg ${Math.round(a / 1024)} -> ${Math.round(b / 1024)} KB`);
  }

  await fs.mkdir(path.join(PUB, "opt"), { recursive: true });
  manifest["/hero-edmonton"] = {
    ...(await responsive(path.join(PUB, "hero-edmonton.jpg"), path.join(PUB, "opt/hero-edmonton"), { aspect: 0.75, heights: [600] })),
    dir: "/opt/hero-edmonton",
  };
  await fs.writeFile(path.join(ROOT, "src/lib/heroImages.json"), JSON.stringify(manifest, null, 1) + "\n");

  // Logos: same artwork, sized for how big they are drawn (3x+ for sharp phone screens).
  const logos = [
    // nav logo, drawn 44 px tall (both halves use the same file, plus the CSS shine mask)
    ["logo-horizontal-alpha.png", "logo-horizontal-alpha-sm.webp", { height: 150 }, "webp"],
    // favicon + apple touch icon
    ["logo-mark.png", "logo-mark-192.png", { height: 192 }, "png"],
    // sponsor logos, drawn at most 36 / 56 / 40 px tall
    ["logos/onepoint-horizontal.png", "logos/onepoint-horizontal-sm.webp", { height: 120 }, "webp"],
    ["logos/fix-auto.png", "logos/fix-auto-sm.webp", { height: 180 }, "webp"],
    ["logos/oxford-chiro-horizontal.png", "logos/oxford-chiro-horizontal-sm.webp", { height: 130 }, "webp"],
  ];
  for (const [src, out, size, fmt] of logos) {
    let p = sharp(path.join(PUB, src)).resize({ ...size, withoutEnlargement: true });
    p = fmt === "webp" ? p.webp({ quality: 92, alphaQuality: 100, effort: 6 }) : p.png({ compressionLevel: 9, palette: false });
    await p.toFile(path.join(PUB, out));
    const a = (await fs.stat(path.join(PUB, src))).size;
    const b = (await fs.stat(path.join(PUB, out))).size;
    console.log(`${src} -> ${out}: ${Math.round(a / 1024)} -> ${Math.round(b / 1024)} KB`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
