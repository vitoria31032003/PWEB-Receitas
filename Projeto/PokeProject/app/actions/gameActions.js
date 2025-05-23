
'use server';

import { cache } from 'react';

// Função auxiliar para buscar detalhes de um Pokémon pela URL
const fetchPokemonDetailsByUrl = async (url) => {
  try {
    // Extrai o ID do Pokémon da URL para usar como fallback se o nome falhar
    const urlParts = url.split('/');
    const pokemonId = urlParts[urlParts.length - 2];

    const detailResponse = await fetch(url);
    if (!detailResponse.ok) {
      console.warn(`Falha ao buscar detalhes de: ${url}, status: ${detailResponse.status}`);
      // Tenta buscar pelo ID como fallback
      const fallbackUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
      const fallbackResponse = await fetch(fallbackUrl);
      if (!fallbackResponse.ok) {
          console.error(`Falha ao buscar fallback pelo ID: ${pokemonId}, status: ${fallbackResponse.status}`);
          return null;
      }
      const pokemonData = await fallbackResponse.json();
      return processPokemonData(pokemonData); // Processa os dados do fallback
    }
    const pokemonData = await detailResponse.json();
    return await processPokemonData(pokemonData);

  } catch (error) {
    console.error(`Erro ao buscar detalhes do Pokémon ${url}:`, error);
    return null; // Retorna null em caso de erro
  }
};

// Função auxiliar para processar dados brutos do Pokémon e buscar species
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
        types: pokemonData.types?.map(t => t.type) || [], // Mantém o objeto {name, url}
        abilities: pokemonData.abilities?.map(a => a.ability) || [], // Mantém o objeto {name, url}
        stats: pokemonData.stats?.map(s => ({ name: s.stat.name, value: s.base_stat })) || [],
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


// Função auxiliar para ordenar a lista de Pokémon
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

// Função PRINCIPAL para buscar Pokémon (Home e busca geral)
export const fetchGames = cache(async (filters = {}) => {
  const { sName = '.', sPage = 1, sOrdering = '.', ...otherFilters } = filters;
  const limit = 40;
  const offset = (sPage - 1) * limit;

  try {
    // Busca por ID ou Nome específico
    if (sName && sName !== '.' && /^[0-9]+$/.test(sName)) { // Busca por ID
      const detail = await fetchPokemonDetailsByUrl(`https://pokeapi.co/api/v2/pokemon/${sName}`);
      return detail ? { pokemon: [detail], hasMore: false } : { pokemon: [], hasMore: false };
    } else if (sName && sName !== '.') { // Busca por Nome (parcial)
        const initialListUrl = `https://pokeapi.co/api/v2/pokemon?limit=1302&offset=0`; // Busca todos
        const response = await fetch(initialListUrl);
        if (!response.ok) throw new Error('Falha ao buscar lista completa para filtro de nome');
        const data = await response.json();
        const nameMatches = data.results.filter(p => p.name.toLowerCase().includes(sName.toLowerCase()));

        if (nameMatches.length === 0) return { pokemon: [], hasMore: false };

        // Aplicar outros filtros (sType, sAbility, etc.) ANTES de buscar detalhes
        // Isso requer buscar detalhes para todos os nameMatches, o que pode ser lento.
        // Alternativa: Aplicar filtros após buscar detalhes da página atual.

        // Paginar os resultados do filtro de nome
        const totalFiltered = nameMatches.length;
        const paginatedMatches = nameMatches.slice(offset, offset + limit);
        const hasMore = totalFiltered > (offset + limit);

        const pokemonDetailsPromises = paginatedMatches.map(p => fetchPokemonDetailsByUrl(p.url));
        let pokemonDetails = (await Promise.all(pokemonDetailsPromises)).filter(p => p !== null);

        // Aplicar outros filtros (sType, sAbility, etc.) DEPOIS de buscar detalhes da página
        pokemonDetails = applySecondaryFilters(pokemonDetails, otherFilters);
        const sortedPokemon = sortPokemonList(pokemonDetails, sOrdering);

        return { pokemon: sortedPokemon, hasMore };

    } else {
      // Busca Padrão Paginada (sem filtro de nome)
      const apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Falha ao buscar lista paginada');
      const data = await response.json();
      const hasMore = !!data.next; // Verifica se existe próxima página

      const pokemonDetailsPromises = data.results.map(p => fetchPokemonDetailsByUrl(p.url));
      let pokemonDetails = (await Promise.all(pokemonDetailsPromises)).filter(p => p !== null);

      // Aplicar outros filtros (sType, sAbility, etc.) DEPOIS de buscar detalhes da página
      pokemonDetails = applySecondaryFilters(pokemonDetails, otherFilters);
      const sortedPokemon = sortPokemonList(pokemonDetails, sOrdering);

      return { pokemon: sortedPokemon, hasMore };
    }
  } catch (error) {
    console.error('Erro em fetchGames:', error);
    return { pokemon: [], hasMore: false };
  }
});

