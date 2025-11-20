/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', '../../libs/**/*.{js,ts,jsx,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    screens: {
      xs: '360px',
      sm: '375px',
      md: '390px',
    },
    extend: {
      colors: {
        'brand-primary': 'var(--brand-primary)',
        'brand-primary-hover': 'var(--brand-primary-hover)',
        'brand-primary-pressed': 'var(--brand-primary-pressed)',
        'brand-primary-transparent': 'var(--brand-primary-transparent)',
        'brand-primary-transparent-hover': 'var(--brand-primary-transparent-hover)',
        'brand-secondary': 'var(--brand-secondary)',
        'brand-secondary-transparent': 'var(--brand-secondary-transparent)',

        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-foreground': 'var(--text-foreground)',

        'background-primary': 'var(--background-primary)',
        'background-secondary': 'var(--background-secondary)',
        'background-tertiary': 'var(--background-tertiary)',
        'background-primary-transparent': 'var(--background-primary-transparent)',
        'background-elevated-surface': 'var(--background-elevated-surface)',
        'background-elevated-surface-shadow': 'var(--background-elevated-surface-shadow)',

        'status-danger': 'var(--status-danger)',
        'status-danger-light': 'var(--status-danger-light)',
        'status-success': 'var(--status-success)',
        'status-warning': 'var(--status-warning)',
        'status-success-light': 'var(--status-success-light)',
        'status-warning-light': 'var(--status-warning-light)',
        'status-warning-orange': 'var(--status-warning-orange)',
        'status-warning-orange-light': 'var(--status-warning-orange-light)',
      },
    },
    fontFamily: {
      inter: ['Inter'],
    },
    fontSize: {
      'h1-sm': ['1.75rem', '2.0125rem'],
      'h2-sm': ['1.421875rem', '1.634765625rem'],
      'h3-sm': ['0.984375rem', '1.18125rem'],
      'h4-sm': ['0.984375rem', '1.2304688rem'],
      'h5-sm': ['0.9296875rem', '1.162109375rem'],
      'lg-sm': ['1.09375rem', '1.36719rem'],
      'md-sm': ['0.875rem', '1.3125rem'],
      'sm-sm': ['0.7109375rem', '1.06640625rem'],
      'xs-sm': ['0.601563rem', '0.9335156rem'],

      h1: ['2rem', '2.3rem'], // 32px / 115%
      h2: ['1.625rem', '1.86875rem'], // 26px / 115%
      h3: ['1.125rem', '1.35rem'], // 18px / 120%
      h4: ['1.125rem', '1.40625rem'], // 18px / 125%
      h5: ['1.0625rem', '1.328125rem'], // 17px / 125%
      lg: ['1.25rem', '1.5625rem'], // 20px / 125% (Body / Large)
      md: ['1rem', '1.5rem'], // 16px / 150% (Body / Default)
      sm: ['0.8125rem', '1.21875rem'], // 13px / 150% (Body / Small)
      xs: ['0.6875rem', '1.066875rem'], // 11px / 155% (Body / Extra Small)
    },
    spacing: {
      0: 0,
      4: '0.25rem',
      6: '0.375rem',
      8: '0.5rem',
      10: '0.625rem',
      12: '0.75rem',
      14: '0.875rem',
      16: '1rem',
      18: '1.125rem',
      20: '1.25rem',
      24: '1.5rem',
      32: '2rem',
      40: '2.5rem',
      44: '2.75rem',
      48: '3rem',
      64: '4rem',
      'content-offset': '1rem',
    },
    borderRadius: {
      DEFAULT: '4px',
      sm: '2px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      '2xl': '16px',
      '3xl': '24px',
      '4xl': '32px',
      '5xl': '38px',
      '6xl': '40px',
      full: '9999px',
      none: '0px',
    },
  },
  plugins: [],
};
