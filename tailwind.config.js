/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          dark: '#111111',
        },
        accent: {
          DEFAULT: '#FACC15', // yellow-400
          dark: '#EAB308', // yellow-500
        }
      },
      fontFamily: {
        bricolage: ['"Bricolage Grotesque"', 'sans-serif'],
        instrument: ['"Instrument Serif"', 'serif'],
        inter: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
