import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: '#F8F8F7',
        primary: {
          50: '#e0f2f1',
          100: '#b2dfdb',
          500: '#128DA1',
          600: '#0e7a8a',
          700: '#0a627a',
        },
        secondary: '#FF4E69',
        heading: '#00332B',
        background: '#D9E3DA',
        success: '#4caf50',
        danger: '#f44336',
        warning: '#ff9800',
        info: '#2196f3',
      },
    },
  },
  plugins: [],
} satisfies Config
