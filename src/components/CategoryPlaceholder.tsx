import Image from "next/image";

/** Stand-in for businesses without a usable photo: the category photo in brand duotone, with the business mark on top. */
export function CategoryPlaceholder({
  category,
  name,
  logo,
  label,
  size = "card",
}: {
  category: string;
  name: string;
  logo?: string;
  label?: string;
  size?: "card" | "hero";
}) {
  const hero = size === "hero";
  return (
    <div className="absolute inset-0 overflow-hidden bg-teal-900">
      <Image
        src={`/photos/_hero/${category}.jpg`}
        alt=""
        fill
        sizes={hero ? "(max-width: 1200px) 100vw, 1200px" : "(max-width: 640px) 100vw, 400px"}
        className="scale-105 object-cover brightness-110 contrast-110 grayscale transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-[#0b5c73] mix-blend-color" aria-hidden="true" />
      <div className="absolute inset-0 bg-teal/55 mix-blend-multiply" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-tr from-coral/35 via-transparent to-transparent mix-blend-screen" aria-hidden="true" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        {logo ? (
          <div className={"relative rounded-2xl bg-white shadow-lift transition-transform duration-500 group-hover:scale-105 " + (hero ? "h-32 w-32 sm:h-36 sm:w-36" : "h-20 w-20")}>
            <Image src={logo} alt="" fill sizes={hero ? "144px" : "80px"} className="object-contain p-3" />
          </div>
        ) : (
          <div className={"flex items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-sm transition-transform duration-500 group-hover:scale-105 " + (hero ? "h-32 w-32 sm:h-36 sm:w-36" : "h-20 w-20")}>
            <span className={"font-display font-extrabold text-white " + (hero ? "text-6xl" : "text-4xl")}>{name.trim().slice(0, 1).toUpperCase()}</span>
          </div>
        )}
        {label && <span className="max-w-[85%] truncate text-xs font-bold uppercase tracking-[0.18em] text-white/80">{label}</span>}
      </div>
    </div>
  );
}
