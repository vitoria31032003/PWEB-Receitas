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
    
    let speciesData = null;
    if (pokemonData.species?.url) {
        try {
            const speciesResponse = await fetch(pokemonData.species.url);
            if (speciesResponse.ok) speciesData = await speciesResponse.json();
        } catch (speciesError) { console.warn(`Erro ao buscar species data para ${pokemonData.name}:`, speciesError); }
    }

    return await processPokemonData(pokemonData, speciesData);

  } catch (error) {
    console.error(`Erro ao buscar detalhes do Pokémon ${url}:`, error);
    return null;
  }
};

// Processa dados brutos do Pokémon, busca species e retorna objeto padronizado
const processPokemonData = async (pokemonData, speciesData = null) => {
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

        console.log(`[fetchPokemonByCategory - ${categoryType}=${categoryValue}] Found ${pokemonRefs.length} initial refs.`);
        if (pokemonRefs.length === 0) return { pokemon: [], hasMore: false };

        let filteredRefs = pokemonRefs;
        if (sName && sName !== '.') {
            filteredRefs = pokemonRefs.filter(ref => ref.name.toLowerCase().includes(sName.toLowerCase()));
        }

        const totalFiltered = filteredRefs.length;
        const paginatedRefs = filteredRefs.slice(offset, offset + limit);
        const hasMore = totalFiltered > (offset + limit);

        if (paginatedRefs.length === 0) return { pokemon: [], hasMore: false };

        const detailPromises = paginatedRefs.map(ref => {
            let detailUrl = ref.url;
            // Para gerações e regiões, as URLs são de species, precisamos converter para pokemon
            if (detailUrl.includes('/pokemon-species/')) {
                const speciesId = detailUrl.split('/').filter(Boolean).pop();
                detailUrl = `https://pokeapi.co/api/v2/pokemon/${speciesId}`;
            }
            return fetchPokemonDetailsByUrl(detailUrl);
        });

        let pokemonDetails = (await Promise.all(detailPromises)).filter(p => p !== null);

        // Remover o filtro da categoria principal ANTES de aplicar filtros secundários
        const filterKeyToRemove = getFilterKeyForCategory(categoryType);
        const { [filterKeyToRemove]: _, ...remainingFilters } = otherFilters;

        pokemonDetails = applySecondaryFilters(pokemonDetails, remainingFilters);
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
              if (speciesResponse.ok) {
                  speciesData = await speciesResponse.json();
              }
          } catch (speciesError) { 
              console.warn(`Erro ao buscar species data (detalhes):`, speciesError); 
          }
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
                              image: evoPokemonDetails.background_image
                          });
                      }
                      if (chain.evolves_to && chain.evolves_to.length > 0) {
                          await Promise.all(chain.evolves_to.map(nextChain => processEvolutionChain(nextChain)));
                      }
                  };
                  await processEvolutionChain(evolutionDataRaw.chain);
              }
          } catch (evolutionError) { 
              console.warn(`Erro ao buscar/processar cadeia de evolução:`, evolutionError); 
          }
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
        evolution_chain: evolutionChainData
      };

    } catch (error) {
      console.error(`Erro em fetchGameDetails para ID ${id}:`, error);
      // Retornar null ou um objeto de erro padronizado
      return null;
    }
});



// Busca a cadeia evolutiva de um Pokémon (versão otimizada)
const fetchEvolutionChain = async (url) => {
    try {
        if (!url) return [];
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Falha ao buscar cadeia evolutiva: ${url}, status: ${response.status}`);
            return [];
        }
        const data = await response.json();
        const evolutionChain = [];
        
        // Função recursiva para processar a cadeia
        const processChain = (chain) => {
            if (!chain?.species?.url) return;
            
            const speciesId = chain.species.url.split('/').filter(Boolean).pop();
            evolutionChain.push({
                id: parseInt(speciesId),
                name: chain.species.name,
                // Não buscar imagem aqui para melhorar performance
                image: null
            });
            
            // Processar evoluções
            if (chain.evolves_to && chain.evolves_to.length > 0) {
                chain.evolves_to.forEach(nextChain => processChain(nextChain));
            }
        };
        
        processChain(data.chain);
        return evolutionChain;
    } catch (error) {
        console.error(`Erro ao buscar cadeia evolutiva ${url}:`, error);
        return [];
    }
};

