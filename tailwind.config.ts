import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-page': 'var(--bg-page)',
        'surface': 'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        'ink': 'var(--ink)',
        'forest': 'var(--forest)',
        'lime': 'var(--lime)',
        'lime-strong': 'var(--lime-strong)',
        'line': 'var(--line)',
        'muted': 'var(--muted)',
        'white': 'var(--white)',
        'danger': 'var(--danger)',
        'warning': 'var(--warning)',
        'overlay': 'var(--overlay)',
      },
      fontFamily: {
        sans: ['Outfit', 'Noto Sans Devanagari', 'sans-serif'],
      },
      borderRadius: {
        'card': 'var(--radius-card)', // 28px
        'input': 'var(--radius-input)', // 16px
        'pill': 'var(--radius-pill)', // 9999px
        'full': 'var(--radius-pill)',
      },
      spacing: {
        '1': 'var(--space-4)',
        '2': 'var(--space-8)',
        '3': 'var(--space-12)',
        '4': 'var(--space-16)',
        '6': 'var(--space-24)',
        '8': 'var(--space-32)',
        '12': 'var(--space-48)',
        '16': 'var(--space-64)',
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'body': ['16px', { lineHeight: '24px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['32px', { lineHeight: '40px' }],
        'hero-sm': ['56px', { lineHeight: '1.1' }],
        'hero': ['64px', { lineHeight: '1.08' }],
        'hero-lg': ['72px', { lineHeight: '1.05' }],
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}

export default config
