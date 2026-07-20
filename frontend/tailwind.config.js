/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        slate: { 925: '#0b1120' },
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          400: '#5c8df6',
          500: '#3868e0',
          600: '#2a52c2',
          700: '#233f97',
          900: '#152357',
        },
        clay: '#c26b4f',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};