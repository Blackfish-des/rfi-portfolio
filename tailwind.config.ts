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
        // RFI Brand — matches dashboard exactly
        "rmit-red": "#E3001B",
        "dark-navy": "#000054",
        "mid-grey": "#6B7280",
        "light-grey": "#F3F4F6",

        // Domain colors — 8 domains v2.0
        domain: {
          "earth-systems":   "#065F46", // green — earth, ecological
          "design":          "#1D4ED8", // blue — material futures
          "creative":        "#7C3AED", // purple — speculative, creative
          "economics":       "#B45309", // amber — economics, finance, law
          "governance":      "#000054", // dark navy — participatory governance
          "indigenous":      "#9F1239", // rose — indigenous, relational, equity
          "technology":      "#0369A1", // cyan — technology, AI
          "leadership":      "#374151", // slate — leadership, organisation
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
