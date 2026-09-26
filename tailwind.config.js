/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Anton"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
      },
      colors: {
        background: '#EFEBE0',
        ink: '#111112',
        lime: '#D2FF00',
        muted: '#6B6B70',
        card: '#F5F2E9',
      },
    },
  },
  plugins: [],
};
