export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        surface: '#0d0d1a',
        panel:   '#1a1a2e',
        border:  '#2a2a4a',
        fox:        '#e8720c',
        'fox-light': '#f59e0b',
        cream:   '#f5f0e8',
        muted:   '#8888aa',
        danger:  '#ef4444',
        success: '#4ade80',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'tail-glow': 'tailGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        tailGlow: {
          '0%':   { opacity: '0.6', filter: 'brightness(0.8)' },
          '100%': { opacity: '1.0', filter: 'brightness(1.4)' },
        }
      }
    },
  },
  plugins: [],
}
