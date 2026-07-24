/**
 * Fouza Physiotherapy — Design Tokens
 * Single source of truth for colours, type, spacing, motion, and elevation.
 */

export const colours = {
  light: {
    background: "186 40% 99%", // soft teal-tinted white
    foreground: "240 1% 38%", // logo wordmark grey #606062
    card: "0 0% 100%",
    "card-foreground": "240 1% 38%",
    popover: "0 0% 100%",
    "popover-foreground": "240 1% 38%",
    primary: "186 60% 59%", // logo teal #59C9D5
    "primary-foreground": "240 2% 18%",
    secondary: "186 25% 96%",
    "secondary-foreground": "240 1% 32%",
    muted: "186 18% 95%",
    "muted-foreground": "240 1% 42%",
    accent: "186 55% 42%", // deeper teal
    "accent-foreground": "0 0% 100%",
    "accent-soft": "186 53% 94%",
    "accent-soft-foreground": "186 45% 28%",
    destructive: "0 72% 51%",
    "destructive-foreground": "0 0% 100%",
    success: "152 55% 36%",
    "success-foreground": "0 0% 100%",
    warning: "38 92% 48%",
    "warning-foreground": "240 1% 38%",
    info: "186 55% 50%",
    "info-foreground": "0 0% 100%",
    border: "186 16% 88%",
    input: "186 16% 88%",
    ring: "186 60% 59%",
  },
  dark: {
    background: "186 18% 8%",
    foreground: "186 20% 96%",
    card: "186 16% 11%",
    "card-foreground": "186 20% 96%",
    popover: "186 16% 11%",
    "popover-foreground": "186 20% 96%",
    primary: "186 55% 58%",
    "primary-foreground": "186 18% 8%",
    secondary: "186 14% 16%",
    "secondary-foreground": "186 20% 96%",
    muted: "186 14% 16%",
    "muted-foreground": "186 10% 65%",
    accent: "186 50% 48%",
    "accent-foreground": "186 18% 8%",
    "accent-soft": "186 28% 16%",
    "accent-soft-foreground": "186 40% 72%",
    destructive: "0 62% 48%",
    "destructive-foreground": "0 0% 100%",
    success: "152 50% 42%",
    "success-foreground": "0 0% 100%",
    warning: "38 92% 50%",
    "warning-foreground": "186 18% 8%",
    info: "186 55% 55%",
    "info-foreground": "186 18% 8%",
    border: "186 12% 20%",
    input: "186 12% 20%",
    ring: "186 55% 58%",
  },
} as const;

export const typography = {
  fontFamily: {
    sans: "var(--font-sans)",
    display: "var(--font-display)",
  },
  scale: {
    display: {
      size: "clamp(2.5rem, 5vw, 3.75rem)",
      lineHeight: "1.08",
      letterSpacing: "-0.03em",
      weight: "600",
    },
    h1: {
      size: "clamp(2rem, 4vw, 3rem)",
      lineHeight: "1.15",
      letterSpacing: "-0.025em",
      weight: "600",
    },
    h2: {
      size: "clamp(1.625rem, 3vw, 2.25rem)",
      lineHeight: "1.2",
      letterSpacing: "-0.02em",
      weight: "600",
    },
    h3: {
      size: "clamp(1.375rem, 2.5vw, 1.75rem)",
      lineHeight: "1.25",
      letterSpacing: "-0.015em",
      weight: "600",
    },
    h4: {
      size: "1.25rem",
      lineHeight: "1.35",
      letterSpacing: "-0.01em",
      weight: "600",
    },
    h5: {
      size: "1.125rem",
      lineHeight: "1.4",
      letterSpacing: "-0.01em",
      weight: "600",
    },
    subtitle: {
      size: "1.125rem",
      lineHeight: "1.55",
      weight: "500",
    },
    "body-lg": {
      size: "1.125rem",
      lineHeight: "1.7",
      weight: "400",
    },
    body: {
      size: "1rem",
      lineHeight: "1.65",
      weight: "400",
    },
    small: {
      size: "0.875rem",
      lineHeight: "1.55",
      weight: "400",
    },
    caption: {
      size: "0.75rem",
      lineHeight: "1.45",
      weight: "500",
      letterSpacing: "0.04em",
    },
    button: {
      size: "0.9375rem",
      lineHeight: "1",
      weight: "600",
    },
    nav: {
      size: "0.9375rem",
      lineHeight: "1.4",
      weight: "500",
    },
  },
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  section: {
    sm: "3rem",
    md: "5rem",
    lg: "7rem",
  },
} as const;

export const radii = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.25rem",
  full: "9999px",
} as const;

export const shadows = {
  soft: "0 4px 24px -4px hsl(215 28% 14% / 0.08), 0 2px 8px -2px hsl(215 28% 14% / 0.04)",
  "soft-lg":
    "0 12px 40px -8px hsl(215 28% 14% / 0.12), 0 4px 16px -4px hsl(215 28% 14% / 0.06)",
  softDark:
    "0 4px 24px -4px hsl(0 0% 0% / 0.35), 0 2px 8px -2px hsl(0 0% 0% / 0.25)",
} as const;

export const motion = {
  duration: {
    fast: "150ms",
    base: "220ms",
    slow: "350ms",
    slower: "500ms",
  },
  easing: {
    premium: "cubic-bezier(0.22, 1, 0.36, 1)",
    standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export const breakpoints = {
  xs: "320px",
  sm: "375px",
  "sm-md": "425px",
  md: "768px",
  tablet: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const zIndex = {
  dropdown: 50,
  sticky: 40,
  modal: 50,
  toast: 60,
  tooltip: 70,
} as const;

export const designTokens = {
  colours,
  typography,
  spacing,
  radii,
  shadows,
  motion,
  breakpoints,
  zIndex,
} as const;

export type DesignTokens = typeof designTokens;
