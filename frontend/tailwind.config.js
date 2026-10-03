/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: { 50: '#eef7f2', 100: '#d8ece0', 600: '#287454', 700: '#1b5a40', 800: '#123b32' },
        sand: '#f7f6f1'
      },
      boxShadow: { card: '0 12px 34px rgba(21, 52, 42, .08)' }
    }
  },
  plugins: []
};
