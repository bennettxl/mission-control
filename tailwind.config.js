/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#FFFFFF',
        primary: '#CC0000',
        secondary: '#F5F5F5',
        'nav-bg': '#191919',
        'nav-active': '#CC0000',
        'nav-inactive': '#A3A3A3',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
