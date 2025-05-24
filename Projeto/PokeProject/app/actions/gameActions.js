
'use server';

import { cache } from 'react';

// --- Funções Auxiliares --- //

// Busca detalhes de um Pokémon pela URL (com fallback por ID)
const fetchPokemonDetailsByUrl = async (url) => {
  try {
    const urlParts = url.split('/');
    const pokemonId = urlParts[urlParts.length - 2];

    const detailResponse = await fetch(url);
    if (!detailResponse.ok) {
      console.warn(`Falha ao buscar detalhes de: ${url}, status: ${detailResponse.status}`);
      const fallbackUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
      const fallbackResponse = await fetch(fallbackUrl);
      if (!fallbackResponse.ok) {
          console.error(`Falha ao buscar fallback pelo ID: ${pokemonId}, status: ${fallbackResponse.status}`);
          return null;
      }
      const pokemonData = await fallbackResponse.json();
      return await processPokemonData(pokemonData);
    }
    const pokemonData = await detailResponse.json();
    return await processPokemonData(pokemonData);

  } catch (error) {
    console.error(`Erro ao buscar detalhes do Pokémon ${url}:`, error);
    return null;
  }
};

// Processa dados brutos do Pokémon, busca species e retorna objeto padronizado
const processPokemonData = async (pokemonData) => {
    if (!pokemonData || !pokemonData.id) return null;
    let speciesData = null;
    try {
        if (pokemonData.species?.url) {
            const speciesResponse = await fetch(pokemonData.species.url);
            if (speciesResponse.ok) {
                speciesData = await speciesResponse.json();
            }
        }
    } catch (speciesError) {
        console.warn(`Erro ao buscar species data para ${pokemonData.name}:`, speciesError);
    }

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
        species: speciesData?.name || null,
        species_url: pokemonData.species?.url || null,
        generation: speciesData?.generation?.name || null,
        habitat: speciesData?.habitat?.name || 'unknown',
        evolution_chain_url: speciesData?.evolution_chain?.url || null,
        sprites: {
            front_default: pokemonData.sprites?.front_default || null,
            back_default: pokemonData.sprites?.back_default || null,
            front_shiny: pokemonData.sprites?.front_shiny || null,
            back_shiny: pokemonData.sprites?.back_shiny || null,
            official_artwork: pokemonData.sprites?.other?.['official-artwork']?.front_default || null
        }
    };
}

// Ordena a lista de Pokémon
function sortPokemonList(pokemonList, ordering) {
    if (!pokemonList || pokemonList.length === 0) return [];
    const sortedList = [...pokemonList];
    if (ordering && ordering !== '.') {
      switch (ordering) {
        case 'name': sortedList.sort((a, b) => a.name.localeCompare(b.name)); break;
        case '-name': sortedList.sort((a, b) => b.name.localeCompare(a.name)); break;
        case 'height': sortedList.sort((a, b) => (a.height ?? 0) - (b.height ?? 0)); break;
        case '-height': sortedList.sort((a, b) => (b.height ?? 0) - (a.height ?? 0)); break;
        case 'weight': sortedList.sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0)); break;
        case '-weight': sortedList.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0)); break;
        default: sortedList.sort((a, b) => a.id - b.id);
      }
    } else {
      sortedList.sort((a, b) => a.id - b.id); // Padrão é ordenar por ID crescente
    }
    return sortedList;
  }

// Mapeia categoryType para a chave de filtro correspondente
function getFilterKeyForCategory(categoryType) {
    switch (categoryType) {
        case 'type': return 'sType';
        case 'generation': return 'sGeneration';
        case 'pokemon-habitat': return 'sHabitat';
        case 'region': return 'sRegion';
        case 'ability': return 'sAbility';
        default: return null;
    }
}

