
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        cream: '#faf8f5',
        charcoal: {
          DEFAULT: '#1a1a2e',
          50: '#f0f0f4',
          100: '#e1e1e8',
          200: '#c3c3d1',
          300: '#a5a5ba',
          400: '#8787a3',
          500: '#69698c',
          600: '#4b4b75',
          700: '#2d2d5e',
          800: '#1a1a2e',
          900: '#0d1b2a',
        },
        coral: {
          DEFAULT: '#ff6b6b',
          50: '#fff0f0',
          100: '#ffe1e1',
          200: '#ffc3c3',
          300: '#ffa5a5',
          400: '#ff8787',
          500: '#ff6b6b',
          600: '#e66060',
          700: '#cc5656',
          800: '#b34b4b',
          900: '#994040',
        },
        sage: {
          DEFAULT: '#7eb09b',
          50: '#f2f7f5',
          100: '#e5efe9',
          200: '#cbdfd4',
          300: '#b1cfbe',
          400: '#97bfa9',
          500: '#7eb09b',
          600: '#719e8b',
          700: '#658d7c',
          800: '#587b6c',
          900: '#4c6a5d',
        },
        amber: {
          DEFAULT: '#f4a261',
          50: '#fef6ef',
          100: '#fdeddf',
          200: '#fbdbbf',
          300: '#f9ca9f',
          400: '#f7b87f',
          500: '#f4a261',
          600: '#db9257',
          700: '#c3824e',
          800: '#aa7144',
          900: '#92613a',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm-sm': '0 2px 8px rgba(26, 26, 46, 0.04)',
        'warm-md': '0 4px 16px rgba(26, 26, 46, 0.06)',
        'warm-lg': '0 8px 32px rgba(26, 26, 46, 0.08)',
        'coral': '0 4px 16px rgba(255, 107, 107, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'shimmer': 'shimmer 2s infinite',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
