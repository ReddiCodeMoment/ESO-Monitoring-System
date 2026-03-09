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
            50: '#fff5f5',
            100: '#ffe0e0',
            500: '#CF0E28',
            600: '#a50b20',
            700: '#780817',
        },
        success: '#4caf50',
        danger: '#f44336',
        warning: '#ff9800',
        info: '#2196f3',
      },
    },
  },
  plugins: [],
} satisfies Config
