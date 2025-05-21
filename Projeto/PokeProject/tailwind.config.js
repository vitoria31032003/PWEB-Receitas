/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        pokeRed: '#E3350D',
        pokeBlue: '#30A7D7',
        typeNormal: '#A8A77A',
        typeFire: '#EE8130',
        typeWater: '#6390F0',
        typeElectric: '#F7D02C',
        typeGrass: '#7AC74C',
        typeIce: '#96D9D6',
        typeFighting: '#C22E28',
        typePoison: '#A33EA1',
        typeGround: '#E2BF65',
        typeFlying: '#A98FF3',
        typePsychic: '#F95587',
        typeBug: '#A6B91A',
        typeRock: '#B6A136',
        typeGhost: '#735797',
        typeDragon: '#6F35FC',
        typeDark: '#705746',
        typeSteel: '#B7B7CE',
        typeFairy: '#D685AD',
      },
    },
  },
  plugins: [],
}
