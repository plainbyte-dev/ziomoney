/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#1AA260",
          "green-dark": "#0F8A4F",
          "green-light": "#E7F7EF",
          blue: "#2F6FED",
        },
        surface: "#F5F7FA",
        panel: "#FFFFFF",
        border: "#E7EAEE",
        muted: "#8A93A3",
        heading: "#1F2937",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
