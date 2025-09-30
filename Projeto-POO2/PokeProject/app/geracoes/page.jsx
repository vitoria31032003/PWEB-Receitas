"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard';
import { fetchPokemonByCategory } from '../actions/gameActions'; // Usar a função de categoria
import PokeballLoader from '../components/PokeballLoader'; // Importado

// Lista de gerações de Pokémon com descrições
const pokemonGenerations = [
  { id: 1, name: "Geração I", apiName: "generation-i", color: "bg-red-500", description: "Os primeiros 151 Pokémon, introduzidos em Kanto." },
  { id: 2, name: "Geração II", apiName: "generation-ii", color: "bg-yellow-500", description: "100 novos Pokémon introduzidos na região de Johto." },
  { id: 3, name: "Geração III", apiName: "generation-iii", color: "bg-green-500", description: "135 novos Pokémon da região de Hoenn." },
  { id: 4, name: "Geração IV", apiName: "generation-iv", color: "bg-blue-500", description: "107 novos Pokémon da região de Sinnoh." },
  { id: 5, name: "Geração V", apiName: "generation-v", color: "bg-indigo-500", description: "156 novos Pokémon da região de Unova." },
  { id: 6, name: "Geração VI", apiName: "generation-vi", color: "bg-purple-500", description: "72 novos Pokémon da região de Kalos, introduzindo o tipo Fada." },
  { id: 7, name: "Geração VII", apiName: "generation-vii", color: "bg-pink-500", description: "88 novos Pokémon da região de Alola, incluindo formas regionais." },
  { id: 8, name: "Geração VIII", apiName: "generation-viii", color: "bg-teal-500", description: "89 novos Pokémon da região de Galar, com formas Gigantamax." },
  { id: 9, name: "Geração IX", apiName: "generation-ix", color: "bg-orange-500", description: "Novos Pokémon introduzidos na região de Paldea." },
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

export default function GeracoesPage() {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [selectedGeneration, setSelectedGeneration] = useState(null); // Armazena o objeto da geração
  const [pokemonList, setPokemonList] = useState([]);
  const [filters, setFilters] = useState({ // Estado inicial dos filtros PADRONIZADO
    sName: '',
    sType: '',
    sWeakness: '',
    sAbility: '',
    sHeight: '',
    sWeight: '',
    sOrdering: '',
    sPage: 1
  });
  const [loading, setLoading] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Referência para o elemento de observação da rolagem infinita (mantido)
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
    // Simular carregamento inicial da lista de gerações (mantido)
    const timer = setTimeout(() => {
      setLoadingInitial(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Carregar Pokémon quando uma geração é selecionada ou filtros mudam (mantido)
  useEffect(() => {
    if (!selectedGeneration) return;

    setLoading(true);
    const fetchData = async () => {
      try {
        const result = await fetchPokemonByCategory('generation', selectedGeneration.apiName, filters);

        if (filters.sPage === 1) {
          setPokemonList(result.pokemon);
        } else {
          const newPokemon = result.pokemon.filter(newPoke =>
            !pokemonList.some(existingPoke => existingPoke.id === newPoke.id)
          );
          setPokemonList(prev => [...prev, ...newPokemon]);
        }
        setHasMore(result.hasMore);

      } catch (error) {
        console.error("Erro ao buscar Pokémon por geração:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchData();
  }, [selectedGeneration, filters]);

  // Atualiza os filtros (PADRONIZADO)
  const updateFilters = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value, sPage: 1 })); // Usa string vazia como padrão

    if (name === 'sName') {
      if (searchTimeout) clearTimeout(searchTimeout);
      if (value.length > 2 || value === '') {
          const newTimeout = setTimeout(() => {
            // A busca será acionada pelo useEffect
          }, 500);
          setSearchTimeout(newTimeout);
      }
    }
  };

  // Reseta os filtros (PADRONIZADO)
  const resetFilters = () => {
    setFilters({
      sName: '',
      sType: '',
      sWeakness: '',
      sAbility: '',
      sHeight: '',
      sWeight: '',
      sOrdering: '',
      sPage: 1
    });
  };

  // Aplica os filtros (PADRONIZADO)
  const applyFilters = () => {
    if (filters.sPage !== 1) {
        setFilters(prev => ({ ...prev, sPage: 1 }));
    } else {
        setFilters(prev => ({...prev})); // Força re-trigger do useEffect
    }
  };

  // Carrega mais Pokémon (PADRONIZADO)
  const loadMorePokemon = () => {
    if (!isLoadingMore && hasMore && !loading) {
      setIsLoadingMore(true);
      setFilters(prev => ({ ...prev, sPage: prev.sPage + 1 }));
    }
  };

  // Função para selecionar uma geração (PADRONIZADO)
  const handleSelectGeneration = (generation) => {
    setSelectedGeneration(generation);
    setFilters({ // Reseta filtros ao selecionar nova geração
      sName: '', sType: '', sWeakness: '', sAbility: '', sHeight: '', sWeight: '', sOrdering: '', sPage: 1
    });
    setPokemonList([]);
    setHasMore(true);
    setShowAdvancedSearch(false);
  };

  // Função para voltar à lista de gerações (PADRONIZADO)
  const backToGenerations = () => {
    setSelectedGeneration(null);
    setPokemonList([]);
    setFilters({ sName: '', sType: '', sWeakness: '', sAbility: '', sHeight: '', sWeight: '', sOrdering: '', sPage: 1 });
  };

  // ----- Renderização -----

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pokeRed mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando gerações...</p>
        </div>
      </div>
    );
  }

  // Se uma geração foi selecionada, mostrar a lista de Pokémon e filtros
  if (selectedGeneration) {
    const generationColor = selectedGeneration.color || 'bg-gray-500';
    const textColor = generationColor.replace('bg-', 'text-');

    return (
      <div className="min-h-screen bg-white py-9 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Botão Voltar e Título */}
          <div className="flex items-center mb-6">
            <button
              onClick={backToGenerations}
              className="mr-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
              aria-label="Voltar para a lista de gerações"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className={`text-3xl md:text-4xl font-bold ${textColor}`}>
              {selectedGeneration.name}
            </h1>
          </div>

          {/* Descrição da Geração */}
          <div className={`${generationColor} text-white p-4 rounded-lg mb-8 shadow`}>
             <p>{selectedGeneration.description}</p>
          </div>

          {/* Barra de Filtros (PADRONIZADO) */}
          <div className="search-bar bg-gray-100 p-4 md:p-6 rounded-lg shadow-md mb-8">
            {/* Filtro por Nome */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-grow relative">
                <label htmlFor="pokemon-search" className="sr-only">Buscar por nome</label>
                <input
                  id="pokemon-search"
                  type="text"
                  name="sName"
                  placeholder={`Buscar em ${selectedGeneration.name}...`}
                  value={filters.sName} // Usa o valor direto do estado
                  onChange={updateFilters}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pokeRed focus:border-transparent"
                />
                {filters.sName && (
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, sName: '', sPage: 1 }));
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    Ocultar filtros avançados
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    Mostrar filtros avançados
                  </>
                )}
              </button>
            </div>

            {/* Filtros Avançados (PADRONIZADO) */}
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
                     <option value="">Todos</option>
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
                     <option value="">Todas</option>
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
                     <option value="">Todas</option>
                     {commonAbilities.map(ability => (
                       <option key={ability} value={ability}>
                         {ability.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                     <option value="">Qualquer</option>
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
                     <option value="">Qualquer</option>
                     <option value="light">Leve (&lt; 10kg)</option>
                     <option value="medium">Médio (10kg - 50kg)</option>
                     <option value="heavy">Pesado (&gt; 50kg)</option>
                   </select>
                 </div>
                 {/* Botão Limpar */}
                 <div className="lg:col-span-1 flex items-end justify-end">
                    <button
                      onClick={resetFilters}
                      className="w-full md:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Limpar Filtros
                    </button>
                 </div>
              </div>
            )}
          </div>

          {/* Contagem e Ordenação (PADRONIZADO) */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-3 sm:mb-0">
              {!loading && pokemonList.length > 0 && (
                <p className="text-gray-600 text-sm">
                  Exibindo {pokemonList.length} Pokémon da {selectedGeneration.name}
                </p>
              )}
               {!loading && pokemonList.length === 0 && (
                 <p className="text-gray-600 text-sm">Nenhum Pokémon encontrado para os filtros selecionados.</p>
              )}
            </div>
            <div className="flex items-center">
              <label htmlFor="pokemon-ordering" className="mr-2 text-gray-700 text-sm">Organizar por:</label>
              <select
                id="pokemon-ordering"
                name="sOrdering"
                value={filters.sOrdering}
                onChange={updateFilters}
                className="p-2 text-sm rounded-lg border border-gray-300 focus:ring-pokeRed focus:border-pokeRed"
              >
                <option value="">Número (Crescente)</option>
                <option value="name">Nome (A-Z)</option>
                <option value="-name">Nome (Z-A)</option>
                <option value="height">Altura (Crescente)</option>
                <option value="-height">Altura (Decrescente)</option>
                <option value="weight">Peso (Crescente)</option>
                <option value="-weight">Peso (Decrescente)</option>
              </select>
            </div>
          </div>

          {/* Grid de Pokémon (PADRONIZADO) */}
          {loading && pokemonList.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pokeRed mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando Pokémon...</p>
            </div>
          ) : (
            <>
              {pokemonList.length > 0 ? (
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
                !loading && (
                  <div className="text-center py-12 text-gray-500">
                    <p>Nenhum Pokémon encontrado com os filtros selecionados para a {selectedGeneration.name}.</p>
                  </div>
                )
              )}

              {/* Indicador de Carregando Mais */}
              {isLoadingMore && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pokeRed mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Carregando mais...</p>
                </div>
              )}

              {/* Mensagem de Fim da Lista */}
              {!hasMore && pokemonList.length > 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Fim da lista de Pokémon da {selectedGeneration.name}.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Se nenhuma geração foi selecionada, mostrar a lista de gerações
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Explorar por Geração</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {pokemonGenerations.map((generation) => (
            <button
              key={generation.id}
              onClick={() => handleSelectGeneration(generation)}
              className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-white text-left flex flex-col justify-between h-40 ${generation.color}`}
            >
              <div>
                <h2 className="text-2xl font-bold mb-2 capitalize">{generation.name}</h2>
                <p className="text-sm opacity-90">{generation.description}</p>
              </div>
              <span className="mt-2 text-right font-semibold text-lg">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

