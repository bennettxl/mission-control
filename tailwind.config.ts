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
        slate: {
          950: "#020205",
        },
        brand: {
          primary: "#d01f3c",
          primaryDark: "#a1172c",
          carbon: "#05070b",
          ink: "#0f1117",
          steel: "#1b1f29",
          ash: "#faf5f2",
          glow: "#ff395c",
        },
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at 20% -10%, rgba(255,57,92,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.08), transparent 50%)",
        "grid-circuit":
          "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      boxShadow: {
        mission:
          "0 25px 45px -20px rgba(208,31,60,0.55), 0 15px 40px -25px rgba(255,57,92,0.45)",
        "brand-card": "0 30px 60px -40px rgba(0,0,0,0.65)",
      },
      fontFamily: {
        display: ["Inter", "var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