// Aplica filtros secundários (em dados já carregados)
function applySecondaryFilters(pokemonList, filters) {
    let filtered = [...pokemonList];
    const { sType, sWeakness, sAbility, sHeight, sWeight } = filters;

    if (sType && sType !== '.') {
        filtered = filtered.filter(p => p.types.some(t => t.name.toLowerCase() === sType.toLowerCase()));
    }
    // Não aplicar filtro de habilidade aqui se já foi o filtro principal
    // if (sAbility && sAbility !== '.') {
    //     filtered = filtered.filter(p => p.abilities.some(a => a.name.toLowerCase() === sAbility.toLowerCase()));
    // }
    if (sHeight && sHeight !== '.') {
        switch (sHeight) {
            case 'small': filtered = filtered.filter(p => p.height !== null && p.height < 1); break;
            case 'medium': filtered = filtered.filter(p => p.height !== null && p.height >= 1 && p.height <= 2); break;
            case 'large': filtered = filtered.filter(p => p.height !== null && p.height > 2); break;
        }
    }
    if (sWeight && sWeight !== '.') {
        switch (sWeight) {
            case 'light': filtered = filtered.filter(p => p.weight !== null && p.weight < 10); break;
            case 'medium': filtered = filtered.filter(p => p.weight !== null && p.weight >= 10 && p.weight <= 50); break;
            case 'heavy': filtered = filtered.filter(p => p.weight !== null && p.weight > 50); break;
        }
    }
    if (sWeakness && sWeakness !== '.') {
        console.warn("Filtro de fraqueza (sWeakness) não implementado completamente.");
    }
    return filtered;
}

// Busca detalhes de uma habilidade pela URL
const fetchAbilityDetails = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Falha ao buscar detalhes da habilidade: ${url}, status: ${response.status}`);
            return null;
        }
        const data = await response.json();
        const effectEntry = data.effect_entries?.find(e => e.language.name === 'en') || data.effect_entries?.[0];
        const nameEntry = data.names?.find(n => n.language.name === 'pt-br') || data.names?.find(n => n.language.name === 'en') || { name: data.name }; // Nome localizado

        return {
            id: data.id,
            name: data.name, // Nome original da API (para filtros)
            localizedName: nameEntry.name, // Nome traduzido (para exibição)
            description: effectEntry?.short_effect || effectEntry?.effect || "Descrição não disponível.",
            url: url
        };
    } catch (error) {
        console.error(`Erro ao buscar detalhes da habilidade ${url}:`, error);
        return null;
    }
};

// --- Funções Exportadas --- //

// Busca Pokémon (Home e busca geral)
export const fetchGames = cache(async (filters = {}) => {
  const { sName = '.', sPage = 1, sOrdering = '.', ...otherFilters } = filters;
  const limit = 40;
  const offset = (sPage - 1) * limit;

  try {
    if (sName && sName !== '.' && /^[0-9]+$/.test(sName)) {
      const detail = await fetchPokemonDetailsByUrl(`https://pokeapi.co/api/v2/pokemon/${sName}`);
      return detail ? { pokemon: [detail], hasMore: false } : { pokemon: [], hasMore: false };
    } else if (sName && sName !== '.') {
        const initialListUrl = `https://pokeapi.co/api/v2/pokemon?limit=1302&offset=0`;
        const response = await fetch(initialListUrl);
        if (!response.ok) throw new Error('Falha ao buscar lista completa para filtro de nome');
        const data = await response.json();
        const nameMatches = data.results.filter(p => p.name.toLowerCase().includes(sName.toLowerCase()));
        if (nameMatches.length === 0) return { pokemon: [], hasMore: false };

        const totalFiltered = nameMatches.length;
        const paginatedMatches = nameMatches.slice(offset, offset + limit);
        const hasMore = totalFiltered > (offset + limit);

        const pokemonDetailsPromises = paginatedMatches.map(p => fetchPokemonDetailsByUrl(p.url));
        let pokemonDetails = (await Promise.all(pokemonDetailsPromises)).filter(p => p !== null);
        pokemonDetails = applySecondaryFilters(pokemonDetails, otherFilters);
        const sortedPokemon = sortPokemonList(pokemonDetails, sOrdering);
        return { pokemon: sortedPokemon, hasMore };
    } else {
      const apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Falha ao buscar lista paginada');
      const data = await response.json();
      const hasMore = !!data.next;

      const pokemonDetailsPromises = data.results.map(p => fetchPokemonDetailsByUrl(p.url));
      let pokemonDetails = (await Promise.all(pokemonDetailsPromises)).filter(p => p !== null);
      pokemonDetails = applySecondaryFilters(pokemonDetails, otherFilters);
      const sortedPokemon = sortPokemonList(pokemonDetails, sOrdering);
      return { pokemon: sortedPokemon, hasMore };
    }
  } catch (error) {
    console.error('Erro em fetchGames:', error);
    return { pokemon: [], hasMore: false };
  }
});

