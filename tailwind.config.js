/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fbf3f4',
          100: '#f6e3e6',
          200: '#ecc4cb',
          300: '#dc97a3',
          400: '#c4606f',
          500: '#a83a4b',
          600: '#8f2637',
          700: '#7a1d2d',
          800: '#621724',
          900: '#4d121c',
          950: '#2b080e',
          DEFAULT: '#7a1d2d',
        },
        gold: {
          DEFAULT: '#C9A54E',
          light: '#E2C67D',
          dark: '#A3842F',
        },
        ink: {
          DEFAULT: '#120c0d',
          800: '#1d1416',
          700: '#2a1e20',
        },
        cream: '#faf7f2',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'Impact', 'sans-serif'],
        heading: ['"Barlow Condensed"', 'Impact', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slow-zoom': {
          '0%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'slow-zoom': 'slow-zoom 12s ease-out both',
      },
    },
  },
  plugins: [],
};
