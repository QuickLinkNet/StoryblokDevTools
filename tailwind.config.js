module.exports = {
  content: [
    './components/storyblok/**/*.{js,ts,jsx,tsx}',
  ],
  important: true,
  theme: {
    extend: {
      colors: {
        'sb-primary': '#3b82f6',
        'sb-primary-dark': '#2563eb',
        'sb-primary-light': '#60a5fa',
        'sb-accent': '#8b5cf6',
      },
      boxShadow: {
        'sb-glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'sb-glow-lg': '0 0 30px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'sb-pulse': 'sb-pulse 2s ease-in-out infinite',
        'sb-bounce': 'sb-bounce 0.5s ease-out',
        'sb-slide-in': 'sb-slide-in 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'sb-fade-in': 'sb-fade-in 200ms ease-out',
      },
      keyframes: {
        'sb-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'sb-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        'sb-slide-in': {
          'from': { transform: 'translateX(100%)' },
          'to': { transform: 'translateX(0)' },
        },
        'sb-fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
