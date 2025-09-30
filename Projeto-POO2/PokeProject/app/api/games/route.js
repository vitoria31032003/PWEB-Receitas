export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
    const response = await fetch(`${BASE_URL}?limit=12`);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Buscando detalhes para cada Pokémon na lista
    const pokemonDetails = await Promise.all(
      data.results.map(async (pokemon) => {
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
    
    return Response.json(pokemonDetails);
  } catch (error) {
    console.error("Erro ao buscar pokémons:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
