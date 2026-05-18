import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0E1A",
        surface: "#111827",
        card: "#161D2F",
        border: "#1F2D45",
        primary: "#00C896",
        accent: "#3B82F6",
        muted: "#64748B",
        up: "#00C896",
        down: "#EF4444",
        gold: "#F59E0B",
        warn: "#F59E0B",
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
