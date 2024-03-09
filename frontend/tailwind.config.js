/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    colors: {
      primary: 'rgba(255, 102, 0, 1)',
      secondary: {
        50: 'rgba(255, 102, 0, .05)',
        100: 'rgba(255, 102, 0, .1)',
        200: 'rgba(255, 102, 0, .2)',
        300: 'rgba(255, 102, 0, .3)',
        400: 'rgba(255, 102, 0, .4)',
        500: 'rgba(255, 102, 0, .5)',
        600: 'rgba(255, 102, 0, .6)',
        700: 'rgba(255, 102, 0, .7)',
        800: 'rgba(255, 102, 0, .8)',
        900: 'rgba(255, 102, 0, .9)',
      },
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      emerald: colors.emerald,
      indigo: colors.indigo,
      yellow: colors.yellow,
      slate: colors.slate
    },
    extend: {},
  },
  plugins: [],
}

