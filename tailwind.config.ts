import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-syne)', 'sans-serif'],
        body:    ['var(--font-dm-sans)', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        'display': ['28px', { lineHeight: '1.2',  fontWeight: '700' }],
        'title':   ['22px', { lineHeight: '1.25', fontWeight: '700' }],
        'heading': ['16px', { lineHeight: '1.35', fontWeight: '600' }],
        'subhead': ['14px', { lineHeight: '1.4',  fontWeight: '600' }],
        'body-lg': ['15px', { lineHeight: '1.6'  }],
        'body':    ['14px', { lineHeight: '1.6'  }],
        'body-sm': ['13px', { lineHeight: '1.55' }],
        'label':   ['12px', { lineHeight: '1.5',  fontWeight: '500' }],
        'caption': ['11px', { lineHeight: '1.45' }],
      },
      colors: {
        accent: {
          DEFAULT: 'var(--accent)',
          hover:   'var(--accent-hover)',
          light:   'var(--accent-light)',
          lighter: 'var(--accent-lighter)',
        },
        bg: {
          primary:   'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card:      'var(--bg-card)',
          'card-hover': 'var(--bg-card-hover)',
          input:     'var(--bg-input)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'accent': '0 0 30px rgba(124, 92, 252, 0.15)',
        'card':   '0 4px 24px rgba(0, 0, 0, 0.3)',
        'glow':   '0 0 20px rgba(124, 92, 252, 0.25)',
      },
    },
  },
  plugins: [],
}

export default config