// Busca Pokémon por CATEGORIA (Tipos, Gerações, Habilidades, etc.)
export const fetchPokemonByCategory = cache(async (categoryType, categoryValue, filters = {}) => {
    const { sName = '.', sOrdering = '.', sPage = 1, ...otherFilters } = filters;
    const limit = 40;
    const offset = (sPage - 1) * limit;

    try {
        let categoryDataUrl = `https://pokeapi.co/api/v2/${categoryType}/${categoryValue}`;
        let pokemonRefs = [];

        if (categoryType === 'region') {
            const regionResponse = await fetch(categoryDataUrl);
            if (!regionResponse.ok) {
                if (regionResponse.status === 404) return { pokemon: [], hasMore: false };
                throw new Error(`Falha ao buscar região ${categoryValue}, Status: ${regionResponse.status}`);
            }
            const regionData = await regionResponse.json();
            if (!regionData.main_generation?.url) return { pokemon: [], hasMore: false };
            const generationResponse = await fetch(regionData.main_generation.url);
            if (!generationResponse.ok) throw new Error(`Falha ao buscar geração ${regionData.main_generation.name}, Status: ${generationResponse.status}`);
            const generationData = await generationResponse.json();
            if (generationData.pokemon_species?.length > 0) {
                pokemonRefs = generationData.pokemon_species.filter(p => p?.url && p?.name);
            }
        } else {
            const categoryResponse = await fetch(categoryDataUrl);
            if (!categoryResponse.ok) {
                if (categoryResponse.status === 404) return { pokemon: [], hasMore: false };
                throw new Error(`Falha ao buscar categoria ${categoryType}: ${categoryValue}, Status: ${categoryResponse.status}`);
            }
            const categoryData = await categoryResponse.json();
            if (categoryData.pokemon?.length > 0) {
                pokemonRefs = categoryData.pokemon.map(p => p.pokemon).filter(p => p?.url && p?.name);
            } else if (categoryData.pokemon_species?.length > 0) {
                pokemonRefs = categoryData.pokemon_species.filter(p => p?.url && p?.name);
            }
        }

        console.log(`[fetchPokemonByCategory - ${categoryType}=${categoryValue}] Found ${pokemonRefs.length} initial refs.`); // Log initial refs
        if (pokemonRefs.length === 0) return { pokemon: [], hasMore: false };

        let filteredRefs = pokemonRefs;
        if (sName && sName !== '.') {
            filteredRefs = pokemonRefs.filter(ref => ref.name.toLowerCase().includes(sName.toLowerCase()));
        }

        console.log(`[fetchPokemonByCategory - ${categoryType}=${categoryValue}] Refs after name filter (${sName}): ${filteredRefs.length}`); // Log refs after name filter
        const totalFiltered = filteredRefs.length;
        const paginatedRefs = filteredRefs.slice(offset, offset + limit);
        const hasMore = totalFiltered > (offset + limit);

        if (paginatedRefs.length === 0) return { pokemon: [], hasMore: false };

        const detailPromises = paginatedRefs.map(ref => {
            let detailUrl = ref.url;
            // IMPORTANTE: A API de Habilidade retorna URLs de Pokémon, não de Species
            // if (detailUrl.includes('/pokemon-species/')) { // Esta verificação não é necessária para Habilidades
            //     const speciesId = detailUrl.split('/').filter(Boolean).pop();
            //     detailUrl = `https://pokeapi.co/api/v2/pokemon/${speciesId}`;
            // }
            return fetchPokemonDetailsByUrl(detailUrl);
        });

        console.log(`[fetchPokemonByCategory - ${categoryType}=${categoryValue}] Fetching details for ${detailPromises.length} refs...`); // Log detail fetch count
        let pokemonDetails = (await Promise.all(detailPromises)).filter(p => p !== null);
        console.log(`[fetchPokemonByCategory - ${categoryType}=${categoryValue}] Fetched ${pokemonDetails.length} details successfully.`); // Log successful details count

        // Remover o filtro da categoria principal ANTES de aplicar filtros secundários
        const filterKeyToRemove = getFilterKeyForCategory(categoryType);
        const { [filterKeyToRemove]: _, ...remainingFilters } = otherFilters;
        // console.log(`[fetchPokemonByCategory - ${categoryType}=${categoryValue}] Applying secondary filters:`, remainingFilters); // Log secondary filters being applied

        pokemonDetails = applySecondaryFilters(pokemonDetails, remainingFilters);
        console.log(`[fetchPokemonByCategory - ${categoryType}=${categoryValue}] Details after secondary filters: ${pokemonDetails.length}`); // Log details after secondary filters
        const sortedPokemon = sortPokemonList(pokemonDetails, sOrdering);

        return { pokemon: sortedPokemon, hasMore };

    } catch (error) {
        console.error(`Erro em fetchPokemonByCategory (${categoryType}=${categoryValue}):`, error);
        return { pokemon: [], hasMore: false };
    }
});

