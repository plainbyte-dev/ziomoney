/** @type {import('tailwindcss').Config} */

// rgb(var(--x) / <alpha-value>) lets each token flip between the :root and
// .dark values defined in app/global.css while still supporting Tailwind's
// opacity modifiers (e.g. text-heading/70) — see darkMode: "class" below.
function themeColor(variable) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Logo green — primary accent (buttons, active nav, focus rings).
          green: themeColor("--brand-green"),
          "green-dark": themeColor("--brand-green-dark"),
          "green-light": themeColor("--brand-green-light"),
          // Logo blue — links, panel header bars, secondary accent.
          blue: themeColor("--brand-blue"),
          "blue-dark": themeColor("--brand-blue-dark"),
          "blue-light": themeColor("--brand-blue-light"),
        },
        surface: themeColor("--color-surface"),
        panel: themeColor("--color-panel"),
        border: themeColor("--color-border"),
        muted: themeColor("--color-muted"),
        heading: themeColor("--color-heading"),
      },
      borderRadius: {
        xl: "12px",
        "2xl": "20px",
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
