"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard';
import { fetchGames } from '../actions/gameActions';

// Lista de gerações de Pokémon
const pokemonGenerations = [
  { id: 1, name: "Geração I", region: "Kanto", color: "bg-pokeRed", years: "1996-1999", count: 151 },
  { id: 2, name: "Geração II", region: "Johto", color: "bg-pokeBlue", years: "1999-2002", count: 100 },
  { id: 3, name: "Geração III", region: "Hoenn", color: "bg-typeGrass", years: "2002-2006", count: 135 },
  { id: 4, name: "Geração IV", region: "Sinnoh", color: "bg-typeDragon", years: "2006-2010", count: 107 },
  { id: 5, name: "Geração V", region: "Unova", color: "bg-typeGround", years: "2010-2013", count: 156 },
  { id: 6, name: "Geração VI", region: "Kalos", color: "bg-typeFairy", years: "2013-2016", count: 72 },
  { id: 7, name: "Geração VII", region: "Alola", color: "bg-typeElectric", years: "2016-2019", count: 88 },
  { id: 8, name: "Geração VIII", region: "Galar", color: "bg-typeFighting", years: "2019-2022", count: 89 },
  { id: 9, name: "Geração IX", region: "Paldea", color: "bg-typePsychic", years: "2022-presente", count: 103 }
];

export default function GeracoesPage() {
  const [loading, setLoading] = useState(true);
  const [selectedGeneration, setSelectedGeneration] = useState(null);
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
  
  // Carregar Pokémon quando uma geração é selecionada
  useEffect(() => {
    if (selectedGeneration) {
      setIsLoadingPokemon(true);
      setPokemonList([]);
      setPage(1);
      setHasMore(true);
      
      fetchGames({ sGeneration: selectedGeneration, sPage: 1 }).then((data) => {
        setPokemonList(data);
        setIsLoadingPokemon(false);
        
        if (data.length < 20) {
          setHasMore(false);
        }
      });
    }
  }, [selectedGeneration]);
  
  // Função para carregar mais Pokémon
  const loadMorePokemon = () => {
    if (!isLoadingPokemon && hasMore) {
      setIsLoadingPokemon(true);
      const nextPage = page + 1;
      
      fetchGames({ sGeneration: selectedGeneration, sPage: nextPage }).then((data) => {
        setPokemonList(prev => [...prev, ...data]);
        setPage(nextPage);
        setIsLoadingPokemon(false);
        
        if (data.length < 20) {
          setHasMore(false);
        }
      });
    }
  };
  
  // Função para voltar à lista de gerações
  const backToGenerations = () => {
    setSelectedGeneration(null);
    setPokemonList([]);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 flex justify-center items-center">
        <div className="text-center">
          <div className="pokeball-loading">
            <div className="pokeball-loading-inner"></div>
          </div>
          <p className="mt-4 text-gray-600">Carregando gerações de Pokémon...</p>
        </div>
      </div>
    );
  }
  
  // Se uma geração foi selecionada, mostrar a lista de Pokémon dessa geração
  if (selectedGeneration) {
    const generationInfo = pokemonGenerations.find(g => g.id === selectedGeneration);
    const generationColor = generationInfo ? generationInfo.color : 'bg-pokeRed';
    
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <button 
              onClick={backToGenerations}
              className="mr-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className={`text-4xl font-bold ${generationColor.replace('bg-', 'text-')}`}>
              {generationInfo ? generationInfo.name : `Geração ${selectedGeneration}`}
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
                  <p className="text-gray-600">Nenhum Pokémon encontrado desta geração.</p>
                  <button
                    onClick={backToGenerations}
                    className="mt-4 px-4 py-2 bg-pokeRed text-white rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Voltar para Gerações
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Mostrar a lista de gerações
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Gerações de Pokémon</h1>
        
        <p className="text-lg text-gray-700 text-center mb-12">
          Os Pokémon são organizados em gerações, cada uma introduzindo novos Pokémon, regiões e mecânicas de jogo.
          Clique em uma geração para ver todos os Pokémon dessa geração.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pokemonGenerations.map((gen) => (
            <div 
              key={gen.id}
              onClick={() => setSelectedGeneration(gen.id)}
              className="block transform transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className={`${gen.color} rounded-lg shadow-lg overflow-hidden h-full`}>
                <div className="p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">{gen.name}</h2>
                  <h3 className="text-xl mb-4">Região de {gen.region}</h3>
                  <div className="mb-4">
                    <p className="mb-1">Anos: {gen.years}</p>
                    <p>Total de Pokémon: {gen.count}</p>
                  </div>
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
