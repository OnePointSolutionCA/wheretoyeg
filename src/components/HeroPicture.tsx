import heroImages from "@/lib/heroImages.json";

type Entry = { width: number; height: number; w: number[]; m: number[]; dir: string };
const MANIFEST = heroImages as Record<string, Entry>;

/**
 * A big static photo (category hero, homepage hero, homepage category tile) as a plain <img>
 * with pre-built WebP sizes from scripts/optimize-static-images.mjs. No Vercel image
 * transformations, and the browser can find it in the HTML (unlike a CSS background).
 *
 * `src` is the original JPG path ("/photos/_hero/restaurants.jpg"). Falls back to it when
 * no optimised copies exist (e.g. a new category before the script has been re-run).
 *
 * `mobileSizes` switches phones (`mobileMedia`, default up to 640 px wide) to the centre crop made by
 * the script (full height, narrower), which is exactly the part an object-cover hero shows there.
 * Pass how wide that crop is drawn (hero height x crop aspect).
 */
export function HeroPicture({
  src,
  alt = "",
  className,
  sizes,
  mobileSizes,
  mobileMedia = "(max-width: 640px)",
  priority = false,
}: {
  src: string;
  alt?: string;
  className?: string;
  sizes: string;
  mobileSizes?: string;
  mobileMedia?: string;
  priority?: boolean;
}) {
  const e = MANIFEST[src.replace(/\.jpg$/, "")];
  const loading = priority ? "eager" : "lazy";
  const fetchPriority = priority ? "high" : undefined;
  if (!e) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} loading={loading} fetchPriority={fetchPriority} decoding="async" />;
  }
  const wide = e.w.map((w) => `${e.dir}-w${w}.webp ${w}w`).join(", ");
  const fallback = `${e.dir}-w${e.w.find((w) => w >= 1200) ?? e.w[e.w.length - 1]}.webp`;
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fallback}
      srcSet={wide}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={priority ? "sync" : "async"}
    />
  );
  if (!mobileSizes || !e.m.length) return img;
  return (
    <picture>
      <source media={mobileMedia} srcSet={e.m.map((w) => `${e.dir}-m${w}.webp ${w}w`).join(", ")} sizes={mobileSizes} type="image/webp" />
      {img}
    </picture>
  );
}
