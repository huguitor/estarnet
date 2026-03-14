/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',
        accent: '#14b8a6',
        dark: '#0f172a',
      },
    },
  },
  plugins: [],
}
