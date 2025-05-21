"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard';
import { fetchGames } from '../actions/gameActions';

// Lista de habilidades de Pokémon
const pokemonAbilities = [
  { id: "overgrow", name: "Overgrow", color: "bg-typeGrass", description: "Aumenta o poder de movimentos do tipo Grama quando o HP está baixo" },
  { id: "blaze", name: "Blaze", color: "bg-typeFire", description: "Aumenta o poder de movimentos do tipo Fogo quando o HP está baixo" },
  { id: "torrent", name: "Torrent", color: "bg-typeWater", description: "Aumenta o poder de movimentos do tipo Água quando o HP está baixo" },
  { id: "shield-dust", name: "Shield Dust", color: "bg-typeBug", description: "Bloqueia os efeitos adicionais dos ataques recebidos" },
  { id: "compound-eyes", name: "Compound Eyes", color: "bg-typeBug", description: "Aumenta a precisão dos movimentos" },
  { id: "static", name: "Static", color: "bg-typeElectric", description: "Pode paralisar o oponente ao contato físico" },
  { id: "lightning-rod", name: "Lightning Rod", color: "bg-typeElectric", description: "Atrai movimentos elétricos e aumenta o Ataque Especial" },
  { id: "intimidate", name: "Intimidate", color: "bg-typeDark", description: "Reduz o Ataque do oponente ao entrar em batalha" },
  { id: "levitate", name: "Levitate", color: "bg-typeFlying", description: "Imune a movimentos do tipo Terra" },
  { id: "synchronize", name: "Synchronize", color: "bg-typePsychic", description: "Passa condições de status para o oponente" },
  { id: "clear-body", name: "Clear Body", color: "bg-typeSteel", description: "Impede a redução de estatísticas por efeitos do oponente" },
  { id: "natural-cure", name: "Natural Cure", color: "bg-typeGrass", description: "Cura condições de status ao trocar de Pokémon" },
  { id: "serene-grace", name: "Serene Grace", color: "bg-typeNormal", description: "Dobra a chance de efeitos adicionais dos movimentos" },
  { id: "swift-swim", name: "Swift Swim", color: "bg-typeWater", description: "Dobra a Velocidade durante chuva" },
  { id: "battle-armor", name: "Battle Armor", color: "bg-typeRock", description: "Protege contra golpes críticos" }
];

export default function HabilidadesPage() {
  const [loading, setLoading] = useState(true);
  const [selectedAbility, setSelectedAbility] = useState(null);
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
  
  // Carregar Pokémon quando uma habilidade é selecionada
  useEffect(() => {
    if (selectedAbility) {
      setIsLoadingPokemon(true);
      setPokemonList([]);
      setPage(1);
      setHasMore(true);
      
      fetchGames({ sAbility: selectedAbility, sPage: 1 }).then((data) => {
        setPokemonList(data);
        setIsLoadingPokemon(false);
        
        if (data.length < 20) {
          setHasMore(false);
        }
      });
    }
  }, [selectedAbility]);
  
  // Função para carregar mais Pokémon
  const loadMorePokemon = () => {
    if (!isLoadingPokemon && hasMore) {
      setIsLoadingPokemon(true);
      const nextPage = page + 1;
      
      fetchGames({ sAbility: selectedAbility, sPage: nextPage }).then((data) => {
        setPokemonList(prev => [...prev, ...data]);
        setPage(nextPage);
        setIsLoadingPokemon(false);
        
        if (data.length < 20) {
          setHasMore(false);
        }
      });
    }
  };
  
  // Função para voltar à lista de habilidades
  const backToAbilities = () => {
    setSelectedAbility(null);
    setPokemonList([]);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 flex justify-center items-center">
        <div className="text-center">
          <div className="pokeball-loading">
            <div className="pokeball-loading-inner"></div>
          </div>
          <p className="mt-4 text-gray-600">Carregando habilidades de Pokémon...</p>
        </div>
      </div>
    );
  }
  
  // Se uma habilidade foi selecionada, mostrar a lista de Pokémon com essa habilidade
  if (selectedAbility) {
    const abilityInfo = pokemonAbilities.find(a => a.id === selectedAbility);
    const abilityColor = abilityInfo ? abilityInfo.color : 'bg-typeNormal';
    
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <button 
              onClick={backToAbilities}
              className="mr-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className={`text-4xl font-bold ${abilityColor.replace('bg-', 'text-')}`}>
              {abilityInfo ? abilityInfo.name : selectedAbility}
            </h1>
          </div>
          
          {abilityInfo && (
            <div className={`${abilityColor} text-white p-4 rounded-lg mb-8`}>
              <p>{abilityInfo.description}</p>
            </div>
          )}
          
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
                  <p className="text-gray-600">Nenhum Pokémon encontrado com esta habilidade.</p>
                  <button
                    onClick={backToAbilities}
                    className="mt-4 px-4 py-2 bg-pokeRed text-white rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Voltar para Habilidades
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Mostrar a lista de habilidades
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Habilidades de Pokémon</h1>
        
        <p className="text-lg text-gray-700 text-center mb-12">
          As habilidades são poderes especiais que afetam os Pokémon em batalha e fora dela.
          Clique em uma habilidade para ver todos os Pokémon que possuem essa habilidade.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pokemonAbilities.map((ability) => (
            <div 
              key={ability.id}
              onClick={() => setSelectedAbility(ability.id)}
              className="block transform transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className={`${ability.color} rounded-lg shadow-lg overflow-hidden h-full`}>
                <div className="p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">{ability.name}</h2>
                  <p className="mb-4">{ability.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Ver Pokémon com esta habilidade</span>
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
