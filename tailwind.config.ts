import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          500: "#10B981",
          600: "#059669",
        },
        slate: {
          800: "#1E293B",
          900: "#0F172A",
        },
        blue: {
          500: "#111827",
        },
        orange: {
          500: "#F97316",
        },
        purple: {
          500: "#A855F7",
        },
      },
      borderRadius: {
        '8': '8px',
        '12': '12px',
      },
      boxShadow: {
        'premium': '0 10px 25px rgba(15, 23, 42, 0.1)',
        'premium-hover': '0 15px 35px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
};
export default config;
