/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#64748b",
        background: "#f8fafc",
        surface: "#ffffff",
        "on-surface": "#0f172a",
        "outline-variant": "#e2e8f0",
      },
    },
  },
  plugins: [],
}
