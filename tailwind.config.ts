import type { Config } from "tailwindcss";

// Helper: màu dùng RGB-channel var để hỗ trợ opacity modifier (vd bg-card/50)
const withAlpha = (rgbVar: string) => `rgb(var(${rgbVar}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Theme-aware (đổi theo data-theme)
        bg: withAlpha("--rgb-bg"),
        surface: withAlpha("--rgb-surface"),
        card: withAlpha("--rgb-card"),
        border: withAlpha("--rgb-border"),
        primary: withAlpha("--rgb-primary"),
        accent: withAlpha("--rgb-accent"),
        muted: withAlpha("--rgb-muted"),
        up: withAlpha("--rgb-up"),
        down: withAlpha("--rgb-down"),
        gold: withAlpha("--rgb-gold"),
        warn: withAlpha("--rgb-gold"),
        heading: withAlpha("--rgb-heading"),
        fg: withAlpha("--rgb-fg"),
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        ticker: "ticker 40s linear infinite",
        fadeIn: "fadeIn 0.3s ease",
        pulse: "pulse 2s ease infinite",
      },
      keyframes: {
        ticker: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        fadeIn: { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;
