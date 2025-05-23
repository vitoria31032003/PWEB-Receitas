"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard';
import { fetchGames } from '../actions/gameActions';

// Lista de tipos de Pokémon com cores
const pokemonTypes = [
  { name: "normal", color: "bg-typeNormal" },
  { name: "fire", color: "bg-typeFire" },
  { name: "water", color: "bg-typeWater" },
  { name: "grass", color: "bg-typeGrass" },
  { name: "electric", color: "bg-typeElectric" },
  { name: "ice", color: "bg-typeIce" },
  { name: "fighting", color: "bg-typeFighting" },
  { name: "poison", color: "bg-typePoison" },
  { name: "ground", color: "bg-typeGround" },
  { name: "flying", color: "bg-typeFlying" },
  { name: "psychic", color: "bg-typePsychic" },
  { name: "bug", color: "bg-typeBug" },
  { name: "rock", color: "bg-typeRock" },
  { name: "ghost", color: "bg-typeGhost" },
  { name: "dragon", color: "bg-typeDragon" },
  { name: "dark", color: "bg-typeDark" },
  { name: "steel", color: "bg-typeSteel" },
  { name: "fairy", color: "bg-typeFairy" }
];

// Lista de habilidades comuns (pode ser expandida ou carregada da API)
const commonAbilities = [
  "overgrow", "blaze", "torrent", "shield-dust", "shed-skin", "compound-eyes",
  "swarm", "keen-eye", "run-away", "intimidate", "static", "sand-veil", 
  "lightning-rod", "levitate", "chlorophyll", "effect-spore", "synchronize",
  "clear-body", "natural-cure", "serene-grace", "swift-swim", "battle-armor"
];

