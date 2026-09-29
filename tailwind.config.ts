import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sqr: {
          orange: "#E85D04",
          brown: "#7B3F00",
          cream: "#FFF8E7",
          green: "#2D6A4F",
          dark: "#1A1A1A",
          gold: "#FFB703",
          leaf: "#40916C",
          sky: "#A8DADC",
        },
      },
      fontFamily: {
        pixel: ["'Press Start 2P'", "cursive"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
