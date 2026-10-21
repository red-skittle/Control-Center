import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: "#000000",
          secondaryBg: "#0B0B0E",
          blue: "#0A84FF",
          green: "#30D158",
          indigo: "#5E5CE6",
          purple: "#BF5AF2",
          orange: "#FF9F0A",
          yellow: "#FFD60A",
          red: "#FF453A",
          labelPrimary: "#FFFFFF",
          labelSecondary: "rgba(235, 235, 245, 0.60)",
          labelTertiary: "rgba(235, 235, 245, 0.38)",
          labelQuaternary: "rgba(235, 235, 245, 0.18)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
