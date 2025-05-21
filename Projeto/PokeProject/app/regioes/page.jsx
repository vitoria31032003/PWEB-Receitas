"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard';
import { fetchGames } from '../actions/gameActions';

// Lista de regiões de Pokémon
const pokemonRegions = [
  { id: 1, name: "Kanto", color: "bg-pokeRed", games: "Vermelho, Azul, Verde, Amarelo, Let's Go", mainCity: "Cidade de Celadon" },
  { id: 2, name: "Johto", color: "bg-pokeBlue", games: "Ouro, Prata, Cristal, HeartGold, SoulSilver", mainCity: "Cidade de Goldenrod" },
  { id: 3, name: "Hoenn", color: "bg-typeGrass", games: "Rubi, Safira, Esmeralda, Omega Ruby, Alpha Sapphire", mainCity: "Cidade de Lilycove" },
  { id: 4, name: "Sinnoh", color: "bg-typeDragon", games: "Diamante, Pérola, Platina, Brilliant Diamond, Shining Pearl", mainCity: "Cidade de Jubilife" },
  { id: 5, name: "Unova", color: "bg-typeGround", games: "Preto, Branco, Preto 2, Branco 2", mainCity: "Cidade de Castelia" },
  { id: 6, name: "Kalos", color: "bg-typeFairy", games: "X, Y", mainCity: "Cidade de Lumiose" },
  { id: 7, name: "Alola", color: "bg-typeElectric", games: "Sol, Lua, Ultra Sol, Ultra Lua", mainCity: "Cidade de Hau'oli" },
  { id: 8, name: "Galar", color: "bg-typeFighting", games: "Espada, Escudo", mainCity: "Cidade de Wyndon" },
  { id: 9, name: "Paldea", color: "bg-typePsychic", games: "Escarlate, Violeta", mainCity: "Cidade de Mesagoza" }
];

export default function RegioesPage() {
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);
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
  
  // Carregar Pokémon quando uma região é selecionada
  useEffect(() => {
    if (selectedRegion) {
      setIsLoadingPokemon(true);
      setPokemonList([]);
      setPage(1);
      setHasMore(true);
      
      fetchGames({ sRegion: selectedRegion, sPage: 1 }).then((data) => {
        setPokemonList(data);
        setIsLoadingPokemon(false);
        
        if (data.length < 20) {
          setHasMore(false);
        }
      });
    }
  }, [selectedRegion]);
  
  // Função para carregar mais Pokémon
  const loadMorePokemon = () => {
    if (!isLoadingPokemon && hasMore) {
      setIsLoadingPokemon(true);
      const nextPage = page + 1;
      
      fetchGames({ sRegion: selectedRegion, sPage: nextPage }).then((data) => {
        setPokemonList(prev => [...prev, ...data]);
        setPage(nextPage);
        setIsLoadingPokemon(false);
        
        if (data.length < 20) {
          setHasMore(false);
        }
      });
    }
  };
  
  // Função para voltar à lista de regiões
  const backToRegions = () => {
    setSelectedRegion(null);
    setPokemonList([]);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 flex justify-center items-center">
        <div className="text-center">
          <div className="pokeball-loading">
            <div className="pokeball-loading-inner"></div>
          </div>
          <p className="mt-4 text-gray-600">Carregando regiões de Pokémon...</p>
        </div>
      </div>
    );
  }
  
  // Se uma região foi selecionada, mostrar a lista de Pokémon dessa região
  if (selectedRegion) {
    const regionInfo = pokemonRegions.find(r => r.id === selectedRegion);
    const regionColor = regionInfo ? regionInfo.color : 'bg-pokeRed';
    
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <button 
              onClick={backToRegions}
              className="mr-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className={`text-4xl font-bold ${regionColor.replace('bg-', 'text-')}`}>
              Região de {regionInfo ? regionInfo.name : `Região ${selectedRegion}`}
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
                  <p className="text-gray-600">Nenhum Pokémon encontrado desta região.</p>
                  <button
                    onClick={backToRegions}
                    className="mt-4 px-4 py-2 bg-pokeRed text-white rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Voltar para Regiões
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Mostrar a lista de regiões
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Regiões de Pokémon</h1>
        
        <p className="text-lg text-gray-700 text-center mb-12">
          O mundo Pokémon é dividido em várias regiões, cada uma com sua própria cultura, geografia e Pokémon nativos.
          Clique em uma região para ver todos os Pokémon dessa região.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pokemonRegions.map((region) => (
            <div 
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className="block transform transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className={`${region.color} rounded-lg shadow-lg overflow-hidden h-full`}>
                <div className="p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">Região de {region.name}</h2>
                  <div className="mb-4">
                    <p className="mb-1">Jogos: {region.games}</p>
                    <p>Cidade Principal: {region.mainCity}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Ver Pokémon desta região</span>
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
