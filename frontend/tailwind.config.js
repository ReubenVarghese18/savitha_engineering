/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF4D00',
        molten: '#FA5D19',
        surface: '#0A0A0B',
        neon: '#FF4D00',
      },
    },
  },
  plugins: [],
}
