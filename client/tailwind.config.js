/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'oneadvanced': {
          DEFAULT: '#e9510e',
          50: '#fff5ed',
          100: '#ffe9d6',
          200: '#ffcfac',
          300: '#ffad77',
          400: '#ff8040',
          500: '#fe5e1a',
          600: '#e9510e',
          700: '#c33b0e',
          800: '#9b3014',
          900: '#7c2914',
        }
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif']
      }
    },
  },
  plugins: [],
}
