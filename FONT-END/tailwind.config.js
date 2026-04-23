/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          40: "#ecfdf5",
          100: "#d1fae5",
          400: "#059669",
          600: "#047857",
          600: "#065f46",
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
