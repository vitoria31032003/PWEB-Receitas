import Link from 'next/link';

export default async function Publishers() {
  try {
    // Usando a PokeAPI para obter dados de regiões de Pokémon como "publishers"
    const res = await fetch(`https://pokeapi.co/api/v2/region`);

    if (!res.ok) {
      return <div className="text-white text-center">Erro ao carregar dados.</div>;
    }
    
    const data = await res.json();
    
    if (!data.results || data.results.length === 0) {
      return <div className="text-white text-center">Nenhuma região de Pokémon encontrada.</div>;
    }

    // Buscando detalhes de cada região
    const regionDetails = await Promise.all(
      data.results.map(async (region) => {
        const regionRes = await fetch(region.url);
        if (!regionRes.ok) {
          throw new Error(`Erro HTTP: ${regionRes.status}`);
        }
        const regionData = await regionRes.json();
        
        // Buscando informações adicionais sobre a região para obter Pokémon
        let pokemonList = [];
        if (regionData.pokedexes && regionData.pokedexes.length > 0) {
          const pokedexRes = await fetch(regionData.pokedexes[0].url);
          if (pokedexRes.ok) {
            const pokedexData = await pokedexRes.json();
            
            // Obtendo alguns Pokémon representativos desta região
            if (pokedexData.pokemon_entries && pokedexData.pokemon_entries.length > 0) {
              // Selecionando alguns Pokémon aleatórios da região
              const selectedEntries = [];
              for (let i = 0; i < Math.min(3, pokedexData.pokemon_entries.length); i++) {
                const randomIndex = Math.floor(Math.random() * pokedexData.pokemon_entries.length);
                selectedEntries.push(pokedexData.pokemon_entries[randomIndex]);
              }
              
              pokemonList = selectedEntries.map(entry => ({
                id: entry.entry_number,
                name: entry.pokemon_species.name,
                added: Math.floor(Math.random() * 1000) + 100 // Valor fictício para manter compatibilidade com interface
              }));
            }
          }
        }
        
        // Obtendo um Pokémon representativo desta região para imagem
        let representativePokemon = null;
        if (pokemonList.length > 0) {
          const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonList[0].id}`);
          if (pokemonRes.ok) {
            representativePokemon = await pokemonRes.json();
          }
        }
        
        return {
          id: regionData.id,
          name: regionData.name,
          image_background: representativePokemon ? 
                           representativePokemon.sprites.other['official-artwork'].front_default || 
                           representativePokemon.sprites.front_default : 
                           'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
          games_count: pokemonList.length > 0 ? pokemonList.length * 30 : 100, // Estimativa de Pokémon na região
          games: pokemonList
        };
      })
    );

    return (
      <div className="bg-gradient-to-b from-lightOpacityL to-lightOpacityS min-h-screen py-9 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mx-2">
          {regionDetails.map((publisher) => (
            <div
              key={publisher.id}
              className="bg-gradient-to-b from-grayDarkOpacityS to-grayDarkOpacityL rounded-3xl overflow-hidden shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl mb-5 mt-5"
            >
              <div className="relative">
                <div
                  className="w-full h-80 bg-cover bg-center rounded-t-3xl"
                  style={{ backgroundImage: `url(${publisher.image_background})` }}
                ></div>
                <div className="p-6 space-y-4">
                  <h2 className="text-3xl font-bold text-white text-center truncate">{publisher.name}</h2>
                  <p className="text-white text-lg text-center font-bold">
                    Estimativa de Pokémon:
                    <span className="block mt-1 text-2xl font-semibold text-grayLight">
                      {publisher.games_count}
                    </span>
                  </p>
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2 text-center">Pokémon Representativos:</h3>
                    <ul className="space-y-2 text-center">
                      {publisher.games.map((game, index) => (
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
