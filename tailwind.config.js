/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'dotted-pattern': "radial-gradient(circle, #000 10%, transparent 10%)",
      },
    },
  },
  plugins: [],
};