// Busca TODAS as habilidades COM DETALHES (Nome e Descrição)
export const fetchAllAbilitiesWithDetails = cache(async () => {
    try {
        // 1. Buscar a lista de todas as habilidades
        const listResponse = await fetch(`https://pokeapi.co/api/v2/ability?limit=400`); // Aumentar limite se necessário
        if (!listResponse.ok) {
            throw new Error(`Falha ao buscar lista de habilidades, Status: ${listResponse.status}`);
        }
        const listData = await listResponse.json();
        const abilityRefs = listData.results || [];

        if (abilityRefs.length === 0) return [];

        // 2. Buscar detalhes para cada habilidade em paralelo
        const detailPromises = abilityRefs.map(ref => fetchAbilityDetails(ref.url));
        const detailedAbilities = (await Promise.all(detailPromises)).filter(a => a !== null);

        // 3. Ordenar por nome localizado
        detailedAbilities.sort((a, b) => a.localizedName.localeCompare(b.localizedName));

        return detailedAbilities;

    } catch (error) {
        console.error("Erro em fetchAllAbilitiesWithDetails:", error);
        return []; // Retorna array vazio em caso de erro
    }
});


// Busca detalhes de um Pokémon específico (incluindo descrição, evolução, etc.)
export const fetchGameDetails = cache(async (id) => {
    try {
      if (!id) throw new Error("ID do Pokémon não fornecido");

      const pokemon = await fetchPokemonDetailsByUrl(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!pokemon) throw new Error(`Pokémon com ID ${id} não encontrado ou falha ao buscar`);

      let speciesData = null;
      if (pokemon.species_url) {
          try {
              const speciesResponse = await fetch(pokemon.species_url);
              if (speciesResponse.ok) speciesData = await speciesResponse.json();
          } catch (speciesError) { console.warn(`Erro ao buscar species data (detalhes):`, speciesError); }
      }

      let evolutionChainData = [];
      if (speciesData?.evolution_chain?.url) {
          try {
              const evolutionResponse = await fetch(speciesData.evolution_chain.url);
              const evolutionDataRaw = evolutionResponse.ok ? await evolutionResponse.json() : null;
              if (evolutionDataRaw) {
                  const processEvolutionChain = async (chain) => {
                      if (!chain?.species?.url) return;
                      const urlParts = chain.species.url.split('/');
                      const pokemonId = urlParts[urlParts.length - 2];
                      const evoPokemonDetails = await fetchPokemonDetailsByUrl(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
                      if (evoPokemonDetails) {
                          evolutionChainData.push({
                              id: parseInt(pokemonId),
                              name: evoPokemonDetails.name,
                              imageUrl: evoPokemonDetails.background_image
                          });
                      }
                      if (chain.evolves_to && chain.evolves_to.length > 0) {
                          await Promise.all(chain.evolves_to.map(nextChain => processEvolutionChain(nextChain)));
                      }
                  };
                  await processEvolutionChain(evolutionDataRaw.chain);
              }
          } catch (evolutionError) { console.warn(`Erro ao buscar/processar cadeia de evolução:`, evolutionError); }
      }

      // Buscar descrição (flavor text)
      let description = "Descrição não disponível.";
      if (speciesData?.flavor_text_entries) {
          const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'pt-br') || speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
          if (flavorTextEntry) {
              description = flavorTextEntry.flavor_text.replace(/\f/g, '\n').replace(/\n/g, ' '); // Limpar caracteres especiais
          }
      }

      // Buscar Gênero (se disponível)
      let genera = "";
      if (speciesData?.genera) {
          const generaEntry = speciesData.genera.find(entry => entry.language.name === 'pt-br') || speciesData.genera.find(entry => entry.language.name === 'en');
          if (generaEntry) {
              genera = generaEntry.genus;
          }
      }

      return {
        ...pokemon,
        description,
        genera,
        evolutionChain: evolutionChainData
      };

    } catch (error) {
      console.error(`Erro em fetchGameDetails para ID ${id}:`, error);
      // Retornar null ou um objeto de erro padronizado
      return null;
    }
});

