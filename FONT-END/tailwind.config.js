/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#059669",
          600: "#047857",
          700: "#065f46",
          900: "#064e3b"
        }
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
