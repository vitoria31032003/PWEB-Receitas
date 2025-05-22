import { useState, useEffect } from "react";

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

export default function useGameDetails(id) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchGame = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `${BASE_URL}/${id}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        
        // Formatando os dados do Pokémon para se adequar à estrutura esperada pelo componente
        const formattedPokemon = {
          id: data.id,
          name: data.name,
          background_image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
          released: `Altura: ${data.height/10}m, Peso: ${data.weight/10}kg`,
          rating: `Base XP: ${data.base_experience}`,
          description_raw: `Tipos: ${data.types.map(type => type.type.name).join(', ')}\n\nHabilidades: ${data.abilities.map(ability => ability.ability.name).join(', ')}\n\nEstatísticas:\n${data.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`).join('\n')}`,
          website: `https://www.pokemon.com/br/pokedex/${data.name}`
        };
        
        setGame(formattedPokemon);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  return { game, loading, error };
}
