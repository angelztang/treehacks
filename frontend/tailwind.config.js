/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: {
    enabled: true,
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
      './public/index.html'
    ],
    options: {
      safelist: ['html', 'body']
    }
  },
  darkMode: false,
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
} 