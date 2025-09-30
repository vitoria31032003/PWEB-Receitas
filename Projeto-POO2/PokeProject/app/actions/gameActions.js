'use server';

import { cache } from 'react';
import { pokemonAPI } from '../../src/data/pokemon-api-adapter';
import { getSortStrategy } from '../../src/utils/sortStrategies';
import { applyFilters } from '../../src/utils/filterStrategies';
import { pokemonEventEmitter } from '../../src/events/pokemon-event-emitter';

// Busca Pokémon (Home e busca geral) com base nos filtros
export const fetchGames = cache(async (filters = {}) => {
  const { sName = '.', sPage = 1, sOrdering = '.', ...otherFilters } = filters;
  const limit = 40;
  const offset = (sPage - 1) * limit;

  try {
    // Busca direta por ID ou Nome se um nome exato for fornecido
    if (sName && sName !== ".") {
      try {
        const detail = await pokemonAPI.getPokemonDetails(sName.toLowerCase());
        if (detail) {
          pokemonEventEmitter.emit("pokemonFetched", [detail]);
          return { pokemon: [detail], hasMore: false };
        }
      } catch (e) {
        // Se a busca direta falhar (ex: nome parcial), continua para a busca geral
        // ou retorna vazio se for um 404 claro.
        if (e.message.includes('404')) return { pokemon: [], hasMore: false };
      }
    }

    // Lógica para busca paginada e com filtros
    // A PokeAPI não suporta múltiplos filtros simultâneos (ex: tipo E altura).
    // A estratégia aqui é buscar uma lista base e filtrar no servidor.
    // Para simplificar, vamos focar no filtro de TIPO como primário, se presente.

    let pokemonRefs = [];
    let hasMore = false;

    if (otherFilters.sType && otherFilters.sType !== '.') {
      const categoryData = await pokemonAPI.getCategoryData('type', otherFilters.sType);
      pokemonRefs = categoryData.pokemon?.map(p => p.pokemon) || [];
    } else {
      // Busca geral paginada
      const listData = await pokemonAPI.getPokemonList(limit, offset);
      pokemonRefs = listData.results || [];
      hasMore = !!listData.next;
    }
    
    if (pokemonRefs.length === 0) {
      return { pokemon: [], hasMore: false };
    }

    const pokemonDetailsPromises = pokemonRefs.map(p => pokemonAPI.getPokemonDetails(p.url));
    let pokemonDetails = (await Promise.all(pokemonDetailsPromises)).filter(p => p !== null);

    // Aplicar filtros secundários (altura, peso, etc.) e ordenação
    pokemonDetails = applyFilters(pokemonDetails, otherFilters);
    const sortFunction = getSortStrategy(sOrdering);
    const sortedPokemon = [...pokemonDetails].sort(sortFunction);
    
    pokemonEventEmitter.emit("pokemonFetched", sortedPokemon);
    
    // A paginação se torna complexa com filtros no servidor. Para este escopo,
    // a flag 'hasMore' será mais precisa na busca geral sem filtros.
    return { pokemon: sortedPokemon, hasMore };

  } catch (error) {
    console.error('Erro em fetchGames:', error);
    return { pokemon: [], hasMore: false, error: error.message };
  }
});


// Busca detalhes de um Pokémon específico
export const fetchGameDetails = cache(async (id) => {
    try {
        if (!id) throw new Error("ID do Pokémon não fornecido");
        
        const pokemon = await pokemonAPI.getPokemonDetails(String(id));
        if (!pokemon) throw new Error(`Pokémon com ID ${id} não encontrado.`);

        let speciesData = null;
        if (pokemon.species_url) {
            try {
                speciesData = await pokemonAPI.fetch(pokemon.species_url);
            } catch (speciesError) {
                console.warn(`Erro ao buscar species data:`, speciesError);
            }
        }

        let evolutionChainData = [];
        if (speciesData?.evolution_chain?.url) {
            try {
                const evolutionResp = await pokemonAPI.fetch(speciesData.evolution_chain.url);
                if (evolutionResp.chain) {
                    evolutionChainData = await processEvolutionChain(evolutionResp.chain);
                }
            } catch (evolutionError) {
                console.warn(`Erro ao buscar cadeia de evolução:`, evolutionError);
            }
        }

        const flavorTextEntry = speciesData?.flavor_text_entries?.find(entry => entry.language.name === 'en');
        const description = flavorTextEntry?.flavor_text.replace(/[\n\f]/g, ' ') || "Descrição não disponível.";

        return { ...pokemon, description, evolution_chain: evolutionChainData };

    } catch (error) {
        console.error(`Erro em fetchGameDetails para ID ${id}:`, error);
        return null;
    }
});

