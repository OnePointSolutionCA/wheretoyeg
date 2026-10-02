import Image from "next/image";
import Link from "next/link";
import type { AreaPhoto } from "@/lib/areaPhotos";

/** Neighborhood photo in a teal/coral duotone that blooms into full colour on hover. */
export function AreaTile({
  name,
  href,
  count,
  photo,
  fallback,
  tags = [],
  size = "md",
  className = "",
  priority = false,
}: {
  name: string;
  href: string;
  count: number;
  photo?: AreaPhoto;
  fallback?: string;
  tags?: string[];
  size?: "md" | "lg";
  className?: string;
  priority?: boolean;
}) {
  const src = photo?.src ?? fallback;
  const lg = size === "lg";
  return (
    <Link
      href={href}
      className={"group relative isolate flex flex-col justify-end overflow-hidden rounded-3xl bg-teal-900 text-white shadow-card transition-shadow duration-500 hover:shadow-lift " + className}
    >
      {src && (
        <Image
          src={src}
          alt={`${name}, Edmonton`}
          fill
          priority={priority}
          sizes={lg ? "(max-width: 1024px) 100vw, 600px" : "(max-width: 1024px) 50vw, 300px"}
          className="object-cover brightness-105 contrast-110 grayscale transition-[filter,transform] duration-700 ease-out group-hover:scale-105 group-hover:brightness-100 group-hover:contrast-100 group-hover:grayscale-0"
        />
      )}
      <div className="absolute inset-0 bg-[#0b5c73] mix-blend-color transition-opacity duration-700 group-hover:opacity-0" aria-hidden="true" />
      <div className="absolute inset-0 bg-teal/40 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-tr from-coral/40 via-coral/0 to-transparent mix-blend-screen transition-opacity duration-700 group-hover:opacity-0" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 via-45% to-transparent" aria-hidden="true" />

      {photo && (
        <span className="absolute right-3 top-3 z-10 max-w-[70%] truncate rounded-full bg-black/35 px-2 py-0.5 text-[9px] font-medium text-white/75 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          Photo: {photo.credit} · {photo.license}
        </span>
      )}

      <div className={"relative z-10 " + (lg ? "p-6 sm:p-8" : "p-4 sm:p-5")}>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral-300">{count} spots</div>
        <div className={"mt-1 font-display font-extrabold leading-[0.95] tracking-tight drop-shadow-lg " + (lg ? "text-4xl sm:text-6xl" : "text-xl sm:text-2xl")}>
          {name}
        </div>
        {lg && tags.length > 0 && (
          <div className="mt-3 font-editorial text-base italic text-white/80 sm:text-lg">{tags.slice(0, 3).join(" · ")}</div>
        )}
        <span className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 transition-all duration-300 group-hover:border-coral group-hover:bg-coral" aria-hidden="true">
          →
        </span>
      </div>
    </Link>
  );
}
