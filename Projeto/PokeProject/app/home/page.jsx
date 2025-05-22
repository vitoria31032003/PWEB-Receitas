"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchGames } from '../actions/gameActions';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard';

export default function HomePage() {
  const [games, setGames] = useState([]);
  const [filters, setFilters] = useState({ 
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
  const [totalCount, setTotalCount] = useState(0);
  
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

  // Lista de tipos de Pokémon
  const pokemonTypes = [
    "normal", "fire", "water", "grass", "electric", "ice", "fighting", 
    "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", 
    "dragon", "dark", "steel", "fairy"
  ];

  // Lista de habilidades comuns
  const commonAbilities = [
    "overgrow", "blaze", "torrent", "shield-dust", "shed-skin", "compound-eyes",
    "swarm", "keen-eye", "run-away", "intimidate", "static", "sand-veil", 
    "lightning-rod", "levitate", "chlorophyll", "effect-spore", "synchronize",
    "clear-body", "natural-cure", "serene-grace", "swift-swim", "battle-armor"
  ];

  // Atualiza os filtros com debounce para busca por nome
  const updateFilters = (event) => {
    const { name, value } = event.target;
    
    setFilters((prev) => ({ ...prev, [name]: value }));
    
    // Se for o campo de busca por nome, aplicar debounce
    if (name === 'sName' && value.length > 2) {
      if (searchTimeout) clearTimeout(searchTimeout);
      const newTimeout = setTimeout(() => {
        applyFilters();
      }, 500);
      setSearchTimeout(newTimeout);
    }
  };

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
    setGames([]);
    setHasMore(true);
  };

  const applyFilters = () => {
    setGames([]);
    setFilters(prev => ({ ...prev, sPage: 1 }));
    setHasMore(true);
    setLoading(true);
  };

  useEffect(() => { 
    const fetchData = async () => {
      try {
        const data = await fetchGames(filters);
        
        if (filters.sPage === 1) {
          setGames(data);
          // Estimar o total baseado no número de resultados
          setTotalCount(data.length >= 40 ? 898 : data.length);
        } else {
          // Garantir que não haja duplicatas ao carregar mais
          const newPokemon = data.filter(newPoke => 
            !games.some(existingPoke => existingPoke.id === newPoke.id)
          );
          setGames(prev => [...prev, ...newPokemon]);
        }
        
        // Se retornou menos itens que o esperado, provavelmente não há mais para carregar
        if (data.length < 40) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Erro ao buscar Pokémon:", error);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    };
    
    fetchData();
  }, [filters]);

  const loadMorePokemon = () => {
    if (!isLoadingMore && hasMore && !loading) {
      setIsLoadingMore(true);
      setFilters(prev => ({ ...prev, sPage: prev.sPage + 1 }));
    }
  };

  const getRandomPokemon = () => {
    // Gerar um número aleatório entre 1 e 898 (total de Pokémon na API)
    const randomId = Math.floor(Math.random() * 898) + 1;
    setFilters({ 
      sName: randomId.toString(), 
      sType: '',
      sWeakness: '',
      sAbility: '',
      sHeight: '',
      sWeight: '',
      sOrdering: '', 
      sPage: 1 
    });
    setLoading(true);
  };

  return (
    <div className="min-h-screen py-9 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Pokédex</h1>
        
        <div className="search-bar bg-gray-100 p-6 rounded-lg shadow-md mb-8">
          <label htmlFor="pokemon-search" className="block text-xl mb-2 font-semibold">Nome ou número</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow relative">
              <input 
                id="pokemon-search"
                type="text" 
                name="sName" 
                placeholder="Buscar Pokémon" 
                value={filters.sName} 
                onChange={updateFilters} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pokeRed focus:border-transparent"
              />
              {filters.sName && (
                <button 
                  onClick={() => {
                    setFilters(prev => ({ ...prev, sName: '' }));
                    applyFilters();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <button 
              onClick={applyFilters} 
              className="bg-pokeRed text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
            <button 
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} 
              className="text-sm text-pokeRed hover:text-red-700 transition-colors flex items-center"
            >
              {showAdvancedSearch ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Ocultar pesquisa avançada
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Mostrar pesquisa avançada
                </>
              )}
            </button>
            <button 
              onClick={getRandomPokemon} 
              className="mt-2 sm:mt-0 bg-pokeBlue text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Surpreenda-me!
            </button>
          </div>
          
          {showAdvancedSearch && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-300">
              <div>
                <label htmlFor="pokemon-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  id="pokemon-type"
                  name="sType"
                  value={filters.sType}
                  onChange={(e) => {
                    updateFilters(e);
                    // Aplicar filtro automaticamente ao selecionar
                    setTimeout(() => applyFilters(), 100);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed"
                >
                  <option value="">Todos os tipos</option>
                  {pokemonTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="pokemon-weakness" className="block text-sm font-medium text-gray-700 mb-1">Fraqueza</label>
                <select
                  id="pokemon-weakness"
                  name="sWeakness"
                  value={filters.sWeakness}
                  onChange={(e) => {
                    updateFilters(e);
                    // Aplicar filtro automaticamente ao selecionar
                    setTimeout(() => applyFilters(), 100);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed"
                >
                  <option value="">Todas as fraquezas</option>
                  {pokemonTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="pokemon-ability" className="block text-sm font-medium text-gray-700 mb-1">Habilidade</label>
                <select
                  id="pokemon-ability"
                  name="sAbility"
                  value={filters.sAbility}
                  onChange={(e) => {
                    updateFilters(e);
                    // Aplicar filtro automaticamente ao selecionar
                    setTimeout(() => applyFilters(), 100);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed"
                >
                  <option value="">Todas as habilidades</option>
                  {commonAbilities.map(ability => (
                    <option key={ability} value={ability}>
                      {ability.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="pokemon-height" className="block text-sm font-medium text-gray-700 mb-1">Altura</label>
                <select
                  id="pokemon-height"
                  name="sHeight"
                  value={filters.sHeight}
                  onChange={(e) => {
                    updateFilters(e);
                    // Aplicar filtro automaticamente ao selecionar
                    setTimeout(() => applyFilters(), 100);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed"
                >
                  <option value="">Qualquer altura</option>
                  <option value="small">Pequeno (menos de 1m)</option>
                  <option value="medium">Médio (1m a 2m)</option>
                  <option value="large">Grande (mais de 2m)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="pokemon-weight" className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
                <select
                  id="pokemon-weight"
                  name="sWeight"
                  value={filters.sWeight}
                  onChange={(e) => {
                    updateFilters(e);
                    // Aplicar filtro automaticamente ao selecionar
                    setTimeout(() => applyFilters(), 100);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed"
                >
                  <option value="">Qualquer peso</option>
                  <option value="light">Leve (menos de 10kg)</option>
                  <option value="medium">Médio (10kg a 50kg)</option>
                  <option value="heavy">Pesado (mais de 50kg)</option>
                </select>
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Limpar Filtros
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-pokeRed text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-3 sm:mb-0">
            {!loading && games.length > 0 && (
              <p className="text-gray-600">
                Exibindo {games.length} {games.length === 1 ? 'Pokémon' : 'Pokémons'}
                {totalCount > games.length ? ` de aproximadamente ${totalCount}` : ''}
              </p>
            )}
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-gray-700">Organizar por</span>
            <select 
              name="sOrdering" 
              value={filters.sOrdering} 
              onChange={(e) => {
                updateFilters(e);
                // Aplicar ordenação automaticamente
                setTimeout(() => applyFilters(), 100);
              }} 
              className="p-2 rounded-lg border border-gray-300"
            >
              <option value="">Menor número primeiro</option>
              <option value="name">Nome (A-Z)</option>
              <option value="-name">Nome (Z-A)</option>
              <option value="height">Altura (Crescente)</option>
              <option value="-height">Altura (Decrescente)</option>
              <option value="weight">Peso (Crescente)</option>
              <option value="-weight">Peso (Decrescente)</option>
            </select>
          </div>
        </div>
        
        {loading && games.length === 0 ? (
          <div className="text-center py-12">
            <div className="pokeball-loading">
              <div className="pokeball-loading-inner"></div>
            </div>
            <p className="mt-4 text-gray-600">Carregando Pokémon...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {games.map((pokemon, index) => {
                // Adicionar ref ao último elemento para rolagem infinita
                if (games.length === index + 1) {
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
            
            {games.length > 0 && (
              <div className="mt-12 text-center">
                {isLoadingMore ? (
                  <div className="inline-block">
                    <div className="pokeball-loading-small">
                      <div className="pokeball-loading-inner-small"></div>
                    </div>
                    <p className="mt-2 text-gray-600">Carregando mais Pokémon...</p>
                  </div>
                ) : hasMore ? (
                  <button 
                    onClick={loadMorePokemon} 
                    className="bg-pokeRed text-white px-8 py-3 rounded-full hover:bg-opacity-90 transition-colors shadow-md"
                  >
                    Carregar mais Pokémon
                  </button>
                ) : (
                  <p className="text-gray-600">Não há mais Pokémon para carregar.</p>
                )}
              </div>
            )}
            
            {games.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-600">Nenhum Pokémon encontrado com os filtros selecionados.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-pokeRed text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
