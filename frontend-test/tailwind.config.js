// tailwind.config.js

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        judson:    ['Judson',    'serif'],
        koulen:    ['"Koulen"',     'sans-serif'],
        jaldi:     ['"Jaldi"',      'sans-serif'],
        lato:      ['"Lato"',       'sans-serif'],
        rubik:     ['"Rubik Glitch"','system-ui'],
        jomhuria:  ['jomhuria',    'serif']
      },
      colors: {
        primary:    '#000000',
        secondary:  '#FFFFFF',
        amarillo1:  '#FFD931',
        amarillo2:  '#FCF7D5',
        amarillo3:  '#FFF0AD',
        amarillo4:  '#FDF7DD',
        gris:       '#F2F2F2',
        gris2:      '#434343'
      },
    },
  },
  plugins: [],
}
