/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF3F8',
          100: '#D6E1EC',
          200: '#AEC2D7',
          500: '#2B5278',
          600: '#1C3B5A',
          700: '#15304B',
          800: '#0F2942',
          900: '#0A1C2E',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
