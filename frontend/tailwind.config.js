/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/react/**/*.js",
  ],
  theme: {
    extend: {
      transitionProperty: {
        padding: "padding",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto Flex", "sans-serif"],
      },
    },
  },
  plugins: [],
};