// Função para buscar Pokémon por CATEGORIA (Tipos, Gerações, etc.)
export const fetchPokemonByCategory = cache(async (categoryType, categoryValue, filters = {}) => {
    const { sName = '.', sOrdering = '.', sPage = 1, ...otherFilters } = filters;
    const limit = 40;
    const offset = (sPage - 1) * limit;

    try {
        // 1. Obter a lista de URLs de Pokémon para a categoria específica
        const categoryUrl = `https://pokeapi.co/api/v2/${categoryType}/${categoryValue}`;
        const categoryResponse = await fetch(categoryUrl);
        if (!categoryResponse.ok) {
            // Se a categoria não for encontrada, retorna vazio
            if (categoryResponse.status === 404) {
                console.warn(`Categoria ${categoryType}: ${categoryValue} não encontrada.`);
                return { pokemon: [], hasMore: false };
            }
            throw new Error(`Falha ao buscar categoria ${categoryType}: ${categoryValue}, Status: ${categoryResponse.status}`);
        }
        const categoryData = await categoryResponse.json();

        // Extrair a lista de referências de Pokémon (pode variar dependendo da categoria)
        let pokemonRefs = [];
        if (categoryData.pokemon && Array.isArray(categoryData.pokemon)) { // Para tipos, habilidades, etc.
            pokemonRefs = categoryData.pokemon.map(p => p.pokemon).filter(p => p && p.url && p.name); // Garante que tem url e nome
        } else if (categoryData.pokemon_species && Array.isArray(categoryData.pokemon_species)) { // Para gerações, regiões (via geração), habitats
            pokemonRefs = categoryData.pokemon_species.filter(p => p && p.url && p.name);
        }
        // Adicionar mais casos se necessário para outras categorias

        if (pokemonRefs.length === 0) return { pokemon: [], hasMore: false };

        // 2. Aplicar filtro de nome (sName) na lista de referências ANTES da paginação
        let filteredRefs = pokemonRefs;
        if (sName && sName !== '.') {
            filteredRefs = pokemonRefs.filter(ref => ref.name.toLowerCase().includes(sName.toLowerCase()));
        }

        // 3. Paginar a lista de referências filtradas
        const totalFiltered = filteredRefs.length;
        const paginatedRefs = filteredRefs.slice(offset, offset + limit);
        const hasMore = totalFiltered > (offset + limit);

        if (paginatedRefs.length === 0) return { pokemon: [], hasMore: false };

        // 4. Buscar detalhes para os Pokémon da página atual
        // Para species, precisamos construir a URL do pokemon a partir da URL da species
        const detailPromises = paginatedRefs.map(ref => {
            let detailUrl = ref.url;
            if (detailUrl.includes('/pokemon-species/')) {
                const speciesId = detailUrl.split('/').filter(Boolean).pop();
                detailUrl = `https://pokeapi.co/api/v2/pokemon/${speciesId}`;
            }
            return fetchPokemonDetailsByUrl(detailUrl);
        });

        let pokemonDetails = (await Promise.all(detailPromises)).filter(p => p !== null);

        // 5. Aplicar filtros secundários (sType, sAbility, etc.) nos detalhes da página atual
        // Nota: O filtro da categoria principal (ex: sType) já foi aplicado ao buscar a lista inicial.
        // Removemos o filtro da categoria principal de otherFilters para não aplicar duas vezes.
        const { [getFilterKeyForCategory(categoryType)]: _, ...remainingFilters } = otherFilters;
        pokemonDetails = applySecondaryFilters(pokemonDetails, remainingFilters);

        // 6. Ordenar os resultados da página atual
        const sortedPokemon = sortPokemonList(pokemonDetails, sOrdering);

        return { pokemon: sortedPokemon, hasMore };

    } catch (error) {
        console.error(`Erro em fetchPokemonByCategory (${categoryType}=${categoryValue}):`, error);
        return { pokemon: [], hasMore: false };
    }
});

