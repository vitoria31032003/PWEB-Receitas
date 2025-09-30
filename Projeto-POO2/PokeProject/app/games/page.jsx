"use client";

import { useState, useEffect } from 'react';
import { fetchGames } from '../actions/gameActions';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard';

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [filters, setFilters] = useState({ sName: '', sDates: '', sOrdering: '', sPage: 1 });
  const [loading, setLoading] = useState(false);

  const updateFilters = (event) => setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));

useEffect(() => {
  setLoading(true);
  fetchGames(filters).then((data) => {
    // Ao carregar mais, adicione os novos Pokémon à lista existente
    if (filters.sPage > 1) {
      setGames(prevGames => [...prevGames, ...data.pokemon]);
    } else {
      setGames(data.pokemon || []); // Garante que games seja sempre um array
    }
    setLoading(false);
  });
}, [filters.sName, filters.sOrdering, filters.sPage]); 

  const loadMorePokemon = () => {
    setFilters(prev => ({ ...prev, sPage: prev.sPage + 1 }));
  };

  const getRandomPokemon = () => {
    // Gerar um número aleatório entre 1 e 898 (total de Pokémon na API)
    const randomId = Math.floor(Math.random() * 898) + 1;
    setFilters({ sName: randomId.toString(), sDates: '', sOrdering: '', sPage: 1 });
  };

  return (
    <div className="min-h-screen py-9 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">Pokédex</h1>
      
      <div className="search-bar max-w-4xl mx-auto">
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
              className="search-input w-full"
            />
          </div>
          <button 
            onClick={() => setFilters(prev => ({ ...prev, sName: prev.sName }))} 
            className="search-button flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm mb-2 sm:mb-0">
            Use a pesquisa avançada para explorar Pokémon por tipo, fraqueza, habilidade e mais!
          </p>
          <button 
            onClick={getRandomPokemon} 
            className="surprise-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Surpreenda-me!
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end max-w-7xl mx-auto">
        <div className="flex items-center">
          <span className="mr-2 text-gray-700">Organizar por</span>
          <select 
            name="sOrdering" 
            value={filters.sOrdering} 
            onChange={updateFilters} 
            className="p-2 rounded-lg border border-gray-300"
          >
            <option value="">Menor número primeiro</option>
            <option value="name">Nome (A-Z)</option>
            <option value="-name">Nome (Z-A)</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pokeRed"></div>
          <p className="mt-2 text-gray-600">Carregando Pokémon...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto mt-8">
            {games.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>
          
          {games.length > 0 && (
            <div className="mt-12 text-center">
              <button 
                onClick={loadMorePokemon} 
                className="load-more-button"
              >
                Carregar mais Pokémon
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
