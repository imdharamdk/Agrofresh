/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        leaf: '#16a34a',
        moss: '#14532d',
        cream: '#f7fee7'
      },
      boxShadow: {
        soft: '0 20px 45px rgba(20, 83, 45, 0.12)'
      }
    }
  },
  plugins: []
};
