import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Useaimly Semantic Domain Tokens
        Useaimly: {
          // Trajectory States
          "on-track": {
            DEFAULT: "hsl(var(--trajectory-on-track))",
            foreground: "hsl(var(--trajectory-on-track-foreground))",
            muted: "hsl(var(--trajectory-on-track-muted))",
            border: "hsl(var(--trajectory-on-track-border))",
          },
          "at-risk": {
            DEFAULT: "hsl(var(--trajectory-at-risk))",
            foreground: "hsl(var(--trajectory-at-risk-foreground))",
            muted: "hsl(var(--trajectory-at-risk-muted))",
            border: "hsl(var(--trajectory-at-risk-border))",
          },
          "off-track": {
            DEFAULT: "hsl(var(--trajectory-off-track))",
            foreground: "hsl(var(--trajectory-off-track-foreground))",
            muted: "hsl(var(--trajectory-off-track-muted))",
            border: "hsl(var(--trajectory-off-track-border))",
          },
          ahead: {
            DEFAULT: "hsl(var(--trajectory-ahead))",
            foreground: "hsl(var(--trajectory-ahead-foreground))",
            muted: "hsl(var(--trajectory-ahead-muted))",
            border: "hsl(var(--trajectory-ahead-border))",
          },

          // Financial Domains
          income: {
            DEFAULT: "hsl(var(--finance-income))",
            muted: "hsl(var(--finance-income-muted))",
          },
          expense: {
            DEFAULT: "hsl(var(--finance-expense))",
            muted: "hsl(var(--finance-expense-muted))",
          },
          savings: {
            DEFAULT: "hsl(var(--finance-savings))",
            muted: "hsl(var(--finance-savings-muted))",
          },
          debt: {
            DEFAULT: "hsl(var(--finance-debt))",
            muted: "hsl(var(--finance-debt-muted))",
          },
          goal: {
            DEFAULT: "hsl(var(--finance-goal))",
            muted: "hsl(var(--finance-goal-muted))",
          },
          projection: {
            DEFAULT: "hsl(var(--finance-projection))",
            muted: "hsl(var(--finance-projection-muted))",
          },

          // African-inspired core pigments
          clay: "#C25E3E",       // Warm Terracotta Ochre
          sand: "#EFECE6",       // Rift Valley Sandstone
          acacia: "#0E1117",     // Deep Acacia Obsidian Charcoal
          linen: "#FAF8F5",      // Pure Warm Linen
          forest: "#1E824C",     // Serene Kenyan Highland Forest Green
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.75rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "elevation-1": "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "elevation-2": "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
        "elevation-3": "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        "trajectory-glow": "0 0 24px -4px rgba(30, 130, 76, 0.15)",
        "warm-subtle": "0 10px 30px -10px rgba(14, 17, 23, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