// Função auxiliar para mapear categoryType para a chave de filtro correspondente
function getFilterKeyForCategory(categoryType) {
    switch (categoryType) {
        case 'type': return 'sType';
        case 'generation': return 'sGeneration';
        case 'pokemon-habitat': return 'sHabitat'; // API usa 'pokemon-habitat'
        case 'region': return 'sRegion';
        case 'ability': return 'sAbility';
        default: return null;
    }
}

// Função auxiliar para aplicar filtros secundários (em dados já carregados)
function applySecondaryFilters(pokemonList, filters) {
    let filtered = [...pokemonList];
    const { sType, sWeakness, sAbility, sHeight, sWeight, sGeneration, sRegion, sHabitat } = filters;

    if (sType && sType !== '.') {
        filtered = filtered.filter(p => p.types.some(t => t.name.toLowerCase() === sType.toLowerCase()));
    }
    if (sAbility && sAbility !== '.') {
        filtered = filtered.filter(p => p.abilities.some(a => a.name.toLowerCase() === sAbility.toLowerCase()));
    }
    // Os filtros sGeneration, sRegion, sHabitat são aplicados na busca inicial pela categoria, não aqui.
    // if (sGeneration && sGeneration !== '.') { ... }
    // if (sRegion && sRegion !== '.') { ... }
    // if (sHabitat && sHabitat !== '.') { ... }

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
    // Implementação de Fraqueza (sWeakness) - Requer mapa de fraquezas
    if (sWeakness && sWeakness !== '.') {
        // Exemplo simplificado - idealmente usar um mapa completo de fraquezas
        // const weaknessMap = { fire: ['water', 'ground', 'rock'], ... };
        // filtered = filtered.filter(p => p.types.some(type => (weaknessMap[type.name.toLowerCase()] || []).includes(sWeakness.toLowerCase())));
        console.warn("Filtro de fraqueza (sWeakness) não implementado completamente.");
    }

    return filtered;
}

// *** NOVA FUNÇÃO ***
// Função para buscar TODAS as habilidades
export const fetchAllAbilities = cache(async () => {
    try {
        // A API lista 300+ habilidades, buscar um limite alto
        const response = await fetch(`https://pokeapi.co/api/v2/ability?limit=400`);
        if (!response.ok) {
            throw new Error(`Falha ao buscar lista de habilidades, Status: ${response.status}`);
        }
        const data = await response.json();
        // Retorna a lista de resultados { name: string, url: string }[]
        return data.results || [];
    } catch (error) {
        console.error("Erro em fetchAllAbilities:", error);
        return []; // Retorna array vazio em caso de erro
    }
});


