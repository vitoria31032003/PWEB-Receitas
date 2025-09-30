// src/data/pokemon-data-mapper.js

class PokemonDataMapper {
    mapPokemonData(pokemonData, speciesData = null) {
        if (!pokemonData || !pokemonData.id) return null;

        let generation = null;
        if (speciesData?.generation?.url) {
            const genId = speciesData.generation.url.split("/").filter(Boolean).pop();
            generation = `generation-${genId}`;
        }

        let habitat = speciesData?.habitat?.name || 'unknown';

        return {
            id: pokemonData.id,
            name: pokemonData.name,
            background_image: pokemonData.sprites?.other?.['official-artwork']?.front_default || pokemonData.sprites?.front_default || null,
            height: pokemonData.height ? pokemonData.height / 10 : null,
            weight: pokemonData.weight ? pokemonData.weight / 10 : null,
            types: pokemonData.types?.map(t => t.type) || [],
            abilities: pokemonData.abilities?.map(a => a.ability) || [],
            stats: pokemonData.stats?.map(s => ({ name: s.stat.name, value: s.base_stat })) || [],
            moves: pokemonData.moves?.map(m => m.move) || [],
            species: pokemonData.species?.name || null,
            species_url: pokemonData.species?.url || null,
            generation: generation,
            habitat: habitat,
            evolution_chain_url: pokemonData.species?.url ? pokemonData.species.url.replace("/pokemon-species/", "/pokemon-species/") : null,
            sprites: {
                front_default: pokemonData.sprites?.front_default || null,
                back_default: pokemonData.sprites?.back_default || null,
                front_shiny: pokemonData.sprites?.front_shiny || null,
                back_shiny: pokemonData.sprites?.back_shiny || null,
                official_artwork: pokemonData.sprites?.other?.["official-artwork"]?.front_default || null
            }
        };
    }
}

export const pokemonDataMapper = new PokemonDataMapper();


