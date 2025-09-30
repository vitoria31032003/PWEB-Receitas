// Este mapa define contra quais tipos um determinado tipo de ataque é "super eficaz" (causa o dobro do dano).
// A chave é o tipo do ATAQUE, e o valor é um array dos tipos que são FRACOS contra esse ataque.

const typeEffectiveness = {
  normal: [],
  fire: ['grass', 'ice', 'bug', 'steel'],
  water: ['fire', 'ground', 'rock'],
  electric: ['water', 'flying'],
  grass: ['water', 'ground', 'rock'],
  ice: ['grass', 'ground', 'flying', 'dragon'],
  fighting: ['normal', 'ice', 'rock', 'dark', 'steel'],
  poison: ['grass', 'fairy'],
  ground: ['fire', 'electric', 'poison', 'rock', 'steel'],
  flying: ['grass', 'fighting', 'bug'],
  psychic: ['fighting', 'poison'],
  bug: ['grass', 'psychic', 'dark'],
  rock: ['fire', 'ice', 'flying', 'bug'],
  ghost: ['psychic', 'ghost'],
  dragon: ['dragon'],
  dark: ['psychic', 'ghost'],
  steel: ['ice', 'rock', 'fairy'],
  fairy: ['fighting', 'dragon', 'dark'],
};

/**
 * Verifica se um Pokémon com os tipos fornecidos é fraco contra um determinado tipo de ataque.
 * @param {Array<string>} pokemonTypes - Um array com os tipos do Pokémon (ex: ['grass', 'poison']).
 * @param {string} attackType - O tipo do ataque para verificar a fraqueza (ex: 'fire').
 * @returns {boolean} - Retorna true se o Pokémon for fraco contra o tipo de ataque.
 */
export const isPokemonWeakAgainst = (pokemonTypes, attackType) => {
  if (!attackType || !typeEffectiveness[attackType]) {
    return false;
  }

  // Pega a lista de tipos que são fracos contra o tipo de ataque.
  const weaknesses = typeEffectiveness[attackType];
  
  // Verifica se algum dos tipos do Pokémon está nessa lista de fraquezas.
  return pokemonTypes.some(pokemonType => weaknesses.includes(pokemonType));
};