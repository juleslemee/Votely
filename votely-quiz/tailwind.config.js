/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '924px',  // Reduced from default 1024px
      'xl': '1280px',
    },
    extend: {
      colors: {
        background: {
          DEFAULT: '#EEF1EF',
          dark: '#1C2321',
        },
        foreground: {
          DEFAULT: '#1C2321',
          dark: '#EEF1EF',
        },
        primary: {
          light: '#C7A5E0',
          DEFAULT: '#B07DD5',
          dark: '#8E5DB0',
        },
        secondary: {
          light: '#7A00D9',
          DEFAULT: '#6200B3',
          dark: '#4A0086',
        },
      },
      fontFamily: {
        'ubuntu': ['Ubuntu', 'sans-serif'],
        'noto': ['Noto Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
} 