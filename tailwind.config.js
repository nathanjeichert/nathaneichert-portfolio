/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#faf8f5',
          white: '#ffffff',
          subtle: '#f5f0eb',
          border: '#e8e0d8',
          'border-hover': '#d4c9be',
          text: '#1a1612',
          body: '#44403c',
          muted: '#78716c',
          dim: '#a8a29e',
          accent: '#1e3a5f',
          'accent-light': '#2d5a8e',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
