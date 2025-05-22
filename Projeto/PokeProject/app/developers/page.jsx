import Link from 'next/link';

export default async function Developers() {
  try {
    // Usando a PokeAPI para obter dados de gerações de Pokémon como "desenvolvedores"
    const res = await fetch(`https://pokeapi.co/api/v2/generation`);

    if (!res.ok) {
      return <div className="text-white text-center">Erro ao carregar dados.</div>;
    }
    
    const data = await res.json();
    
    if (!data.results || data.results.length === 0) {
      return <div className="text-white text-center">Nenhuma geração de Pokémon encontrada.</div>;
    }

    // Buscando detalhes de cada geração
    const generationDetails = await Promise.all(
      data.results.map(async (generation) => {
        const genRes = await fetch(generation.url);
        if (!genRes.ok) {
          throw new Error(`Erro HTTP: ${genRes.status}`);
        }
        const genData = await genRes.json();
        
        // Obtendo um Pokémon representativo desta geração para imagem
        let representativePokemon = null;
        if (genData.pokemon_species && genData.pokemon_species.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(genData.pokemon_species.length, 5));
          const pokemonSpeciesUrl = genData.pokemon_species[randomIndex].url;
          const speciesRes = await fetch(pokemonSpeciesUrl);
          
          if (speciesRes.ok) {
            const speciesData = await speciesRes.json();
            const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${speciesData.id}`);
            if (pokemonRes.ok) {
              representativePokemon = await pokemonRes.json();
            }
          }
        }
        
        return {
          id: genData.id,
          name: `Geração ${genData.id} - ${genData.main_region.name}`,
          image_background: representativePokemon ? 
                           representativePokemon.sprites.other['official-artwork'].front_default || 
                           representativePokemon.sprites.front_default : 
                           'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
          games_count: genData.pokemon_species ? genData.pokemon_species.length : 0,
          games: genData.pokemon_species ? 
                 genData.pokemon_species.slice(0, 5).map(p => ({ 
                   id: p.url.split('/').filter(Boolean).pop(), 
                   name: p.name 
                 })) : []
        };
      })
    );

    return (
      <div className="bg-gradient-to-b from-lightOpacityL to-lightOpacityS min-h-screen py-9 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mx-2">
          {generationDetails.map((developer) => (
            <div
              key={developer.id}
              className="bg-gradient-to-b from-grayDarkOpacityS to-grayDarkOpacityL rounded-3xl overflow-hidden shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl mb-5 mt-5"
            >
              <div className="relative">
                <div
                  className="w-full h-80 bg-cover bg-center rounded-t-3xl"
                  style={{ backgroundImage: `url(${developer.image_background})` }}
                ></div>
                <div className="p-6 space-y-4">
                  <h2 className="text-3xl font-bold text-white text-center truncate">{developer.name}</h2>
                  <p className="text-white text-lg text-center font-bold">
                    Total de Pokémon:
                    <span className="block mt-1 text-2xl font-semibold text-grayLight">
                      {developer.games_count}
                    </span>
                  </p>
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2 text-center">Pokémon Representativos:</h3>
                    <ul className="space-y-1 text-center">
                      {developer.games.slice(0, 5).map((game, index) => (
                        <li
                          key={index}
                          className="text-lg text-grayLight font-semibold truncate"
                        >
                          <span className="truncate">{game.name}</span>
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
