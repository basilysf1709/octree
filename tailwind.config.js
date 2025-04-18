/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class'],
  content: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Modern Blue Palette
        primary: '#2563EB', // Bright blue
        secondary: '#1D4ED8', // Deep blue
        tertiary: '#1E40AF', // Dark blue
        accent: '#60A5FA', // Light blue
        background: '#F0F7FF', // Very light blue
        border: '#BFDBFE', // Soft blue

        // Additional blue shades for flexibility
        blue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
      },
    },
  },
};

export default config;
