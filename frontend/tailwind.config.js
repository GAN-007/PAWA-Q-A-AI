module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
      extend: {
        colors: {
          'matrix-green': '#00FF00',
          'matrix-yellow': '#FFD700',
          'matrix-blue': '#00BFFF',
          'matrix-highlight': '#00FFFF',
          'matrix-dark': '#0f172a'
        },
        fontFamily: {
          sans: ['Segoe UI', 'Helvetica', 'Arial', 'sans-serif']
        },
        animation: {
          'fade-in': 'fade-in 0.3s ease-out forwards'
        },
        keyframes: {
          'fade-in': {
            '0%': { opacity: 0, transform: 'translateY(10px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }
      }
    },
    plugins: []
  }