/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Luminous glass palette
        glass: {
          white: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(17, 24, 39, 0.7)',
          border: 'rgba(255, 255, 255, 0.5)',
          borderDark: 'rgba(255, 255, 255, 0.08)',
        },
        // Accent colors for innovation feel
        accent: {
          blue: '#3b82f6',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          cyan: '#06b6d4',
        },
        // Semantic with luminous variants
        positive: {
          DEFAULT: '#10b981',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        negative: {
          DEFAULT: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.15)',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
        display: ['"SF Pro Display"', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glass:
          '0 4px 24px -1px rgba(0, 0, 0, 0.04), 0 1px 1px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(0, 0, 0, 0.02)',
        'glass-dark':
          '0 4px 24px -1px rgba(0, 0, 0, 0.2), 0 1px 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
        'glass-lg':
          '0 8px 32px -2px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.02)',
        subtle: '0 1px 2px rgba(0, 0, 0, 0.02), 0 4px 8px rgba(0, 0, 0, 0.02)',
        card: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04)',
        elevated: '0 2px 8px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.06)',
        'glow-blue':
          '0 0 40px -10px rgba(59, 130, 246, 0.25), 0 0 60px -20px rgba(99, 102, 241, 0.15)',
        'glow-green':
          '0 0 40px -10px rgba(16, 185, 129, 0.25), 0 0 60px -20px rgba(5, 150, 105, 0.15)',
        'glow-red':
          '0 0 40px -10px rgba(239, 68, 68, 0.25), 0 0 60px -20px rgba(220, 38, 38, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
