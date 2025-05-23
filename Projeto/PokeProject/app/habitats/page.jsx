"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard';
import { fetchGames } from '../actions/gameActions';

// Lista de habitats de Pokémon
const pokemonHabitats = [
  { id: 1, name: "Caverna", apiName: "cave", color: "bg-typeRock", description: "Pokémon que vivem em cavernas e ambientes subterrâneos" },
  { id: 2, name: "Floresta", apiName: "forest", color: "bg-typeGrass", description: "Pokémon que habitam florestas densas e bosques" },
  { id: 3, name: "Montanha", apiName: "mountain", color: "bg-typeGround", description: "Pokémon que vivem em regiões montanhosas e elevadas" },
  { id: 4, name: "Planície", apiName: "grassland", color: "bg-typeNormal", description: "Pokémon que habitam campos abertos e planícies" },
  { id: 5, name: "Água doce", apiName: "waters-edge", color: "bg-typeWater", description: "Pokémon que vivem em lagos, rios e outros corpos de água doce" }, // Mapeado para waters-edge
  { id: 6, name: "Água salgada", apiName: "sea", color: "bg-typeWater", description: "Pokémon que habitam oceanos e mares" },
  { id: 7, name: "Urbano", apiName: "urban", color: "bg-typeSteel", description: "Pokémon que se adaptaram a viver em cidades e ambientes urbanos" },
  { id: 8, name: "Raro", apiName: "rare", color: "bg-typePsychic", description: "Pokémon raros que habitam locais específicos e difíceis de encontrar" },
  { id: 9, name: "Terreno Acidentado", apiName: "rough-terrain", color: "bg-typeFighting", description: "Pokémon que vivem em terrenos irregulares e acidentados" } // Adicionado/Ajustado
];

// Reutilizar listas de tipos e habilidades
const pokemonTypes = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting", 
  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", 
  "dragon", "dark", "steel", "fairy"
];
const commonAbilities = [
  "overgrow", "blaze", "torrent", "shield-dust", "shed-skin", "compound-eyes",
  "swarm", "keen-eye", "run-away", "intimidate", "static", "sand-veil", 
  "lightning-rod", "levitate", "chlorophyll", "effect-spore", "synchronize",
  "clear-body", "natural-cure", "serene-grace", "swift-swim", "battle-armor"
];

