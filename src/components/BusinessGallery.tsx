import Image from "next/image";
import { CategoryPlaceholder } from "./CategoryPlaceholder";


export function BusinessGallery({
  photos,
  name,
  logo,
  categoryName,
  category,
  altBase,
}: {
  photos: string[];
  name: string;
  logo?: string;
  categoryName?: string;
  category?: string;
  /** Descriptive alt text, e.g. "Bronx Bowling, bowling alley in Edmonton". */
  altBase?: string;
}) {
  if (!photos?.length) {
    return (
      <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-3xl shadow-card sm:aspect-[16/6]">
        <CategoryPlaceholder category={category ?? "restaurants"} name={name} logo={logo} label={categoryName} size="hero" />
      </div>
    );
  }
  const n = Math.min(photos.length, 5);
  const extra = photos.length - n;

  // Desktop placement per photo count so the 4x2 grid never leaves an empty cell.
  const placement: Record<number, string[]> = {
    1: ["sm:col-span-4 sm:row-span-2"],
    2: ["sm:col-span-2 sm:row-span-2", "sm:col-span-2 sm:row-span-2"],
    3: ["sm:col-span-2 sm:row-span-2", "sm:col-span-2", "sm:col-span-2"],
    4: ["sm:col-span-2 sm:row-span-2", "sm:col-span-2", "", ""],
    5: ["sm:col-span-2 sm:row-span-2", "", "", "", ""],
  };

  // One set of images: a swipe row on phones, a bento grid from tablet up.
  return (
    <div
      className={
        "-mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:grid-rows-2 sm:overflow-visible sm:px-0 sm:pb-0 " +
        (n === 1 ? "sm:aspect-[16/6]" : "sm:aspect-[16/7]")
      }
      style={{ scrollbarWidth: "none" }}
    >
      {photos.map((p, i) => (
        <div
          key={p + i}
          className={
            "group relative aspect-[4/3] shrink-0 snap-center overflow-hidden rounded-2xl bg-teal sm:aspect-auto sm:w-auto " +
            (photos.length > 1 ? "w-[86%] " : "w-full ") +
            (i < n ? placement[n][i] + (i > 0 ? " sm:rounded-xl" : "") : "sm:hidden")
          }
        >
          <Image
            src={p}
            alt={i === 0 ? altBase ?? `${name} main photo` : `${altBase ?? name}, photo ${i + 1}`}
            fill
            sizes={i === 0 ? "(max-width: 640px) 86vw, (max-width: 1200px) 50vw, 600px" : "(max-width: 640px) 86vw, (max-width: 1200px) 25vw, 300px"}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            priority={i === 0}
          />
          {photos.length > 1 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:hidden">
              {i + 1} / {photos.length}
            </span>
          )}
          {i === n - 1 && extra > 0 && (
            <div className="absolute inset-0 hidden items-center justify-center bg-black/45 text-lg font-bold text-white sm:flex">
              +{extra} more
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
