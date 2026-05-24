import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"], // Makes Plus Jakarta Sans your default font!
      },
      colors: {
        brand: {
          dark: "#0a0a0f",
          "dark-card": "#13131a",
        },
        accent: {
          primary: "#0055cc",
          secondary: "#66aaff",
        },
        text: {
          main: "#0a0a0f",
          muted: "#52525b",
        },
        bg: {
          light: "#fafafa",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0055cc 0%, #66aaff 100%)",
        "hero-gradient": "radial-gradient(circle at 50% -20%, #1a1a2e, #0a0a0f)",
      },
      borderRadius: {
        lg: "20px",
        btn: "99px",
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
        hover: "0 20px 40px -12px rgba(0, 0, 0, 0.12)",
        glow: "0 10px 30px -10px rgba(0, 85, 204, 0.4)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        "500": "500ms",
      },
    },
  },
  plugins: [],
};
export default config;