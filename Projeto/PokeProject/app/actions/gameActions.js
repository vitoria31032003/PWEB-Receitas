'use server';

import { cache } from 'react';

// Função para buscar todos os jogos (Pokémon)
export const fetchGames = cache(async (filters = {}) => {
  try {
    const { 
      sName = '', 
      sType = '', 
      sWeakness = '',
      sAbility = '',
      sHeight = '',
      sWeight = '',
      sGeneration = '',
      sRegion = '',
      sHabitat = '',
      sOrdering = '', 
      sPage = 1 
    } = filters;
    
    // Construir a URL base da API do Pokémon
    let apiUrl = 'https://pokeapi.co/api/v2/pokemon';
    
    // Adicionar parâmetros de paginação
    const limit = 20;
    const offset = (sPage - 1) * limit;
    
    // Se estamos buscando por um nome ou ID específico
    if (sName) {
      // Verificar se é um número (ID) ou nome
      const isNumeric = /^\d+$/.test(sName);
      if (isNumeric) {
        apiUrl = `https://pokeapi.co/api/v2/pokemon/${sName}`;
        const response = await fetch(apiUrl);
        
        // Se não encontrou o Pokémon pelo ID, retornar array vazio
        if (!response.ok) return [];
        
        const pokemon = await response.json();
        
        // Buscar informações adicionais para o Pokémon
        const speciesResponse = await fetch(pokemon.species.url);
        const speciesData = await speciesResponse.json();
        
        // Formatar os dados do Pokémon
        return [{
          id: pokemon.id,
          name: pokemon.name,
          background_image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
          description_raw: `Tipos: ${pokemon.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join(', ')}`,
          height: pokemon.height / 10, // Converter para metros
          weight: pokemon.weight / 10, // Converter para kg
          types: pokemon.types.map(t => t.type.name),
          abilities: pokemon.abilities.map(a => a.ability.name),
          stats: pokemon.stats.map(s => ({
            name: s.stat.name,
            value: s.base_stat
          })),
          species: speciesData.name,
          generation: speciesData.generation.name,
          habitat: speciesData.habitat?.name || 'unknown',
          evolution_chain_url: speciesData.evolution_chain.url
        }];
      } else {
        // Buscar por nome (parcial)
        apiUrl = `${apiUrl}?limit=100&offset=0`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Filtrar resultados pelo nome
        const filteredResults = data.results.filter(p => 
          p.name.toLowerCase().includes(sName.toLowerCase())
        ).slice(0, limit);
        
        // Buscar detalhes para cada Pokémon filtrado
        const pokemonDetails = await Promise.all(
          filteredResults.map(async (p) => {
            const detailResponse = await fetch(p.url);
            const pokemon = await detailResponse.json();
            
            // Buscar informações adicionais para o Pokémon
            const speciesResponse = await fetch(pokemon.species.url);
            const speciesData = await speciesResponse.json();
            
            return {
              id: pokemon.id,
              name: pokemon.name,
              background_image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
              description_raw: `Tipos: ${pokemon.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join(', ')}`,
              height: pokemon.height / 10,
              weight: pokemon.weight / 10,
              types: pokemon.types.map(t => t.type.name),
              abilities: pokemon.abilities.map(a => a.ability.name),
              stats: pokemon.stats.map(s => ({
                name: s.stat.name,
                value: s.base_stat
              })),
              species: speciesData.name,
              generation: speciesData.generation.name,
              habitat: speciesData.habitat?.name || 'unknown',
              evolution_chain_url: speciesData.evolution_chain.url
            };
          })
        );
        
        return pokemonDetails;
      }
    }
    
    // Busca padrão com paginação
    apiUrl = `${apiUrl}?limit=${limit}&offset=${offset}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Buscar detalhes para cada Pokémon
    const pokemonDetails = await Promise.all(
      data.results.map(async (pokemon) => {
        const detailResponse = await fetch(pokemon.url);
        const pokemonData = await detailResponse.json();
        
        // Buscar informações adicionais para o Pokémon
        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();
        
        return {
          id: pokemonData.id,
          name: pokemonData.name,
          background_image: pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default,
          description_raw: `Tipos: ${pokemonData.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join(', ')}`,
          height: pokemonData.height / 10,
          weight: pokemonData.weight / 10,
          types: pokemonData.types.map(t => t.type.name),
          abilities: pokemonData.abilities.map(a => a.ability.name),
          stats: pokemonData.stats.map(s => ({
            name: s.stat.name,
            value: s.base_stat
          })),
          species: speciesData.name,
          generation: speciesData.generation.name,
          habitat: speciesData.habitat?.name || 'unknown',
          evolution_chain_url: speciesData.evolution_chain.url
        };
      })
    );
    
    // Aplicar filtros adicionais
    let filteredPokemon = pokemonDetails;
    
    // Filtrar por tipo
    if (sType) {
      filteredPokemon = filteredPokemon.filter(p => 
        p.types.some(t => t.toLowerCase() === sType.toLowerCase())
      );
    }
    
    // Filtrar por fraqueza (simplificado - na realidade precisaria de uma tabela de efetividade)
    if (sWeakness) {
      // Mapeamento simplificado de fraquezas
      const weaknessMap = {
        normal: ['fighting'],
        fire: ['water', 'ground', 'rock'],
        water: ['electric', 'grass'],
        electric: ['ground'],
        grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
        ice: ['fire', 'fighting', 'rock', 'steel'],
        fighting: ['flying', 'psychic', 'fairy'],
        poison: ['ground', 'psychic'],
        ground: ['water', 'grass', 'ice'],
        flying: ['electric', 'ice', 'rock'],
        psychic: ['bug', 'ghost', 'dark'],
        bug: ['fire', 'flying', 'rock'],
        rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
        ghost: ['ghost', 'dark'],
        dragon: ['ice', 'dragon', 'fairy'],
        dark: ['fighting', 'bug', 'fairy'],
        steel: ['fire', 'fighting', 'ground'],
        fairy: ['poison', 'steel']
      };
      
      filteredPokemon = filteredPokemon.filter(p => {
        // Para cada tipo do Pokémon, verificar se é fraco contra o tipo selecionado
        return p.types.some(type => {
          const weaknesses = weaknessMap[type.toLowerCase()] || [];
          return weaknesses.includes(sWeakness.toLowerCase());
        });
      });
    }
    
    // Filtrar por habilidade
    if (sAbility) {
      filteredPokemon = filteredPokemon.filter(p => 
        p.abilities.some(a => a.toLowerCase() === sAbility.toLowerCase())
      );
    }
    
    // Filtrar por altura
    if (sHeight) {
      switch (sHeight) {
        case 'small':
          filteredPokemon = filteredPokemon.filter(p => p.height < 1);
          break;
        case 'medium':
          filteredPokemon = filteredPokemon.filter(p => p.height >= 1 && p.height <= 2);
          break;
        case 'large':
          filteredPokemon = filteredPokemon.filter(p => p.height > 2);
          break;
      }
    }
    
    // Filtrar por peso
    if (sWeight) {
      switch (sWeight) {
        case 'light':
          filteredPokemon = filteredPokemon.filter(p => p.weight < 10);
          break;
        case 'medium':
          filteredPokemon = filteredPokemon.filter(p => p.weight >= 10 && p.weight <= 50);
          break;
        case 'heavy':
          filteredPokemon = filteredPokemon.filter(p => p.weight > 50);
          break;
      }
    }
    
    // Filtrar por geração
    if (sGeneration) {
      // Mapear IDs de geração para nomes de geração na API
      const generationMap = {
        1: 'generation-i',
        2: 'generation-ii',
        3: 'generation-iii',
        4: 'generation-iv',
        5: 'generation-v',
        6: 'generation-vi',
        7: 'generation-vii',
        8: 'generation-viii',
        9: 'generation-ix'
      };
      
      const generationName = generationMap[sGeneration];
      if (generationName) {
        filteredPokemon = filteredPokemon.filter(p => 
          p.generation === generationName
        );
      }
    }
    
    // Filtrar por região (simplificado - mapeando regiões para gerações)
    if (sRegion) {
      // Mapear IDs de região para nomes de geração na API
      const regionMap = {
        1: 'generation-i',    // Kanto
        2: 'generation-ii',   // Johto
        3: 'generation-iii',  // Hoenn
        4: 'generation-iv',   // Sinnoh
        5: 'generation-v',    // Unova
        6: 'generation-vi',   // Kalos
        7: 'generation-vii',  // Alola
        8: 'generation-viii', // Galar
        9: 'generation-ix'    // Paldea
      };
      
      const generationName = regionMap[sRegion];
      if (generationName) {
        filteredPokemon = filteredPokemon.filter(p => 
          p.generation === generationName
        );
      }
    }
    
    // Filtrar por habitat
    if (sHabitat) {
      // Mapear IDs de habitat para nomes de habitat na API
      const habitatMap = {
        1: 'cave',
        2: 'forest',
        3: 'mountain',
        4: 'grassland',
        5: 'waters-edge',
        6: 'sea',
        7: 'urban',
        8: 'rare',
        9: 'rough-terrain'
      };
      
      const habitatName = habitatMap[sHabitat];
      if (habitatName) {
        filteredPokemon = filteredPokemon.filter(p => 
          p.habitat === habitatName
        );
      }
    }
    
    // Ordenar resultados
    if (sOrdering) {
      switch (sOrdering) {
        case 'name':
          filteredPokemon.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case '-name':
          filteredPokemon.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'height':
          filteredPokemon.sort((a, b) => a.height - b.height);
          break;
        case '-height':
          filteredPokemon.sort((a, b) => b.height - a.height);
          break;
        case 'weight':
          filteredPokemon.sort((a, b) => a.weight - b.weight);
          break;
        case '-weight':
          filteredPokemon.sort((a, b) => b.weight - a.weight);
          break;
        default:
          // Ordenar por ID (padrão)
          filteredPokemon.sort((a, b) => a.id - b.id);
      }
    } else {
      // Ordenar por ID (padrão)
      filteredPokemon.sort((a, b) => a.id - b.id);
    }
    
    return filteredPokemon;
  } catch (error) {
    console.error('Erro ao buscar Pokémon:', error);
    return [];
  }
});

// Função para buscar detalhes de um jogo específico (Pokémon)
export const fetchGameDetails = cache(async (id) => {
  try {
    // Buscar dados do Pokémon
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    
    if (!response.ok) {
      throw new Error(`Pokémon com ID ${id} não encontrado`);
    }
    
    const pokemon = await response.json();
    
    // Buscar informações adicionais da espécie
    const speciesResponse = await fetch(pokemon.species.url);
    const speciesData = await speciesResponse.json();
    
    // Buscar informações da cadeia evolutiva
    const evolutionResponse = await fetch(speciesData.evolution_chain.url);
    const evolutionData = await evolutionResponse.json();
    
    // Processar a cadeia evolutiva
    const evolutionChain = [];
    
    // Função recursiva para processar a cadeia evolutiva
    const processEvolutionChain = async (chain) => {
      // Extrair o ID do Pokémon da URL
      const urlParts = chain.species.url.split('/');
      const pokemonId = urlParts[urlParts.length - 2];
      
      // Buscar dados básicos do Pokémon
      const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      const pokemonData = await pokemonResponse.json();
      
      // Adicionar à cadeia evolutiva
      evolutionChain.push({
        id: parseInt(pokemonId),
        name: chain.species.name,
        image: pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default,
        evolution_details: chain.evolution_details
      });
      
      // Processar evoluções
      if (chain.evolves_to && chain.evolves_to.length > 0) {
        for (const evolution of chain.evolves_to) {
          await processEvolutionChain(evolution);
        }
      }
    };
    
    // Iniciar processamento da cadeia evolutiva
    await processEvolutionChain(evolutionData.chain);
    
    // Formatar os dados do Pokémon
    return {
      id: pokemon.id,
      name: pokemon.name,
      name_original: pokemon.name,
      background_image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
      background_image_additional: Object.values(pokemon.sprites).filter(sprite => sprite && typeof sprite === 'string'),
      description: speciesData.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text || '',
      description_raw: `Tipos: ${pokemon.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join(', ')}`,
      height: pokemon.height / 10, // Converter para metros
      weight: pokemon.weight / 10, // Converter para kg
      types: pokemon.types.map(t => ({
        name: t.type.name,
        url: t.type.url
      })),
      abilities: pokemon.abilities.map(a => ({
        name: a.ability.name,
        url: a.ability.url,
        is_hidden: a.is_hidden
      })),
      stats: pokemon.stats.map(s => ({
        name: s.stat.name,
        value: s.base_stat
      })),
      moves: pokemon.moves.slice(0, 10).map(m => ({
        name: m.move.name,
        url: m.move.url
      })),
      species: {
        name: speciesData.name,
        url: pokemon.species.url
      },
      generation: speciesData.generation.name,
      habitat: speciesData.habitat?.name || 'unknown',
      evolution_chain: evolutionChain,
      sprites: {
        front_default: pokemon.sprites.front_default,
        back_default: pokemon.sprites.back_default,
        front_shiny: pokemon.sprites.front_shiny,
        back_shiny: pokemon.sprites.back_shiny
      }
    };
  } catch (error) {
    console.error(`Erro ao buscar detalhes do Pokémon ${id}:`, error);
    return null;
  }
});
