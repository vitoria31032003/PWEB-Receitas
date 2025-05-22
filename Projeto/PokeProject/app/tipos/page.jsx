"use client";

import { useState, useEffect } from 'react';
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

export default function TiposPage() {
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoadingPokemon, setIsLoadingPokemon] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Carregar Pokémon quando um tipo é selecionado
  useEffect(() => {
    if (selectedType) {
      setIsLoadingPokemon(true);
      setPokemonList([]);
      setPage(1);
      setHasMore(true);
      
      fetchGames({ sType: selectedType, sPage: 1 }).then((data) => {
        setPokemonList(data);
        setIsLoadingPokemon(false);
        
        if (data.length < 20) {
          setHasMore(false);
        }
      });
    }
  }, [selectedType]);
  
  // Função para carregar mais Pokémon
  const loadMorePokemon = () => {
    if (!isLoadingPokemon && hasMore) {
      setIsLoadingPokemon(true);
      const nextPage = page + 1;
      
      fetchGames({ sType: selectedType, sPage: nextPage }).then((data) => {
        setPokemonList(prev => [...prev, ...data]);
        setPage(nextPage);
        setIsLoadingPokemon(false);
        
        if (data.length < 20) {
          setHasMore(false);
        }
      });
    }
  };
  
  // Função para voltar à lista de tipos
  const backToTypes = () => {
    setSelectedType(null);
    setPokemonList([]);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 flex justify-center items-center">
        <div className="text-center">
          <div className="pokeball-loading">
            <div className="pokeball-loading-inner"></div>
          </div>
          <p className="mt-4 text-gray-600">Carregando tipos de Pokémon...</p>
        </div>
      </div>
    );
  }
  
  // Se um tipo foi selecionado, mostrar a lista de Pokémon desse tipo
  if (selectedType) {
    const typeInfo = pokemonTypes.find(t => t.name === selectedType);
    const typeColor = typeInfo ? typeInfo.color : 'bg-typeNormal';
    
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <button 
              onClick={backToTypes}
              className="mr-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className={`text-4xl font-bold capitalize ${typeColor.replace('bg-', 'text-')}`}>
              Pokémon do tipo {selectedType}
            </h1>
          </div>
          
          {isLoadingPokemon && pokemonList.length === 0 ? (
            <div className="text-center py-12">
              <div className="pokeball-loading">
                <div className="pokeball-loading-inner"></div>
              </div>
              <p className="mt-4 text-gray-600">Carregando Pokémon...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {pokemonList.map((pokemon) => (
                  <PokemonCard key={pokemon.id} pokemon={pokemon} />
                ))}
              </div>
              
              {pokemonList.length > 0 && (
                <div className="mt-12 text-center">
                  {isLoadingPokemon ? (
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
              
              {pokemonList.length === 0 && !isLoadingPokemon && (
                <div className="text-center py-12">
                  <p className="text-gray-600">Nenhum Pokémon encontrado deste tipo.</p>
                  <button
                    onClick={backToTypes}
                    className="mt-4 px-4 py-2 bg-pokeRed text-white rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Voltar para Tipos
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Mostrar a lista de tipos
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Tipos de Pokémon</h1>
        
        <p className="text-lg text-gray-700 text-center mb-12">
          Cada Pokémon pertence a um ou dois tipos, que determinam suas fraquezas e resistências em batalha.
          Clique em um tipo para ver todos os Pokémon desse tipo.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {pokemonTypes.map((type) => (
            <div 
              key={type.name}
              onClick={() => setSelectedType(type.name)}
              className="block transform transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className={`${type.color} rounded-lg shadow-lg overflow-hidden h-full`}>
                <div className="p-6 text-white">
                  <h2 className="text-2xl font-bold capitalize mb-4">{type.name}</h2>
                  <p className="mb-4">
                    Pokémon do tipo {type.name} possuem características e habilidades únicas.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Ver todos os Pokémon</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
