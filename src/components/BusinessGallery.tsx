export function BusinessGallery({ photos, name }: { photos: string[]; name: string }) {
  if (!photos?.length) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-teal text-white/70">
        <span className="font-display text-6xl font-bold opacity-30">{name.slice(0, 1)}</span>
      </div>
    );
  }
  const [hero, ...rest] = photos;
  return (
    <div className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2">
      <div
        className="photo-tile sm:col-span-2 sm:row-span-2 aspect-[4/3] sm:aspect-auto rounded-2xl"
        style={{ backgroundImage: `url(${hero})` }}
        aria-label={`${name} main photo`}
      />
      {rest.slice(0, 4).map((p, i) => (
        <div
          key={p + i}
          className="photo-tile aspect-square rounded-xl"
          style={{ backgroundImage: `url(${p})` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
