import { useState, useEffect } from "react";

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

export default function useGames(filters) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { sName, sPage } = filters;
        // PokeAPI usa offset em vez de page, então calculamos o offset baseado na página
        const offset = (sPage - 1) * 12;
        
        // Construindo a URL com os parâmetros
        let url = `${BASE_URL}?offset=${offset}&limit=12`;
        
        // Se houver um nome para busca, buscamos diretamente pelo Pokémon específico
        if (sName && sName.trim() !== '') {
          url = `${BASE_URL}/${sName.toLowerCase().trim()}`;
        }
        
        console.log("Fetching data from:", url);
  
        // Verificando cache
        const cachedData = localStorage.getItem(url);
        if (cachedData) {
          setGames(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
  
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
  
        const data = await response.json();
        
        // Se for uma busca por nome, formatamos o resultado como um array com um único item
        if (sName && sName.trim() !== '') {
          const formattedPokemon = {
            id: data.id,
            name: data.name,
            background_image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
            types: data.types.map(type => type.type.name),
            stats: data.stats.map(stat => ({
              name: stat.stat.name,
              value: stat.base_stat
            }))
          };
          
          localStorage.setItem(url, JSON.stringify([formattedPokemon]));
          setGames([formattedPokemon]);
        } else {
          // Para listagem, precisamos buscar detalhes de cada Pokémon
          const results = data.results || [];
          
          // Buscando detalhes para cada Pokémon na lista
          const pokemonDetails = await Promise.all(
            results.map(async (pokemon) => {
              const detailResponse = await fetch(pokemon.url);
              if (!detailResponse.ok) {
                throw new Error(`Erro HTTP: ${detailResponse.status}`);
              }
              const detail = await detailResponse.json();
              
              return {
                id: detail.id,
                name: detail.name,
                background_image: detail.sprites.other['official-artwork'].front_default || detail.sprites.front_default,
                types: detail.types.map(type => type.type.name),
                stats: detail.stats.map(stat => ({
                  name: stat.stat.name,
                  value: stat.base_stat
                }))
              };
            })
          );
          
          localStorage.setItem(url, JSON.stringify(pokemonDetails));
          setGames(pokemonDetails);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [filters]);

  return { games, loading, error };
}
