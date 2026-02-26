import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monochromatic ink palette
        ink: {
          50:  "#f5f5f4",
          100: "#e8e7e5",
          200: "#d1cfcc",
          300: "#b0ada8",
          400: "#8a8680",
          500: "#6b6760",
          600: "#514e49",
          700: "#3a3834",
          800: "#252422",
          900: "#171614",
          950: "#0d0c0b",
        },
        // Single accent — FreedomPodcasting red
        accent: {
          DEFAULT: "#bc423a",
          light:   "#d45047",
          dark:    "#9e3530",
          muted:   "#bc423a33",
        },
      },
      fontFamily: {
        display: ["Raleway", "Georgia", "sans-serif"],
        body:    ["PT Sans", "system-ui", "sans-serif"],
        mono:    ["PT Mono", "monospace"],
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up":   "fade-up 0.5s ease-out forwards",
        "fade-in":   "fade-in 0.4s ease-out forwards",
        shimmer:     "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
