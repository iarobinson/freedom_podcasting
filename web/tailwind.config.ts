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
          50:  "#f9f8f7",
          100: "#f2f0ee",
          200: "#e8e6e3",
          300: "#d8d5d2",
          400: "#c2bfbb",
          500: "#a8a5a0",
          600: "#72706b",
          700: "#3a3834",
          800: "#252422",
          900: "#171614",
          950: "#0d0c0b",
        },
        // Single accent — FreedomPodcasting red
        accent: {
          DEFAULT: "#cc0000",
          light:   "#e01a1a",
          dark:    "#aa0000",
          muted:   "#cc000033",
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
