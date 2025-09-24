/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        night: {
          50: '#bfd1e2',
          200: '#7cafd1',
          300: '#b3aae2',
          900: '#121824'
        }
      }
    },
  },
  plugins: [],
}
