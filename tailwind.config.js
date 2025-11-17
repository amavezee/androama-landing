/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#000000',
          dark: '#0a0a0a',
          gray: '#1a1a1a',
          pink: '#ec4899',
          'pink-dark': '#be185d',
          purple: '#a855f7',
          'purple-dark': '#7c3aed',
          white: '#ffffff',
          'white-dim': '#f8fafc',
        },
      },
      fontFamily: {
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
        sans: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        acquire: ['Acquire', 'sans-serif'],
      },
      animation: {
        'cyber-shimmer': 'cyber-shimmer 3s linear infinite',
        'cyber-float': 'cyber-float 8s ease-in-out infinite',
        'cyber-pulse': 'cyber-pulse 4s ease-in-out infinite',
        'cyber-glow-pink': 'cyber-glow-pink 3s ease-in-out infinite',
        'cyber-glow-purple': 'cyber-glow-purple 3s ease-in-out infinite',
        'cyber-glow-white': 'cyber-glow-white 2s ease-in-out infinite',
        'cyber-scan': 'cyber-scan 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
