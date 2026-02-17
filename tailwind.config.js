/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          dark: "#1a1a2e",
        },
        sidebar: {
          DEFAULT: "#f8f9fa",
          dark: "#16213e",
        },
      },
    },
  },
  plugins: [],
};
