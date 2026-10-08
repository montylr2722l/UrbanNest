import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // -----------------------------------------------------------------------
      // UrbanNest Brand Colors
      // Fashion-forward: warm neutral base, deep ink, gold accent
      // -----------------------------------------------------------------------
      colors: {
        // Primary brand palette
        brand: {
          50: "#faf7f4",
          100: "#f3ede5",
          200: "#e6d8c8",
          300: "#d5bfa0",
          400: "#c19f76",
          500: "#b08558",  // Primary brand warm tone
          600: "#9c7149",
          700: "#815d3c",
          800: "#6a4d34",
          900: "#57412d",
          950: "#2e2017",
        },
        // Deep ink for primary text and CTAs
        ink: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#3d3d3d",
          950: "#111111", // Near-black for primary text
        },
        // Gold accent — premium highlights, badges, prices
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Semantic colors
        success: {
          50: "#f0fdf4",
          500: "#22c55e",
          700: "#15803d",
        },
        warning: {
          50: "#fffbeb",
          500: "#f59e0b",
          700: "#b45309",
        },
        error: {
          50: "#fef2f2",
          500: "#ef4444",
          700: "#b91c1c",
        },
      },

      // -----------------------------------------------------------------------
      // Typography
      // -----------------------------------------------------------------------
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        display: ["var(--font-playfair)", ...fontFamily.serif], // For editorial headings
      },

      // -----------------------------------------------------------------------
      // Spacing extensions
      // -----------------------------------------------------------------------
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },

      // -----------------------------------------------------------------------
      // Max widths for content containers
      // -----------------------------------------------------------------------
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },

      // -----------------------------------------------------------------------
      // Border radius
      // -----------------------------------------------------------------------
      borderRadius: {
        "4xl": "2rem",
      },

      // -----------------------------------------------------------------------
      // Animations — restrained, premium
      // -----------------------------------------------------------------------
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },

      // -----------------------------------------------------------------------
      // Box shadows — subtle, premium
      // -----------------------------------------------------------------------
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover":
          "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)",
        product:
          "0 0 0 1px rgb(0 0 0 / 0.04), 0 2px 8px rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
