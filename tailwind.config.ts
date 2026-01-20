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
        background: "#FAFAF9", // Stone-50
        foreground: "#0C0A09", // Stone-950
        primary: {
          DEFAULT: "#CA8A04", // Yellow-600 (Gold/Bronze)
          foreground: "#FFFFFF",
          50: "#FEFCE8",
          100: "#FEF9C3",
          500: "#EAB308",
          600: "#CA8A04", // Primary
          700: "#A16207",
        },
        secondary: {
          DEFAULT: "#44403C", // Stone-700
          foreground: "#FAFAF9",
        },
        muted: {
          DEFAULT: "#F5F5F4", // Stone-100
          foreground: "#78716C", // Stone-500
        },
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.7)", // Glass
          foreground: "#0C0A09",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
export default config;
