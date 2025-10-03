import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4e2a84',
        secondary: '#c41e3a',
      },
      fontFamily: {
        sarabun: ['Sarabun', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      const newUtilities = {
        '.page-break-before': {
          'page-break-before': 'always',
          'break-before': 'page',
        },
        '.page-break-after': {
          'page-break-after': 'always',
          'break-after': 'page',
        },
        '.page-break-inside-avoid': {
          'page-break-inside': 'avoid',
          'break-inside': 'avoid',
        },
        '.page-break-inside-auto': {
          'page-break-inside': 'auto',
          'break-inside': 'auto',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;
