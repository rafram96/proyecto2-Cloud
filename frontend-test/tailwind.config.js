// tailwind.config.js

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilitar modo oscuro con clase
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
        // Tonos dorados más elegantes
        dorado1:    '#DAA520',  // Goldenrod
        dorado2:    '#F4D03F',  // Dorado suave
        dorado3:    '#B8860B',  // Dark goldenrod
        dorado4:    '#FFE5B4',  // Peach puff
        gris:       '#F2F2F2',
        gris2:      '#434343',
        // Colores para tema oscuro
        dark: {
          bg: {
            primary: '#0f172a',
            secondary: '#1e293b',
            tertiary: '#334155',
          },
          text: {
            primary: '#f8fafc',
            secondary: '#cbd5e1',
            muted: '#94a3b8',
          },
          border: '#334155',
        }
      },
    },
  },
  plugins: [],
}