// Função para buscar detalhes de um Pokémon específico
export const fetchGameDetails = cache(async (id) => {
    try {
      if (!id) throw new Error("ID do Pokémon não fornecido");

      // Usar a função auxiliar que já trata species e outros detalhes básicos
      const pokemon = await fetchPokemonDetailsByUrl(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!pokemon) throw new Error(`Pokémon com ID ${id} não encontrado ou falha ao buscar`);

      // Buscar informações adicionais (evolução, descrição mais detalhada)
      let speciesData = null;
      if (pokemon.species_url) {
          try {
              const speciesResponse = await fetch(pokemon.species_url);
              if (speciesResponse.ok) {
                  speciesData = await speciesResponse.json();
              }
          } catch (speciesError) {
              console.warn(`Erro ao buscar species data para ${pokemon.name} (detalhes):`, speciesError);
          }
      }

      let evolutionChainData = [];
      if (speciesData?.evolution_chain?.url) {
          try {
              const evolutionResponse = await fetch(speciesData.evolution_chain.url);
              const evolutionDataRaw = evolutionResponse.ok ? await evolutionResponse.json() : null;
              if (evolutionDataRaw) {
                  const processEvolutionChain = async (chain) => {
                      if (!chain || !chain.species || !chain.species.url) return;
                      const urlParts = chain.species.url.split('/');
                      const pokemonId = urlParts[urlParts.length - 2];
                      // Usar fetchPokemonDetailsByUrl para obter imagem e nome padronizados
                      const evoPokemonDetails = await fetchPokemonDetailsByUrl(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
                      if (evoPokemonDetails) {
                          evolutionChainData.push({
                              id: parseInt(pokemonId),
                              name: evoPokemonDetails.name,
                              image: evoPokemonDetails.background_image,
                          });
                      }
                      if (chain.evolves_to && chain.evolves_to.length > 0) {
                          for (const evolution of chain.evolves_to) {
                              await processEvolutionChain(evolution);
                          }
                      }
                  };
                  await processEvolutionChain(evolutionDataRaw.chain);
              } // fim if evolutionDataRaw
          } catch (evoError) {
              console.warn(`Erro ao processar cadeia de evolução para ${pokemon.name}:`, evoError);
          }
      } // fim if evolution_chain_url

      // Encontrar uma descrição em inglês (ou pt-br se disponível)
      let description = "Descrição não disponível.";
      if (speciesData?.flavor_text_entries) {
          const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en') || speciesData.flavor_text_entries[0];
          if (flavorTextEntry) {
              description = flavorTextEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' '); // Limpa caracteres especiais
          }
      }

      // Buscar detalhes das habilidades
      let detailedAbilities = [];
      if (pokemon.abilities && pokemon.abilities.length > 0) {
          const abilityPromises = pokemon.abilities.map(async (abilityRef) => {
              if (!abilityRef || !abilityRef.url) return null;
              try {
                  const abilityResponse = await fetch(abilityRef.url);
                  if (!abilityResponse.ok) return { name: abilityRef.name, description: "Não foi possível carregar a descrição." };
                  const abilityData = await abilityResponse.json();
                  const effectEntry = abilityData.effect_entries?.find(e => e.language.name === 'en');
                  return {
                      name: abilityRef.name,
                      description: effectEntry?.short_effect || "Descrição não disponível."
                  };
              } catch (abilityError) {
                  console.warn(`Erro ao buscar detalhes da habilidade ${abilityRef.name}:`, abilityError);
                  return { name: abilityRef.name, description: "Erro ao carregar descrição." };
              }
          });
          detailedAbilities = (await Promise.all(abilityPromises)).filter(a => a !== null);
      }

      // Retornar o objeto completo
      return {
        ...pokemon,
        description: description,
        evolution_chain: evolutionChainData,
        detailed_abilities: detailedAbilities,
        // Adicionar outros campos conforme necessário
      };

    } catch (error) {
      console.error(`Erro em fetchGameDetails para ID ${id}:`, error);
      // Lançar o erro ou retornar um objeto de erro pode ser melhor aqui
      // dependendo de como o erro é tratado no componente
      throw error; // Re-lança o erro para ser tratado no componente
    }
});

