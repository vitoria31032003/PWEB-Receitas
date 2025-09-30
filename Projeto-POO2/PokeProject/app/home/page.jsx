"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import PokemonCard from '../components/PokemonCard';
import { pokemonBloc } from '../../src/bloc/pokemon-bloc';
import PokeballLoader from '../components/PokeballLoader';

export default function HomePage() {
  const [blocState, setBlocState] = useState(pokemonBloc.state);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = pokemonBloc.subscribe(setBlocState);
    if (blocState.pokemonList.length === 0) {
      pokemonBloc.fetchPokemon();
    }
    pokemonBloc.loadAbilities();
    return () => unsubscribe();
  }, []);

  const { pokemonList, filters, loading, isLoadingMore, hasMore, abilities } = blocState;

  const observer = useRef();
  const lastPokemonElementRef = useCallback(node => {
    if (loading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        pokemonBloc.loadMorePokemon();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isLoadingMore, hasMore]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const filterValue = value === "" ? "." : value;
    pokemonBloc.setFilters({ [name]: filterValue });
  };

  const applySearch = () => {
    pokemonBloc.setFilters({ sName: searchInputRef.current.value || "." });
  };
  
  const resetFilters = () => {
    pokemonBloc.resetFilters();
    if(searchInputRef.current) {
        searchInputRef.current.value = "";
    }
  };
  
  const getRandomPokemon = () => {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    pokemonBloc.setFilters({ sName: randomId.toString() });
  };

  const pokemonTypes = ["normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
  const commonAbilities = abilities.map(a => a.name);
  const capitalize = (s) => s ? s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';


  if (loading && filters.sPage === 1 && pokemonList.length === 0) {
    return <PokeballLoader />;
  }

  return (
    <div className="min-h-screen py-9 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Pokédex</h1>

        <div className="search-bar bg-gray-100 p-4 md:p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                    ref={searchInputRef}
                    type="text"
                    name="sName"
                    placeholder="Buscar por nome ou número..."
                    defaultValue={filters.sName === "." ? "" : filters.sName}
                    onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pokeRed focus:border-transparent"
                />
                <button
                    onClick={applySearch}
                    className="bg-pokeRed text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center sm:w-auto w-full"
                >
                    Buscar
                </button>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
                <button
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className="text-sm text-pokeRed hover:text-red-700 transition-colors"
                >
                    {showAdvancedSearch ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'}
                </button>
                <button
                    onClick={getRandomPokemon}
                    className="bg-pokeBlue text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors mt-2 sm:mt-0"
                >
                    Surpreenda-me!
                </button>
            </div>

            {showAdvancedSearch && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-300">
                {/* Filtro Tipo */}
                <div>
                  <label htmlFor="pokemon-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select id="pokemon-type" name="sType" value={filters.sType} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed">
                    <option value=".">Todos</option>
                    {pokemonTypes.map(type => (
                      <option key={type} value={type}>{capitalize(type)}</option>
                    ))}
                  </select>
                </div>
                
                {/* Filtro Habilidade */}
                <div>
                  <label htmlFor="pokemon-ability" className="block text-sm font-medium text-gray-700 mb-1">Habilidade</label>
                  <select id="pokemon-ability" name="sAbility" value={filters.sAbility} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed">
                    <option value=".">Todas</option>
                    {commonAbilities.map(ability => (
                      <option key={ability} value={ability}>{capitalize(ability)}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro Altura */}
                <div>
                  <label htmlFor="pokemon-height" className="block text-sm font-medium text-gray-700 mb-1">Altura</label>
                  <select id="pokemon-height" name="sHeight" value={filters.sHeight} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed">
                    <option value=".">Qualquer</option>
                    <option value="small">Pequeno (&lt; 1m)</option>
                    <option value="medium">Médio (1m - 2m)</option>
                    <option value="large">Grande (&gt; 2m)</option>
                  </select>
                </div>

                {/* Filtro Peso */}
                <div>
                  <label htmlFor="pokemon-weight" className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
                  <select id="pokemon-weight" name="sWeight" value={filters.sWeight} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed">
                    <option value=".">Qualquer</option>
                    <option value="light">Leve (&lt; 10kg)</option>
                    <option value="medium">Médio (10kg - 50kg)</option>
                    <option value="heavy">Pesado (&gt; 50kg)</option>
                  </select>
                </div>

                {/* Filtro Fraqueza */}
                <div>
                  <label htmlFor="pokemon-weakness" className="block text-sm font-medium text-gray-700 mb-1">Fraqueza</label>
                  <select 
                    id="pokemon-weakness" 
                    name="sWeakness" 
                    value={filters.sWeakness} 
                    onChange={handleFilterChange} 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-pokeRed focus:border-pokeRed"
                  >
                    <option value=".">Todas</option>
                    {pokemonTypes.map(type => (
                      <option key={type} value={type}>{capitalize(type)}</option>
                    ))}
                  </select>
                </div>

                {/* Botão Limpar */}
                <div className="flex items-end justify-end">
                  <button onClick={resetFilters} className="w-full md:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
                    Limpar Filtros
                  </button>
                </div>
              </div>
            )}
        </div>
        
        {loading && pokemonList.length > 0 && filters.sPage === 1 ? (
          <div className="text-center text-sm text-gray-500 py-4">Atualizando lista...</div>
        ) : null}

        {!loading && pokemonList.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">Nenhum Pokémon encontrado.</p>
            <p className="text-gray-400 text-sm mt-2">Tente ajustar seus filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {pokemonList.map((pokemon, index) => (
              <div key={pokemon.id} ref={pokemonList.length === index + 1 ? lastPokemonElementRef : null}>
                <PokemonCard pokemon={pokemon} />
              </div>
            ))}
          </div>
        )}

        {isLoadingMore && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pokeBlue mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Carregando mais Pokémon...</p>
          </div>
        )}
      </div>
    </div>
  );
}