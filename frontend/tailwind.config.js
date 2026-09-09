/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',
        brand: {
          DEFAULT: '#0c4a6e',
          light: '#e0f2fe',
          dark: '#082f49',
        },
        accent: '#14b8a6',
        dark: '#0f172a',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 12px 32px rgba(15, 23, 42, 0.07)',
      },
    },
  },
  plugins: [],
}
