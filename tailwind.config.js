/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pine: {
          forest: '#2D5016',      // Dark forest green (main brand color)
          sage: '#4A7C59',        // Lighter green for accents
          moss: '#6B8E23',        // Medium green for highlights
          cream: '#F5F5DC',       // Natural cream background
          sand: '#F4E4BC',        // Beach sand color
          bark: '#3C2414',        // Dark brown for text
          stone: '#8B7355',       // Natural stone color
          water: '#87CEEB',       // Sky blue for water elements
          sun: '#FFD700'          // Golden yellow for sun accents
        }
      },
      fontFamily: {
        'rustic': ['Georgia', 'Times New Roman', 'serif'],
        'outdoor': ['Arial Black', 'Arial', 'sans-serif'],
        'natural': ['Trebuchet MS', 'Arial', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
};