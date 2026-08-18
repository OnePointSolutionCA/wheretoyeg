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
            <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white p-5 shadow-lift">
              <img src={logo} alt="" className="max-h-full max-w-full object-contain" />
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
  const [hero, ...rest] = photos;

  // Single photo → full-width hero at a comfortable aspect ratio
  if (rest.length === 0) {
    return (
      <div
        className="photo-tile aspect-[16/7] w-full rounded-2xl"
        style={{ backgroundImage: `url(${hero})` }}
        aria-label={`${name} main photo`}
      />
    );
  }

  // Multiple photos → hero + thumbnail grid
  return (
    <div className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2 sm:aspect-[16/7]">
      <div
        className="photo-tile aspect-[4/3] rounded-2xl sm:col-span-2 sm:row-span-2 sm:aspect-auto"
        style={{ backgroundImage: `url(${hero})` }}
        aria-label={`${name} main photo`}
      />
      {rest.slice(0, 4).map((p, i) => (
        <div
          key={p + i}
          className="photo-tile aspect-square rounded-xl sm:aspect-auto"
          style={{ backgroundImage: `url(${p})` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
