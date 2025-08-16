/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4f1',
          100: '#dce7df',
          200: '#bdd0c2',
          300: '#96b19d',
          400: '#6e8f75',
          500: '#2C5530',
          600: '#254a2a',
          700: '#1f3f24',
          800: '#1a341e',
          900: '#162a19',
        },
        secondary: {
          50: '#f7f3ed',
          100: '#ede3d4',
          200: '#ddc7a9',
          300: '#caa67e',
          400: '#b78956',
          500: '#8B6F47',
          600: '#7a5f3c',
          700: '#695032',
          800: '#584228',
          900: '#47361f',
        },
        accent: {
          50: '#fdf4e7',
          100: '#fae6c7',
          200: '#f4c98e',
          300: '#eeac55',
          400: '#e8921e',
          500: '#D2691E',
          600: '#b85a19',
          700: '#9e4d15',
          800: '#834011',
          900: '#69330d',
        },
        surface: '#F8F4E6',
        background: '#FDFBF7',
        success: '#4A7C59',
        warning: '#DAA520',
        error: '#B22222',
        info: '#4682B4'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-dot': 'pulse 1.5s ease-in-out infinite',
        'stream': 'stream 2s ease-in-out infinite',
      },
      keyframes: {
        stream: {
          '0%': { opacity: '0.4' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.4' }
        }
      }
    },
  },
  plugins: [],
}