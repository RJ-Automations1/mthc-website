/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4a9b8',
          400: '#ed7a93',
          500: '#e04d6f',
          600: '#cc2d55',
          700: '#ab2045',
          800: '#8b1d3b',
          900: '#7a1b37',
          950: '#440a1a',
          DEFAULT: '#800000',
        },
        gold: {
          DEFAULT: '#C5A551',
          light: '#D4B96E',
          dark: '#A68B3C',
        },
      },
      fontFamily: {
        heading: ['Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
