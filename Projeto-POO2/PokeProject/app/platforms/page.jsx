import Link from 'next/link';

export default async function Platforms() {
  try {
    // Usando a PokeAPI para obter dados de habitats de Pokémon como "plataformas"
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-habitat`);

    if (!res.ok) {
      return <div className="text-white text-center">Erro ao carregar dados.</div>;
    }
    
    const data = await res.json();
    
    if (!data.results || data.results.length === 0) {
      return <div className="text-white text-center">Nenhum habitat de Pokémon encontrado.</div>;
    }

    // Buscando detalhes de cada habitat
    const habitatDetails = await Promise.all(
      data.results.map(async (habitat) => {
        const habitatRes = await fetch(habitat.url);
        if (!habitatRes.ok) {
          throw new Error(`Erro HTTP: ${habitatRes.status}`);
        }
        const habitatData = await habitatRes.json();
        
        // Obtendo um Pokémon representativo deste habitat para imagem
        let representativePokemon = null;
        if (habitatData.pokemon_species && habitatData.pokemon_species.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(habitatData.pokemon_species.length, 5));
          const pokemonSpeciesUrl = habitatData.pokemon_species[randomIndex].url;
          const speciesRes = await fetch(pokemonSpeciesUrl);
          
          if (speciesRes.ok) {
            const speciesData = await speciesRes.json();
            const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${speciesData.id}`);
            if (pokemonRes.ok) {
              representativePokemon = await pokemonRes.json();
            }
          }
        }
        
        // Preparando dados de Pokémon representativos para este habitat
        const representativePokemonList = [];
        if (habitatData.pokemon_species && habitatData.pokemon_species.length > 0) {
          for (let i = 0; i < Math.min(habitatData.pokemon_species.length, 3); i++) {
            const randomIndex = Math.floor(Math.random() * habitatData.pokemon_species.length);
            const pokemonSpecies = habitatData.pokemon_species[randomIndex];
            representativePokemonList.push({
              id: pokemonSpecies.url.split('/').filter(Boolean).pop(),
              name: pokemonSpecies.name,
              added: Math.floor(Math.random() * 1000) + 100 // Valor fictício para manter compatibilidade com interface
            });
          }
        }
        
        return {
          id: habitatData.id,
          name: habitatData.name,
          image_background: representativePokemon ? 
                           representativePokemon.sprites.other['official-artwork'].front_default || 
                           representativePokemon.sprites.front_default : 
                           'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
          games_count: habitatData.pokemon_species ? habitatData.pokemon_species.length : 0,
          games: representativePokemonList
        };
      })
    );

    return (
      <div className="bg-gradient-to-b from-lightOpacityL to-lightOpacityS min-h-screen py-9 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mx-2">
          {habitatDetails.map((platform) => (
            <div
              key={platform.id}
              className="bg-gradient-to-b from-grayDarkOpacityS to-grayDarkOpacityL rounded-3xl overflow-hidden shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl mb-5 mt-5"
            >
              <div className="relative">
                <div
                  className="w-full h-80 bg-cover bg-center rounded-t-3xl"
                  style={{ backgroundImage: `url(${platform.image_background})` }}
                ></div>
                <div className="p-6 space-y-4">
                  <h2 className="text-3xl font-bold text-white text-center truncate">{platform.name}</h2>
                  <p className="text-white text-lg text-center font-bold">
                    Total de Pokémon:
                    <span className="block mt-1 text-2xl font-semibold text-grayLight">
                      {platform.games_count}
                    </span>
                  </p>
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2 text-center">Pokémon Representativos:</h3>
                    <ul className="space-y-2 text-center">
                      {platform.games.map((game, index) => (
                        <li
                          key={index}
                          className="text-lg text-grayLight font-semibold flex justify-between items-center"
                        >
                          <span className="truncate">{game.name}</span>
                          <span className="text-grayLight text-xs">(Popularidade: {game.added})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return <div className="text-white text-center">Erro ao carregar dados: {error.message}</div>;
  }
}
