/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef1f7',
          100: '#d4dbe9',
          200: '#a9b7d3',
          300: '#7e93bd',
          400: '#4d5f8a',
          500: '#1f2f57',
          600: '#182446',
          700: '#121b35',
          800: '#0c1224',
          900: '#060912',
        },
        coop: {
          50: '#eafaf1',
          100: '#c9f0da',
          200: '#93e0b5',
          300: '#5ccb8f',
          400: '#31ad6c',
          500: '#1e8f54',
          600: '#177243',
          700: '#125734',
          800: '#0c3c24',
          900: '#062215',
        },
        saffron: {
          50: '#fff4ea',
          100: '#ffe2c2',
          200: '#ffc385',
          300: '#ffa348',
          400: '#f9861f',
          500: '#e26e0a',
          600: '#b95707',
          700: '#8f4306',
          800: '#663005',
          900: '#3d1d03',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 14px rgba(18, 27, 53, 0.08)',
        cardHover: '0 10px 30px rgba(18, 27, 53, 0.14)',
      },
    },
  },
  plugins: [],
}