export default function HabitatsPage() {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [selectedHabitat, setSelectedHabitat] = useState(null); // Armazena o objeto do habitat selecionado
  const [pokemonList, setPokemonList] = useState([]);
  const [filters, setFilters] = useState({ 
    sName: ".", 
    sType: ".",
    sWeakness: ".",
    sAbility: ".",
    sHeight: ".",
    sWeight: ".",
    sHabitat: ".", // Será definido quando um habitat for selecionado
    sOrdering: ".", 
    sPage: 1 
  });
  const [loading, setLoading] = useState(false); // Loading para busca/filtros
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading para rolagem infinita
  const [hasMore, setHasMore] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [totalCount, setTotalCount] = useState(0); // Estimativa do total

  // Referência para o elemento de observação da rolagem infinita
  const observer = useRef();
  const lastPokemonElementRef = useCallback(node => {
    if (loading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePokemon();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isLoadingMore, hasMore]);

  useEffect(() => {
    // Simular carregamento inicial da lista de habitats
    const timer = setTimeout(() => {
      setLoadingInitial(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Carregar Pokémon quando um habitat é selecionado ou filtros mudam
  useEffect(() => {
    if (!selectedHabitat) return; // Não busca se nenhum habitat está selecionado

    const fetchData = async () => {
      setLoading(true);
      setIsLoadingMore(false);
      try {
        // Usa o ID do habitat para o filtro sHabitat
        const currentFilters = { ...filters, sHabitat: selectedHabitat.id }; 
        const data = await fetchGames(currentFilters);
        
        if (currentFilters.sPage === 1) {
          setPokemonList(data);
          setTotalCount(data.length);
        } else {
          const newPokemon = data.filter(newPoke => 
            !pokemonList.some(existingPoke => existingPoke.id === newPoke.id)
          );
          setPokemonList(prev => [...prev, ...newPokemon]);
        }
        
        if (data.length < 40) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

      } catch (error) {
        console.error("Erro ao buscar Pokémon:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    };
    
    fetchData();
  }, [selectedHabitat, filters]);

  // Atualiza os filtros
  const updateFilters = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value, sPage: 1 }));
    
    if (name === 'sName') {
      if (searchTimeout) clearTimeout(searchTimeout);
      const newTimeout = setTimeout(() => { /* Triggered by useEffect */ }, 500);
      setSearchTimeout(newTimeout);
    }
  };

  const resetFilters = () => {
    setFilters({ 
      sName: ".", 
      sType: ".",
      sWeakness: ".",
      sAbility: ".",
      sHeight: ".",
      sWeight: ".",
      sHabitat: selectedHabitat.id, // Mantém o habitat selecionado
      sOrdering: ".", 
      sPage: 1 
    });
    setPokemonList([]);
    setHasMore(true);
    setShowAdvancedSearch(false);
  };

  const applyFilters = () => {
    setFilters(prev => ({ ...prev, sPage: 1 }));
    setPokemonList([]);
    setHasMore(true);
  };

  const loadMorePokemon = () => {
    if (!isLoadingMore && hasMore && !loading) {
      setIsLoadingMore(true);
      setFilters(prev => ({ ...prev, sPage: prev.sPage + 1 }));
    }
  };

  // Função para selecionar um habitat (passa o objeto completo)
  const handleSelectHabitat = (habitat) => {
    setSelectedHabitat(habitat);
    setFilters({ // Reseta filtros ao selecionar novo habitat
      sName: ".", 
      sType: ".", 
      sWeakness: ".",
      sAbility: ".",
      sHeight: ".",
      sWeight: ".",
      sHabitat: habitat.id, 
      sOrdering: ".", 
      sPage: 1 
    });
    setPokemonList([]);
    setHasMore(true);
    setShowAdvancedSearch(false);
  };

  // Função para voltar à lista de habitats
  const backToHabitats = () => {
    setSelectedHabitat(null);
    setPokemonList([]);
    setFilters({ sName: ".", sType: ".", sWeakness: ".", sAbility: ".", sHeight: ".", sWeight: ".", sHabitat: ".", sOrdering: ".", sPage: 1 });
  };

  // ----- Renderização -----

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pokeRed mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando habitats...</p>
        </div>
      </div>
    );
  }

  // Se um habitat foi selecionado, mostrar a lista de Pokémon e filtros
  if (selectedHabitat) {
    const habitatColor = selectedHabitat.color || 'bg-gray-500';
    const textColor = habitatColor.replace('bg-', 'text-');

    return (
      <div className="min-h-screen bg-white py-9 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Botão Voltar e Título */}
          <div className="flex items-center mb-6">
            <button 
              onClick={backToHabitats}
              className="mr-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
              aria-label="Voltar para a lista de habitats"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className={`text-3xl md:text-4xl font-bold ${textColor}`}>
              Habitat: {selectedHabitat.name}
            </h1>
          </div>
          
          {/* Descrição do Habitat */}
          <div className={`${habitatColor} text-white p-4 rounded-lg mb-8 shadow`}>
             <p>{selectedHabitat.description}</p>
          </div>

          {/* Barra de Filtros */}
          <div className="search-bar bg-gray-100 p-4 md:p-6 rounded-lg shadow-md mb-8">
            {/* Filtro por Nome */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-grow relative">
                <label htmlFor="pokemon-search" className="sr-only">Buscar por nome</label>
                <input 
                  id="pokemon-search"
                  type="text" 
                  name="sName" 
                  placeholder={`Buscar em ${selectedHabitat.name}...`} 
                  value={filters.sName}
                  onChange={updateFilters} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pokeRed focus:border-transparent"
                />
                {filters.sName && (
                  <button 
                    onClick={() => {
                      setFilters(prev => ({ ...prev, sName: ".", sPage: 1 }));
                      setPokemonList([]); setHasMore(true);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Limpar busca"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                     </svg>
                  </button>
                )}
              </div>
              <button 
                onClick={applyFilters} 
                className="bg-pokeRed text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center sm:w-auto w-full"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
                Buscar
              </button>
            </div>
            
            {/* Botão de Filtros Avançados */}
            <div className="text-right mb-4">
              <button 
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} 
                className="text-sm text-pokeRed hover:text-red-700 transition-colors flex items-center justify-end"
              >
                {showAdvancedSearch ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Ocultar filtros avançados
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Mostrar filtros avançados
                  </>
                )}
              </button>
            </div>

            {/* Filtros Avançados */}
            {showAdvancedSearch && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-300">
                 {/* Filtro Tipo */}
                 <div>
                   <label htmlFor="pokemon-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                   <select
                     id="pokemon-type"
                     name="sType"
                     value={filters.sType}
                     onChange={updateFilters}
                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed"
                   >
                     <option value=".">Todos</option>
                     {pokemonTypes.map(type => (
                       <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                     ))}
                   </select>
                 </div>
                 {/* Filtro Fraqueza */}
                 <div>
                   <label htmlFor="pokemon-weakness" className="block text-sm font-medium text-gray-700 mb-1">Fraqueza</label>
                   <select
                     id="pokemon-weakness"
                     name="sWeakness"
                     value={filters.sWeakness}
                     onChange={updateFilters}
                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed"
                   >
                     <option value=".">Todas</option>
                     {pokemonTypes.map(type => (
                       <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                     ))}
                   </select>
                 </div>
                 {/* Filtro Habilidade */}
                 <div>
                   <label htmlFor="pokemon-ability" className="block text-sm font-medium text-gray-700 mb-1">Habilidade</label>
                   <select
                     id="pokemon-ability"
                     name="sAbility"
                     value={filters.sAbility}
                     onChange={updateFilters}
                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed"
                   >
                     <option value=".">Todas</option>
                     {commonAbilities.map(ability => (
                       <option key={ability} value={ability}>
                         {ability.split(\'-\'').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(\' \')}
                       </option>
                     ))}
                   </select>
                 </div>
                 {/* Filtro Altura */}
                 <div>
                   <label htmlFor="pokemon-height" className="block text-sm font-medium text-gray-700 mb-1">Altura</label>
                   <select
                     id="pokemon-height"
                     name="sHeight"
                     value={filters.sHeight}
                     onChange={updateFilters}
                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed"
                   >
                     <option value=".">Qualquer</option>
                     <option value="small">Pequeno (&lt; 1m)</option>
                     <option value="medium">Médio (1m - 2m)</option>
                     <option value="large">Grande (&gt; 2m)</option>
                   </select>
                 </div>
                 {/* Filtro Peso */}
                 <div>
                   <label htmlFor="pokemon-weight" className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
                   <select
                     id="pokemon-weight"
                     name="sWeight"
                     value={filters.sWeight}
                     onChange={updateFilters}
                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed"
                   >
                     <option value=".">Qualquer</option>
                     <option value="light">Leve (&lt; 10kg)</option>
                     <option value="medium">Médio (10kg - 50kg)</option>
                     <option value="heavy">Pesado (&gt; 50kg)</option>
                   </select>
                 </div>
                 {/* Botões Limpar/Aplicar */}
                 <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-2 mt-2">
                   <button
                     onClick={resetFilters}
                     className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                   >
                     Limpar Filtros
                   </button>
                 </div>
              </div>
            )}
          </div>

          {/* Contagem e Ordenação */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-3 sm:mb-0">
              {!loading && pokemonList.length > 0 && (
                <p className="text-gray-600">
                  Exibindo {pokemonList.length} Pokémon
                </p>
              )}
            </div>
            <div className="flex items-center">
              <label htmlFor="pokemon-ordering" className="mr-2 text-gray-700">Organizar por</label>
              <select 
                id="pokemon-ordering"
                name="sOrdering" 
                value={filters.sOrdering}
                onChange={updateFilters} 
                className="p-2 rounded-lg border border-gray-300 bg-white"
              >
                <option value=".">Número (Padrão)</option>
                <option value="name">Nome (A-Z)</option>
                <option value="-name">Nome (Z-A)</option>
                <option value="height">Altura (Crescente)</option>
                <option value="-height">Altura (Decrescente)</option>
                <option value="weight">Peso (Crescente)</option>
                <option value="-weight">Peso (Decrescente)</option>
              </select>
            </div>
          </div>

          {/* Grid de Pokémon */}
          {loading && pokemonList.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pokeRed mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando Pokémon...</p>
            </div>
          ) : pokemonList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {pokemonList.map((pokemon, index) => {
                if (pokemonList.length === index + 1) {
                  return (
                    <div ref={lastPokemonElementRef} key={pokemon.id}>
                      <PokemonCard pokemon={pokemon} />
                    </div>
                  );
                } else {
                  return <PokemonCard key={pokemon.id} pokemon={pokemon} />;
                }
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">Nenhum Pokémon encontrado com os filtros aplicados.</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-pokeBlue text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          )}

          {/* Indicador de Carregamento da Rolagem Infinita */}
          {isLoadingMore && (
            <div className="text-center py-8">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pokeRed mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando mais Pokémon...</p>
            </div>
          )}

          {/* Mensagem de Fim da Lista */}
          {!hasMore && pokemonList.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Fim da lista de Pokémon para este habitat e filtros.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----- Renderização da Lista de Habitats (Inicial) -----
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Habitats de Pokémon</h1>
        <p className="text-lg text-gray-700 text-center mb-12">
          Clique em um habitat para ver todos os Pokémon correspondentes e aplicar filtros adicionais.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pokemonHabitats.map((habitat) => (
            <button 
              key={habitat.id}
              onClick={() => handleSelectHabitat(habitat)} // Passa o objeto habitat
              className="block w-full text-left transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pokeRed rounded-lg shadow-lg overflow-hidden cursor-pointer"
            >
              <div className={`${habitat.color} h-full`}>
                <div className="p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">{habitat.name}</h2>
                  <p className="mb-4">{habitat.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-semibold">Explorar habitat</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

