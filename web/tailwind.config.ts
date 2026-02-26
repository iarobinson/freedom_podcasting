import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8",
          300: "#f9a8d4", 400: "#f472b6", 500: "#ec4899",
          600: "#db2777", 700: "#be185d", 800: "#9d174d", 900: "#831843",
        },
        ink: {
          50:  "#f8f7f4", 100: "#f0ede6", 200: "#e1dbd0",
          300: "#c8bfae", 400: "#a89880", 500: "#8a7660",
          600: "#6e5c48", 700: "#564738", 800: "#3d3228", 900: "#241d18",
          950: "#120e0b",
        },
      },
      fontFamily: {
        sans:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        mono:    ["var(--font-dm-mono)", "monospace"],
      },
      borderRadius: {
        lg: "0.75rem", md: "0.5rem", sm: "0.375rem",
      },
      keyframes: {
        "fade-up":   { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in":   { from: { opacity: "0" }, to: { opacity: "1" } },
        "shimmer":   { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        "pulse-dot": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
      },
      animation: {
        "fade-up":   "fade-up 0.4s ease-out forwards",
        "fade-in":   "fade-in 0.3s ease-out forwards",
        "shimmer":   "shimmer 2s linear infinite",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
