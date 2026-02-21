import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', './store/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'sans-serif'],
        heading: ['var(--font-heading)', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: 'var(--brand-navy)',
          navy2: 'var(--brand-navy-2)',
          red: 'var(--brand-red)',
          red2: 'var(--brand-red-2)',
          white: 'var(--brand-white)',
          gray: 'var(--brand-gray)',
          yellow: 'var(--brand-yellow)',
          border: 'var(--brand-border)',
        },
      },
    },
  },
};

export default config;
