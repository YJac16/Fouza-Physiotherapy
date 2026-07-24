import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    screens: {
      xs: "320px",
      sm: "375px",
      "sm-md": "425px",
      md: "768px",
      tablet: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          soft: "hsl(var(--accent-soft))",
          "soft-foreground": "hsl(var(--accent-soft-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        clinic: {
          teal: "hsl(var(--clinic-teal))",
          sage: "hsl(var(--clinic-sage))",
          slate: "hsl(var(--clinic-slate))",
          mist: "hsl(var(--clinic-mist))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      fontSize: {
        display: [
          "clamp(2.5rem, 5vw, 3.75rem)",
          { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "600" },
        ],
        h1: [
          "clamp(2rem, 4vw, 3rem)",
          { lineHeight: "1.15", letterSpacing: "-0.025em", fontWeight: "600" },
        ],
        h2: [
          "clamp(1.625rem, 3vw, 2.25rem)",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        h3: [
          "clamp(1.375rem, 2.5vw, 1.75rem)",
          { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        h4: ["1.25rem", { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "600" }],
        h5: ["1.125rem", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "600" }],
        subtitle: ["1.125rem", { lineHeight: "1.55", fontWeight: "500" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7", fontWeight: "400" }],
        body: ["1rem", { lineHeight: "1.65", fontWeight: "400" }],
        small: ["0.875rem", { lineHeight: "1.55", fontWeight: "400" }],
        caption: [
          "0.75rem",
          { lineHeight: "1.45", letterSpacing: "0.04em", fontWeight: "500" },
        ],
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        "soft-lg": "var(--shadow-soft-lg)",
      },
      transitionDuration: {
        "220": "220ms",
        "350": "350ms",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.35" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-up": "slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        shimmer: "shimmer 1.5s infinite",
        ripple: "ripple 0.6s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
