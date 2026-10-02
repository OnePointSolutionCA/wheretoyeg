import Image from "next/image";

const GRADIENTS = [
  "from-teal via-teal-700 to-teal-900",
  "from-[#0d5a75] via-teal to-[#062a38]",
  "from-[#8a3418] via-coral to-[#5d2210]",
  "from-[#1a4d5c] via-[#0a3441] to-[#062a38]",
  "from-coral via-[#c56430] to-[#7a3c1c]",
  "from-[#154b5d] via-[#0b3345] to-[#04212e]",
];
function hashPick<T>(arr: T[], key: string): T {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return arr[Math.abs(h) % arr.length];
}

export function BusinessGallery({
  photos,
  name,
  logo,
  categoryName,
  slug,
}: {
  photos: string[];
  name: string;
  logo?: string;
  categoryName?: string;
  slug?: string;
}) {
  if (!photos?.length) {
    const gradient = hashPick(GRADIENTS, slug || name);
    return (
      <div className={"relative flex aspect-[16/7] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br " + gradient}>
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-80 w-80 rounded-full bg-white/6 blur-3xl" />
        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-center gap-4 text-center">
          {logo ? (
            <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-white shadow-lift">
              <Image src={logo} alt="" fill sizes="128px" className="object-contain p-5" />
            </div>
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25">
              <span className="font-display text-6xl font-extrabold text-white">
                {name.slice(0, 1)}
              </span>
            </div>
          )}
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            {categoryName ?? name}
          </span>
        </div>
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
            alt={i === 0 ? `${name} main photo` : `${name} photo ${i + 1}`}
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
