import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,md,mdx}", "./content/**/*.md"],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#053F52",
          50:  "#EAF2F5",
          100: "#CFDFE5",
          200: "#9EC0CB",
          300: "#5D8A99",
          400: "#245A70",
          500: "#053F52",
          600: "#043445",
          700: "#032A38",
          800: "#02202C",
          900: "#011821",
        },
        coral: {
          DEFAULT: "#F1664C",
          50:  "#FEEEE9",
          100: "#FCD8CE",
          200: "#F9B4A0",
          300: "#F58971",
          400: "#F1664C",
          500: "#E44D31",
          600: "#C63A22",
          700: "#95291A",
        },
        ink:  "#0E1E28",
        mist: "#F6F8F9",
        line: "#E4EAED",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(5,63,82,.04), 0 8px 24px -8px rgba(5,63,82,.10)",
        lift: "0 2px 4px rgba(5,63,82,.06), 0 24px 48px -20px rgba(5,63,82,.20)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      maxWidth: {
        page: "1200px",
      },
    },
  },
  plugins: [],
};
export default config;
