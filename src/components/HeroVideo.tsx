export function HeroVideo() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base gradient (poster / fallback while video loads or if file missing) */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal via-teal-700 to-teal-900" />

      {/* Edmonton downtown video loop — drop file at public/hero-edmonton.mp4 */}
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-poster.jpg"
      >
        <source src="/hero-edmonton.mp4" type="video/mp4" />
        <source src="/hero-edmonton.webm" type="video/webm" />
      </video>

      {/* Dark scrim to keep text legible over any footage */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal/50 via-teal/60 to-teal/90" />

      {/* Warm accent glows */}
      <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-coral/25 blur-3xl" />
      <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />
    </div>
  );
}
