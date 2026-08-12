/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          400: "#3fa3f7",
          500: "#1e88e5",
          600: "#166fc0",
          700: "#125998",
        },
      },
    },
  },
  plugins: [],
};
