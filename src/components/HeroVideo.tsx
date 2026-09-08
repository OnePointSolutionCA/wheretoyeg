export function HeroVideo() {
  return (
    <div className="hero-media pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal via-teal-700 to-teal-900" />
      <img
        src="/hero-edmonton.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        loading="eager"
        fetchPriority="high"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-teal/50 via-teal/60 to-teal/90" />
      <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-coral/25 blur-3xl" />
      <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />
    </div>
  );
}
