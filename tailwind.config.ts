import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        connect: {
          blue: "#1266C7",
          "deep-blue": "#0D478F",
          DEFAULT: "#1266C7",
        },
        platz: {
          gold: "#D9BB4C",
          "gold-light": "#F8DA56",
          DEFAULT: "#D9BB4C",
        },
        midnight: {
          black: "#080C14",
          surface: "#111827",
          card: "#1E293B",
          border: "#1F2937",
        },
        card: {
          DEFAULT: "#111827",
          foreground: "#F8FAFC",
        },
        muted: {
          DEFAULT: "#1F2937",
          foreground: "#94A3B8",
        },
        accent: {
          DEFAULT: "#1266C7",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