export default function TiposPage() {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [pokemonList, setPokemonList] = useState([]);
  const [filters, setFilters] = useState({ 
    sName: '', 
    sType: '', // Será definido quando um tipo for selecionado
    sWeakness: '',
    sAbility: '',
    sHeight: '',
    sWeight: '',
    sOrdering: '', 
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
    // Simular carregamento inicial da lista de tipos
    const timer = setTimeout(() => {
      setLoadingInitial(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Carregar Pokémon quando um tipo é selecionado ou filtros mudam
  useEffect(() => {
    if (!selectedType) return; // Não busca se nenhum tipo está selecionado

    const fetchData = async () => {
      setLoading(true); // Indica carregamento de busca/filtro
      setIsLoadingMore(false); // Reseta loading de rolagem
      try {
        const currentFilters = { ...filters, sType: selectedType }; // Garante que o tipo selecionado está no filtro
        const data = await fetchGames(currentFilters);
        
        if (currentFilters.sPage === 1) {
          setPokemonList(data);
          // Estimar total (PokeAPI não fornece total filtrado facilmente)
          setTotalCount(data.length);
        } else {
          // Adiciona novos Pokémon, evitando duplicatas
          const newPokemon = data.filter(newPoke => 
            !pokemonList.some(existingPoke => existingPoke.id === newPoke.id)
          );
          setPokemonList(prev => [...prev, ...newPokemon]);
        }
        
        // Verifica se há mais Pokémon para carregar
        // A API retorna no máximo 40 por página (definido em fetchGames)
        if (data.length < 40) {
          setHasMore(false);
        } else {
          setHasMore(true); // Assume que pode haver mais se recebeu o limite
        }

      } catch (error) {
        console.error("Erro ao buscar Pokémon:", error);
        setHasMore(false); // Assume que não há mais em caso de erro
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    };
    
    fetchData();
  }, [selectedType, filters]); // Re-executa quando o tipo ou filtros mudam

  // Atualiza os filtros com debounce para busca por nome
  const updateFilters = (event) => {
    const { name, value } = event.target;
    
    setFilters((prev) => ({ ...prev, [name]: value, sPage: 1 })); // Reseta página ao mudar filtro
    
    if (name === 'sName') {
      if (searchTimeout) clearTimeout(searchTimeout);
      const newTimeout = setTimeout(() => {
        // A busca já é reativada pelo useEffect dependente de 'filters'
      }, 500);
      setSearchTimeout(newTimeout);
    } else {
       // Aplica imediatamente para outros filtros (selects)
       // O useEffect já cuida disso
    }
  };

  const resetFilters = () => {
    setFilters({ 
      sName: '', 
      sType: selectedType, // Mantém o tipo selecionado
      sWeakness: '',
      sAbility: '',
      sHeight: '',
      sWeight: '',
      sOrdering: '', 
      sPage: 1 
    });
    setPokemonList([]); // Limpa a lista para nova busca
    setHasMore(true);
    setShowAdvancedSearch(false);
  };

  const applyFilters = () => {
    // Trigger useEffect ao resetar a página para 1
    setFilters(prev => ({ ...prev, sPage: 1 }));
    setPokemonList([]); // Limpa a lista para feedback visual
    setHasMore(true);
  };

  const loadMorePokemon = () => {
    if (!isLoadingMore && hasMore && !loading) {
      setIsLoadingMore(true);
      setFilters(prev => ({ ...prev, sPage: prev.sPage + 1 }));
    }
  };

  // Função para selecionar um tipo
  const handleSelectType = (typeName) => {
    setSelectedType(typeName);
    setFilters({ // Reseta filtros ao selecionar novo tipo
      sName: '', 
      sType: typeName, 
      sWeakness: '',
      sAbility: '',
      sHeight: '',
      sWeight: '',
      sOrdering: '', 
      sPage: 1 
    });
    setPokemonList([]); // Limpa lista anterior
    setHasMore(true);
    setShowAdvancedSearch(false);
  };

  // Função para voltar à lista de tipos
  const backToTypes = () => {
    setSelectedType(null);
    setPokemonList([]);
    setFilters({ sName: '', sType: '', sWeakness: '', sAbility: '', sHeight: '', sWeight: '', sOrdering: '', sPage: 1 });
  };

  // ----- Renderização -----

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 flex justify-center items-center">
        <div className="text-center">
          {/* Substituir por LoadingAnimation se disponível */}
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pokeRed mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando tipos...</p>
        </div>
      </div>
    );
  }

  // Se um tipo foi selecionado, mostrar a lista de Pokémon e filtros
  if (selectedType) {
    const typeInfo = pokemonTypes.find(t => t.name === selectedType);
    const typeColor = typeInfo ? typeInfo.color : 'bg-gray-500'; // Cor padrão
    const textColor = typeInfo ? typeColor.replace('bg-', 'text-') : 'text-gray-800';

    return (
      <div className="min-h-screen bg-white py-9 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Botão Voltar e Título */}
          <div className="flex items-center mb-6">
            <button 
              onClick={backToTypes}
              className="mr-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
              aria-label="Voltar para a lista de tipos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className={`text-3xl md:text-4xl font-bold capitalize ${textColor}`}>
              Pokémon do tipo {selectedType}
            </h1>
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
                  placeholder={`Buscar em ${selectedType}...`} 
                  value={filters.sName} 
                  onChange={updateFilters} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pokeRed focus:border-transparent"
                />
                {filters.sName && (
                  <button 
                    onClick={() => {
                      setFilters(prev => ({ ...prev, sName: '', sPage: 1 }));
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
                      <option key={type.name} value={type.name}>{type.name.charAt(0).toUpperCase() + type.name.slice(1)}</option>
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
                {/* Botões Limpar/Aplicar */}
                <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-2 mt-2">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                  {/* O botão Aplicar pode ser removido se a atualização for automática */}
                  {/* <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-pokeRed text-white rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Aplicar Filtros
                  </button> */}
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
                  {/* A contagem total exata filtrada é difícil de obter da PokeAPI */}
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
                <option value="">Número (Padrão)</option>
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
                // Aplica a ref ao último elemento para o IntersectionObserver
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
            // Mensagem se nenhum Pokémon for encontrado após a busca/filtro
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
              <p className="text-gray-600">Fim da lista de Pokémon para este tipo e filtros.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----- Renderização da Lista de Tipos (Inicial) -----
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Tipos de Pokémon</h1>
        <p className="text-lg text-gray-700 text-center mb-12">
          Clique em um tipo para ver todos os Pokémon correspondentes e aplicar filtros adicionais.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {pokemonTypes.map((type) => (
            <button 
              key={type.name}
              onClick={() => handleSelectType(type.name)}
              className="block w-full text-left transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pokeRed rounded-lg shadow-lg overflow-hidden cursor-pointer"
            >
              <div className={`${type.color} h-full`}>
                <div className="p-6 text-white">
                  <h2 className="text-2xl font-bold capitalize mb-4">{type.name}</h2>
                  <p className="mb-4">
                    Pokémon do tipo {type.name}.
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-semibold">Explorar tipo</span>
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

