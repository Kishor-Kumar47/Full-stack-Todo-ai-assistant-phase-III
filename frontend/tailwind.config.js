/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // red-500
          600: '#dc2626', // red-600
          700: '#b91c1c', // red-700
          800: '#991b1b', // red-800
          900: '#7f1d1d', // red-900
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a', // black-like dark
        }
      },
      backgroundColor: {
        'main': '#0f172a', // dark background
        'card': '#1e293b', // card background
      },
      textColor: {
        'primary': '#ef4444', // red text
        'secondary': '#f8fafc', // light text
        'muted': '#94a3b8', // muted text
      }
    },
  },
  plugins: [],
}