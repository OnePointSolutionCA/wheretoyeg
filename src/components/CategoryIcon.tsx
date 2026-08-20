const PATHS: Record<string, string> = {
  scissors: "M8.7 8.7 20 20M8.7 15.3 20 4M6 6a2 2 0 1 0-4 0 2 2 0 0 0 4 0zM6 18a2 2 0 1 0-4 0 2 2 0 0 0 4 0z",
  utensils: "M4 3v6a2 2 0 0 0 2 2v10M9 3v6M12 3v18M17 3c-1.657 0-3 3-3 6s1.343 6 3 6v6",
  coffee: "M3 8h13v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8zM17 8h2a3 3 0 0 1 0 6h-1M6 2v3M10 2v3M14 2v3",
  bread: "M4 12a6 6 0 0 1 12 0v6H4v-6zM16 12a4 4 0 0 1 4 4v2h-4v-2",
  hand: "M9 11V6a2 2 0 1 1 4 0v5M13 11V4a2 2 0 1 1 4 0v9M9 11V3a2 2 0 1 0-4 0v11a7 7 0 0 0 14 0v-3",
  nail: "M10 3h4a1 1 0 0 1 1 1v3l1 2v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l1-2V4a1 1 0 0 1 1-1zM9 9h6",
  brush: "M3 21c3 0 5-3 5-5s-2-3-5-3M21 3l-9 9M14 5l4 4",
  sparkle: "M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3",
  smile: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
  tooth: "M12 3c3 0 5 1 5 3s-1 2-1 6-1 9-4 9-2-4-2-6-1-2-2 0-0 6-3 6-3-5-3-9-1-4-1-6 3-3 5-3z",
  cross: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v8M8 12h8",
  stethoscope: "M8 2v6a4 4 0 0 0 8 0V2M6 12v3a6 6 0 0 0 12 0v-2M18 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  dumbbell: "M6 6v12M18 6v12M6 12h12M2 8v8M22 8v8",
  pill: "M8 15l7-7a4 4 0 0 1 5.66 5.66l-7 7a4 4 0 1 1-5.66-5.66zM12 12l5 5",
  wrench: "M17.5 6.5A4.5 4.5 0 1 1 13 11l-8 8 3 3 8-8a4.5 4.5 0 0 0 1.5-7.5z",
  zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  spray: "M6 12h12v9H6zM12 3v3M9 6h6M9 9h6M12 12v0",
  car: "M4 16v-4l2-5h12l2 5v4M7 16v3M17 16v3M4 16h16M7 13h.01M17 13h.01",
  camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  home: "M3 12l9-9 9 9v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z",
  cart: "M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6",
  briefcase: "M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  puzzle: "M19.5 12.6c-1.2 0-2.2-1-2.2-2.2s1-2.2 2.2-2.2H21V5a2 2 0 0 0-2-2h-3.4c0-1.2-1-2.2-2.2-2.2s-2.2 1-2.2 2.2H5a2 2 0 0 0-2 2v3.2c1.2 0 2.2 1 2.2 2.2S4.2 12.6 3 12.6V19a2 2 0 0 0 2 2h3.4c0-1.2 1-2.2 2.2-2.2s2.2 1 2.2 2.2H19a2 2 0 0 0 2-2v-3.4c-1.2 0-2.2-1-2.2-2.2",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  leaf: "M6 3v8a5 5 0 0 0 10 0V3M6 3h10M3 21c2-6 5-9 9-9",
};

export function CategoryIcon({ name, size = 20 }: { name?: string; size?: number }) {
  const d = (name && PATHS[name]) || PATHS.sparkle;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
