/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kiri: {
          green: {
            950: '#001A12',
            900: '#00261A',
            800: '#063D2D',
            700: '#0F543F',
            600: '#166E53',
            500: '#228B6B',
            400: '#3DAB88',
            300: '#69CAA9',
            200: '#A4E3CD',
            100: '#D8F3E9',
            50: '#F0F9F5',
          },
          gold: {
            900: '#5C4307',
            800: '#7A5908',
            700: '#9B710B',
            600: '#C29117',
            500: '#D8AE5A',
            400: '#E5C378',
            300: '#F0D69C',
            200: '#F8E9C5',
            100: '#FCF5E4',
            50: '#FEFCF7',
          },
          ivory: {
            DEFAULT: '#FCF9F2',
            warm: '#F8F5EE',
            sand: '#EFE7DA',
            muted: '#E5E2DB',
          },
          dark: {
            950: '#0A0805',
            900: '#110E07',
            850: '#16130C',
            800: '#1E1B13',
            750: '#231F17',
            700: '#2D2920',
            600: '#3D382E',
          }
        }
      },
      fontFamily: {
        serif: ['"Libre Caslon Text"', 'Cinzel', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 8px -2px rgba(6, 61, 45, 0.06), 0 1px 4px -1px rgba(6, 61, 45, 0.04)',
        'elevated': '0 12px 32px -4px rgba(6, 61, 45, 0.08), 0 4px 12px -2px rgba(6, 61, 45, 0.04)',
        'gold-glow': '0 0 20px -2px rgba(216, 174, 90, 0.25)',
      }
    },
  },
  plugins: [],
}
