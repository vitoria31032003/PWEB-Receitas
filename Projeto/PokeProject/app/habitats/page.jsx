"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard';
import { fetchGames } from '../actions/gameActions';

// Lista de habitats de Pokémon
const pokemonHabitats = [
  { id: 1, name: "Caverna", color: "bg-typeRock", description: "Pokémon que vivem em cavernas e ambientes subterrâneos" },
  { id: 2, name: "Floresta", color: "bg-typeGrass", description: "Pokémon que habitam florestas densas e bosques" },
  { id: 3, name: "Montanha", color: "bg-typeGround", description: "Pokémon que vivem em regiões montanhosas e elevadas" },
  { id: 4, name: "Planície", color: "bg-typeNormal", description: "Pokémon que habitam campos abertos e planícies" },
  { id: 5, name: "Água doce", color: "bg-typeWater", description: "Pokémon que vivem em lagos, rios e outros corpos de água doce" },
  { id: 6, name: "Água salgada", color: "bg-typeWater", description: "Pokémon que habitam oceanos e mares" },
  { id: 7, name: "Urbano", color: "bg-typeSteel", description: "Pokémon que se adaptaram a viver em cidades e ambientes urbanos" },
  { id: 8, name: "Raro", color: "bg-typePsychic", description: "Pokémon raros que habitam locais específicos e difíceis de encontrar" },
  { id: 9, name: "Vulcânico", color: "bg-typeFire", description: "Pokémon que vivem em áreas vulcânicas e com alta temperatura" }
];

export default function HabitatsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedHabitat, setSelectedHabitat] = useState(null);
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
  
  // Carregar Pokémon quando um habitat é selecionado
  useEffect(() => {
    if (selectedHabitat) {
      setIsLoadingPokemon(true);
      setPokemonList([]);
      setPage(1);
      setHasMore(true);
      
      fetchGames({ sHabitat: selectedHabitat, sPage: 1 }).then((data) => {
        setPokemonList(data);
        setIsLoadingPokemon(false);
        
        if (data.length < 20) {
          setHasMore(false);
        }
      });
    }
  }, [selectedHabitat]);
  
  // Função para carregar mais Pokémon
  const loadMorePokemon = () => {
    if (!isLoadingPokemon && hasMore) {
      setIsLoadingPokemon(true);
      const nextPage = page + 1;
      
      fetchGames({ sHabitat: selectedHabitat, sPage: nextPage }).then((data) => {
        setPokemonList(prev => [...prev, ...data]);
        setPage(nextPage);
        setIsLoadingPokemon(false);
        
        if (data.length < 20) {
          setHasMore(false);
        }
      });
    }
  };
  
  // Função para voltar à lista de habitats
  const backToHabitats = () => {
    setSelectedHabitat(null);
    setPokemonList([]);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 flex justify-center items-center">
        <div className="text-center">
          <div className="pokeball-loading">
            <div className="pokeball-loading-inner"></div>
          </div>
          <p className="mt-4 text-gray-600">Carregando habitats de Pokémon...</p>
        </div>
      </div>
    );
  }
  
  // Se um habitat foi selecionado, mostrar a lista de Pokémon desse habitat
  if (selectedHabitat) {
    const habitatInfo = pokemonHabitats.find(h => h.id === selectedHabitat);
    const habitatColor = habitatInfo ? habitatInfo.color : 'bg-typeNormal';
    
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <button 
              onClick={backToHabitats}
              className="mr-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className={`text-4xl font-bold ${habitatColor.replace('bg-', 'text-')}`}>
              Habitat: {habitatInfo ? habitatInfo.name : `Habitat ${selectedHabitat}`}
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
                  <p className="text-gray-600">Nenhum Pokémon encontrado deste habitat.</p>
                  <button
                    onClick={backToHabitats}
                    className="mt-4 px-4 py-2 bg-pokeRed text-white rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Voltar para Habitats
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Mostrar a lista de habitats
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Habitats de Pokémon</h1>
        
        <p className="text-lg text-gray-700 text-center mb-12">
          Os Pokémon vivem em diversos habitats ao redor do mundo, cada um adaptado ao seu tipo e características.
          Clique em um habitat para ver todos os Pokémon que vivem nele.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pokemonHabitats.map((habitat) => (
            <div 
              key={habitat.id}
              onClick={() => setSelectedHabitat(habitat.id)}
              className="block transform transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className={`${habitat.color} rounded-lg shadow-lg overflow-hidden h-full`}>
                <div className="p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">Habitat: {habitat.name}</h2>
                  <p className="mb-4">{habitat.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Ver Pokémon deste habitat</span>
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
