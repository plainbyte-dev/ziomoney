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
          "blue-dark": "#2555C7",
          "blue-light": "#EAF1FE",
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
        "card-hover": "0 4px 12px rgba(16, 24, 40, 0.08), 0 2px 4px rgba(16, 24, 40, 0.06)",
        popover: "0 12px 32px rgba(16, 24, 40, 0.14), 0 4px 10px rgba(16, 24, 40, 0.08)",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
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
