/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f7f5f2",
          100: "#ece7e0",
          200: "#d8d0c3",
          300: "#bfb29f",
          400: "#9f8f78",
          500: "#87745c",
          600: "#6e5d49",
          700: "#55483a",
          800: "#2a2622",
          900: "#171411",
        },
        gold: {
          100: "#f5ecd8",
          300: "#dcc89a",
          500: "#bfa46a",
          700: "#8f7440",
        },
        sand: "#f3efe8",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Manrope"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 50px -30px rgba(23, 20, 17, 0.45)",
      },
      letterSpacing: {
        luxe: "0.22em",
      },
    },
  },
  plugins: [],
};
