import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sakura: {
          50: '#fef2f4',
          100: '#fde6ea',
          200: '#fccdd6',
          300: '#f9a8b8',
          400: '#f47a98',
          500: '#ea4c7a',
          600: '#d72a63',
          700: '#b51d51',
          800: '#971b49',
          900: '#801b44',
        },
        ikigai: {
          love: '#f472b6',
          good: '#818cf8',
          need: '#34d399',
          paid: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(244, 122, 152, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(244, 122, 152, 0.5), 0 0 80px rgba(244, 122, 152, 0.2)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
