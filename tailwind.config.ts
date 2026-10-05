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
      fontFamily: {
        sans: ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: "hsl(var(--primary-dark))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "hsl(0 0% 100%)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.7s cubic-bezier(0,0,.2,1) forwards",
        "fade-in": "fadeIn 0.7s cubic-bezier(0,0,.2,1) forwards",
        "crown-float": "crown-float 2.4s ease-in-out infinite",
        "crown-glow": "crown-glow 2.4s ease-in-out infinite",
        "crown-sparkle": "crown-sparkle 1.8s ease-in-out infinite",
      },
      transitionTimingFunction: {
        habitus: "cubic-bezier(.4,0,.2,1)",
        "habitus-in": "cubic-bezier(0,0,.2,1)",
      },
    },
  },
  plugins: [],
};
export default config;

