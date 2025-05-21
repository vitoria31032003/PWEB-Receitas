"use client";

import { useState, useEffect } from 'react';
import { fetchGameDetails } from '../../actions/gameActions';
import Link from 'next/link';

// Mapeamento de tipos para classes CSS
const typeClasses = {
  normal: 'type-normal',
  fire: 'type-fire',
  water: 'type-water',
  grass: 'type-grass',
  electric: 'type-electric',
  ice: 'type-ice',
  fighting: 'type-fighting',
  poison: 'type-poison',
  ground: 'type-ground',
  flying: 'type-flying',
  psychic: 'type-psychic',
  bug: 'type-bug',
  rock: 'type-rock',
  ghost: 'type-ghost',
  dragon: 'type-dragon',
  dark: 'type-dark',
  steel: 'type-steel',
  fairy: 'type-fairy',
};

// Função para formatar o número do Pokémon
const formatPokemonNumber = (id) => {
  return `Nº ${String(id).padStart(4, '0')}`;
};

// Componente para exibir as estatísticas com barras visuais
const StatBar = ({ name, value }) => {
  // Valor máximo para estatísticas de Pokémon é geralmente 255
  const percentage = Math.min(100, (value / 255) * 100);
  
  // Determinar a cor da barra baseada no valor
  let barColor = 'bg-red-500';
  if (value > 150) barColor = 'bg-green-500';
  else if (value > 80) barColor = 'bg-yellow-500';
  
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 capitalize">{name}</span>
        <span className="text-sm font-medium text-gray-700">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${barColor} h-2.5 rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Componente para exibir a linha evolutiva
const EvolutionChain = ({ evolutionData, currentPokemonId }) => {
  if (!evolutionData || evolutionData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        Informações evolutivas não disponíveis
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-4">
      {evolutionData.map((pokemon, index) => {
        const isCurrentPokemon = pokemon.id === parseInt(currentPokemonId);
        
        return (
          <div key={pokemon.id} className="flex flex-col items-center">
            {index > 0 && (
              <div className="flex items-center justify-center h-8 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            )}
            <Link href={`/home/${pokemon.id}`}>
              <div className={`p-4 rounded-lg ${isCurrentPokemon ? 'bg-pokeRed bg-opacity-10 border-2 border-pokeRed' : 'bg-gray-100 hover:bg-gray-200'} transition-colors duration-300 flex flex-col items-center`}>
                <img 
                  src={pokemon.image} 
                  alt={pokemon.name} 
                  className="w-24 h-24 object-contain"
                />
                <p className="text-sm text-gray-500 mt-1">{formatPokemonNumber(pokemon.id)}</p>
                <p className="font-semibold mt-1 capitalize">{pokemon.name}</p>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default function PokemonDetails({ params }) {
  const [pokemonData, setPokemonData] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchGameDetails(params.id);
        
        if (!data || data.error) {
          setError("Erro ao carregar os detalhes do Pokémon.");
          setLoading(false);
          return;
        }
        
        setPokemonData(data);
        
        // Buscar a cadeia evolutiva
        if (data.species_url) {
          try {
            const speciesResponse = await fetch(data.species_url);
            const speciesData = await speciesResponse.json();
            
            if (speciesData.evolution_chain && speciesData.evolution_chain.url) {
              const evolutionResponse = await fetch(speciesData.evolution_chain.url);
              const evolutionData = await evolutionResponse.json();
              
              // Processar a cadeia evolutiva
              const chain = [];
              
              // Adicionar o primeiro Pokémon da cadeia
              if (evolutionData.chain) {
                const baseSpecies = evolutionData.chain.species;
                const baseId = getIdFromUrl(baseSpecies.url);
                
                chain.push({
                  id: baseId,
                  name: baseSpecies.name,
                  image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${baseId}.png`
                });
                
                // Adicionar evoluções
                let currentEvolution = evolutionData.chain.evolves_to;
                while (currentEvolution && currentEvolution.length > 0) {
                  const evolution = currentEvolution[0];
                  const evolutionId = getIdFromUrl(evolution.species.url);
                  
                  chain.push({
                    id: evolutionId,
                    name: evolution.species.name,
                    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evolutionId}.png`
                  });
                  
                  currentEvolution = evolution.evolves_to;
                }
              }
              
              setEvolutionChain(chain);
            }
          } catch (err) {
            console.error("Erro ao buscar cadeia evolutiva:", err);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError("Erro ao carregar os detalhes do Pokémon.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);
  
  // Função auxiliar para extrair o ID da URL
  const getIdFromUrl = (url) => {
    const matches = url.match(/\/(\d+)\//);
    return matches ? parseInt(matches[1]) : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-6 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pokeRed"></div>
          <p className="mt-2 text-gray-600">Carregando detalhes do Pokémon...</p>
        </div>
      </div>
    );
  }

  if (error || !pokemonData) {
    return (
      <div className="text-white text-center p-6 bg-pokeRed rounded-lg max-w-md mx-auto mt-12">
        <p className="font-semibold text-xl">{error || "Erro ao carregar os detalhes do Pokémon."}</p>
        <Link href="/home">
          <button className="mt-4 text-white bg-pokeBlue hover:bg-opacity-90 rounded-lg px-6 py-2 transition-colors">
            Voltar para a Pokédex
          </button>
        </Link>
      </div>
    );
  }

  // Extrair os tipos do Pokémon (se disponíveis)
  const types = pokemonData.description_raw ? 
    pokemonData.description_raw.split('\n\n')[0].replace('Tipos: ', '').split(', ') : 
    [];

  // Extrair as estatísticas (se disponíveis)
  const statsText = pokemonData.description_raw ? 
    pokemonData.description_raw.split('Estatísticas:\n')[1] : 
    '';
  
  const stats = statsText ? 
    statsText.split('\n').map(stat => {
      const [name, value] = stat.split(': ');
      return { name, value: parseInt(value) || 0 };
    }) : 
    [];

  // Extrair as habilidades (se disponíveis)
  const abilitiesText = pokemonData.description_raw ? 
    pokemonData.description_raw.split('\n\n')[1].replace('Habilidades: ', '') : 
    '';

  // Determinar o ID do próximo e do anterior Pokémon
  const currentId = parseInt(params.id);
  const prevId = currentId > 1 ? currentId - 1 : null;
  const nextId = currentId < 898 ? currentId + 1 : null;

  return (
    <div className="min-h-screen py-12 px-6 bg-white">
      <div className="max-w-4xl mx-auto bg-white rounded-xl overflow-hidden shadow-pokemon-card">
        {/* Cabeçalho com número e nome */}
        <div className="bg-pokeRed text-white p-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold capitalize">{pokemonData.name}</h1>
          <span className="text-xl font-semibold">{formatPokemonNumber(pokemonData.id)}</span>
        </div>
        
        {/* Imagem e informações básicas */}
        <div className="p-6 md:flex">
          <div className="md:w-1/2 flex justify-center items-center p-4">
            <img 
              src={pokemonData.background_image} 
              alt={pokemonData.name} 
              className="max-w-full max-h-80 object-contain transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="md:w-1/2 p-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Tipos</h2>
              <div className="flex flex-wrap gap-2">
                {types.map((type, index) => (
                  <Link href={`/tipos`} key={index}>
                    <span 
                      className={`pokemon-type ${typeClasses[type.toLowerCase()] || 'type-normal'} cursor-pointer`}
                    >
                      {type}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Informações</h2>
              <p className="text-gray-700 mb-2">{pokemonData.released}</p>
              <p className="text-gray-700">{pokemonData.rating}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Habilidades</h2>
              <p className="text-gray-700">{abilitiesText}</p>
            </div>
          </div>
        </div>
        
        {/* Linha Evolutiva */}
        <div className="p-6 bg-white border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-center">Linha Evolutiva</h2>
          <EvolutionChain evolutionData={evolutionChain} currentPokemonId={params.id} />
        </div>
        
        {/* Estatísticas */}
        <div className="p-6 bg-gray-50">
          <h2 className="text-2xl font-bold mb-4">Estatísticas</h2>
          <div className="max-w-md mx-auto">
            {stats.map((stat, index) => (
              <StatBar key={index} name={stat.name} value={stat.value} />
            ))}
          </div>
        </div>
        
        {/* Navegação entre Pokémon */}
        <div className="p-6 bg-gray-100 flex justify-between">
          {prevId ? (
            <Link href={`/home/${prevId}`}>
              <button className="bg-pokeBlue text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Anterior
              </button>
            </Link>
          ) : (
            <div></div>
          )}
          
          <Link href="/home">
            <button className="bg-pokeRed text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
              Voltar para a Pokédex
            </button>
          </Link>
          
          {nextId ? (
            <Link href={`/home/${nextId}`}>
              <button className="bg-pokeBlue text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center">
                Próximo
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
