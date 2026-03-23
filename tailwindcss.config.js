/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryGreen: "#1B5E20",   // deep forest
        lightGreen: "#A5D6A7",     // leaf green
        accentBeige: "#FFF8E1",    // earthy background
        darkText: "#2E2E2E",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};