/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Manrope", "Arial", "sans-serif"] },
      colors: {
        navy: "#062b5c",
        brand: "#0875e1",
        ink: "#17243a",
        muted: "#6c7a90",
        page: "#f4f8fc",
      },
    },
  },
  plugins: [],
};
