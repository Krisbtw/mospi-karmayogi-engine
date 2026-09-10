import type { Config } from "tailwindcss";

const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: withOpacity("--color-bg"),
        surface: withOpacity("--color-surface"),
        fg: withOpacity("--color-fg"),
        "fg-muted": withOpacity("--color-fg-muted"),
        border: withOpacity("--color-border"),
        primary: {
          DEFAULT: withOpacity("--color-primary"),
          foreground: withOpacity("--color-on-primary"),
        },
        secondary: {
          DEFAULT: withOpacity("--color-secondary"),
          foreground: withOpacity("--color-on-secondary"),
        },
        tertiary: {
          DEFAULT: withOpacity("--color-tertiary"),
          foreground: withOpacity("--color-on-tertiary"),
        },
        accent: {
          DEFAULT: withOpacity("--color-accent"),
          foreground: withOpacity("--color-on-accent"),
        },
        success: withOpacity("--color-success"),
        danger: withOpacity("--color-danger"),
        ring: withOpacity("--color-ring"),
      },
      fontFamily: {
        ui: ["var(--font-ui)"],
        data: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        "glow-accent": "var(--shadow-glow-accent)",
        "glow-secondary": "var(--shadow-glow-secondary)",
      },
      keyframes: {
        "ping-slow": {
          "75%, 100%": { transform: "scale(1.8)", opacity: "0" },
        },
        spotlight: {
          "0%": {
            opacity: "0",
            transform: "translate(-72%, -62%) scale(0.6)",
          },
          "100%": {
            opacity: "1",
            transform: "translate(-50%, -40%) scale(1)",
          },
        },
      },
      animation: {
        "ping-slow": "ping-slow 2.2s cubic-bezier(0, 0, 0.2, 1) infinite",
        spotlight: "spotlight 2s ease 0.3s 1 forwards",
      },
    },
  },
  plugins: [],
};

export default config;
