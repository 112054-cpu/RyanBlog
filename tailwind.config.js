/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          gold: '#D4AF37',
          darkGold: '#B8860B',
          purple: '#4A148C',
          deepPurple: '#311B92',
          rose: '#C2185B',
          cream: '#FFF8E7',
        }
      },
      fontFamily: {
        'playfair': ['"Playfair Display"', 'serif'],
        'cormorant': ['Cormorant', 'serif'],
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
      }
    },
  },
  plugins: [],
}
