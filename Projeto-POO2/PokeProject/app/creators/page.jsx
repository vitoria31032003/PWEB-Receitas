import Link from 'next/link';

export default async function Creators({ searchParams }) {
  try {
    // Usando a PokeAPI para obter dados de tipos de Pokémon como "criadores"
    const res = await fetch(`https://pokeapi.co/api/v2/type`);

    if (!res.ok) {
      return <div className="text-white text-center">Erro ao carregar dados.</div>;
    }
    
    const data = await res.json();
    
    if (!data.results || data.results.length === 0) {
      return <div className="text-white text-center">Nenhum tipo de Pokémon encontrado.</div>;
    }

    // Buscando detalhes de cada tipo
    const typeDetails = await Promise.all(
      data.results.slice(0, 12).map(async (type) => {
        const typeRes = await fetch(type.url);
        if (!typeRes.ok) {
          throw new Error(`Erro HTTP: ${typeRes.status}`);
        }
        const typeData = await typeRes.json();
        
        // Obtendo um Pokémon representativo deste tipo para imagem
        let representativePokemon = null;
        if (typeData.pokemon && typeData.pokemon.length > 0) {
          const pokemonRes = await fetch(typeData.pokemon[0].pokemon.url);
          if (pokemonRes.ok) {
            representativePokemon = await pokemonRes.json();
          }
        }
        
        return {
          id: typeData.id,
          name: typeData.name,
          image: representativePokemon ? 
                 representativePokemon.sprites.other['official-artwork'].front_default || 
                 representativePokemon.sprites.front_default : 
                 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
          games_count: typeData.pokemon ? typeData.pokemon.length : 0,
          positions: [{ id: 1, name: "Tipo de Pokémon" }],
          games: typeData.pokemon ? 
                 typeData.pokemon.slice(0, 3).map(p => ({ 
                   id: p.pokemon.url.split('/').filter(Boolean).pop(), 
                   name: p.pokemon.name 
                 })) : []
        };
      })
    );

    return (
      <div className="bg-gradient-to-b from-lightOpacityL to-lightOpacityS min-h-screen py-9 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mx-2">
          {typeDetails.map((creator) => (
            <div
              key={creator.id}
              className="bg-gradient-to-b from-grayDarkOpacityS to-grayDarkOpacityL rounded-3xl overflow-hidden shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl mb-5 mt-5"
            >
              <div className="relative">
                <div
                  className="w-full h-80 bg-cover bg-center rounded-t-3xl"
                  style={{ backgroundImage: `url(${creator.image})` }}
                ></div>
                <div className="p-6 space-y-4">
                  <h2 className="text-3xl font-bold text-white text-center truncate">
                    {creator.name}
                  </h2>
                  <p className="text-white text-lg text-center font-bold">
                    Total de Pokémon:
                    <span className="block mt-1 text-2xl font-semibold text-grayLight">
                      {creator.games_count}
                    </span>
                  </p>
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2 text-center">Função:</h3>
                    <ul className="space-y-1 text-center">
                      {creator.positions.map((position, index) => (
                        <li key={index} className="text-lg text-grayLight font-semibold truncate">
                          {position.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2 text-center">Pokémon Representativos:</h3>
                    <ul className="space-y-2 text-center">
                      {creator.games.map((game, index) => (
                        <li key={index} className="text-lg text-grayLight font-semibold truncate">
                          {game.name}
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
