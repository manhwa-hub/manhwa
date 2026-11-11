import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090b10",
        panel: "#121620",
        line: "rgba(255,255,255,.09)",
        accent: "#b6f36b",
      },
      boxShadow: {
        glow: "0 0 50px rgba(182,243,107,.12)",
      },
    },
  },
  plugins: [],
};

export default config;