// Processa a cadeia de evolução
async function processEvolutionChain(chain) {
    const pokemonList = [];
    async function extractPokemon(currentChain) {
        if (!currentChain?.species) return;
        const speciesId = currentChain.species.url.split("/").filter(Boolean).pop();
        const pokemonDetail = await pokemonAPI.getPokemonDetails(speciesId);
        if (pokemonDetail) {
            pokemonList.push({
                id: pokemonDetail.id,
                name: pokemonDetail.name,
                image: pokemonDetail.sprites.official_artwork || pokemonDetail.sprites.front_default,
            });
        }
        for (const nextEvolution of currentChain.evolves_to) {
            await extractPokemon(nextEvolution);
        }
    }
    await extractPokemon(chain);
    return pokemonList;
}

// Busca TODAS as habilidades com detalhes
export const fetchAllAbilitiesWithDetails = cache(async () => {
    try {
        const listData = await pokemonAPI.getAllAbilities();
        const detailPromises = (listData.results || []).map(ref => pokemonAPI.getAbilityDetails(ref.url));
        const detailedAbilities = (await Promise.all(detailPromises)).filter(a => a !== null);
        detailedAbilities.sort((a, b) => a.localizedName.localeCompare(b.localizedName));
        return detailedAbilities;
    } catch (error) {
        console.error("Erro em fetchAllAbilitiesWithDetails:", error);
        return [];
    }
});


// Busca Pokémon por Categoria (ex: tipo, habitat)
export const fetchPokemonByCategory = cache(async (categoryType, categoryValue, filters = {}) => {
    const { sName = '.', sOrdering = '.', sPage = 1, ...otherFilters } = filters;
    const limit = 40;
    const offset = (sPage - 1) * limit;

    try {
        const categoryData = await pokemonAPI.getCategoryData(categoryType, categoryValue);
        let pokemonRefs = [];

        if (categoryType === 'region') {
            const generationUrl = categoryData?.main_generation?.url;
            if (generationUrl) {
                const generationData = await pokemonAPI.fetch(generationUrl);
                pokemonRefs = generationData.pokemon_species || [];
            }
        } else {
            pokemonRefs = categoryData?.pokemon?.map(p => p.pokemon) || categoryData?.pokemon_species || [];
        }

        if (sName && sName !== '.') {
            pokemonRefs = pokemonRefs.filter(ref => ref.name.toLowerCase().includes(sName.toLowerCase()));
        }

        const totalFiltered = pokemonRefs.length;
        const paginatedRefs = pokemonRefs.slice(offset, offset + limit);
        const hasMore = totalFiltered > (offset + limit);

        if (paginatedRefs.length === 0) return { pokemon: [], hasMore: false };

        const detailPromises = paginatedRefs.map(ref => {
            let detailUrl = ref.url;
            if (detailUrl.includes('/pokemon-species/')) {
                const speciesId = detailUrl.split('/').filter(Boolean).pop();
                detailUrl = `https://pokeapi.co/api/v2/pokemon/${speciesId}`;
            }
            return pokemonAPI.getPokemonDetails(detailUrl);
        });

        let pokemonDetails = (await Promise.all(detailPromises)).filter(p => p !== null);
        pokemonDetails = applyFilters(pokemonDetails, otherFilters);
        const sortedPokemon = [...pokemonDetails].sort(getSortStrategy(sOrdering));

        return { pokemon: sortedPokemon, hasMore };
    } catch (error) {
        console.error(`Erro em fetchPokemonByCategory (${categoryType}=${categoryValue}):`, error);
        return { pokemon: [], hasMore: false, error: error.message };
    }
});