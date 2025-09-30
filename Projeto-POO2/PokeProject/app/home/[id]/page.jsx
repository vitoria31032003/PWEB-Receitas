"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { pokemonBloc } from '../../../src/bloc/pokemon-bloc';
import { HomeIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import { isPokemonWeakAgainst } from '../../../src/utils/type-effectiveness';

// Funções auxiliares
const formatPokemonNumber = (id) => `Nº ${String(id).padStart(4, '0')}`;
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ') : '';

// Lista de todos os tipos para o cálculo de fraquezas
const allTypes = ["normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];

// Componente para a barra de estatísticas
const StatBar = ({ name, value }) => {
  const percentage = Math.min(100, (value / 255) * 100);
  let barColor = 'bg-red-500';
  if (value >= 120) barColor = 'bg-green-500';
  else if (value >= 90) barColor = 'bg-yellow-500';

  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-800 capitalize">{capitalize(name)}</span>
        <span className="text-sm font-medium text-gray-800">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`stat-bar-fill ${barColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

// Componente para a Linha Evolutiva
const EvolutionChain = ({ evolutionData, currentPokemonId }) => {
  if (!evolutionData || evolutionData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        Este Pokémon não possui uma linha evolutiva.
      </div>
    );
  }

  return (
    <div className="evolution-chain flex justify-center items-center flex-wrap gap-4">
      {evolutionData.map((pokemon, index) => {
        const isCurrent = pokemon.id === parseInt(currentPokemonId);
        return (
          <div key={pokemon.id} className="flex items-center">
            {index > 0 && (
              <div className="evolution-arrow mx-2 text-gray-400 font-bold text-2xl">
                <span>&rarr;</span>
              </div>
            )}
            <Link href={`/home/${pokemon.id}`} className={`evolution-pokemon p-3 rounded-xl text-center shadow-md transition duration-300 ease-in-out ${isCurrent ? 'bg-pokeRed bg-opacity-20 border-2 border-pokeRed' : 'bg-white hover:shadow-lg'}`}>
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="w-24 h-24 object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.png'; }}
              />
              <p className="text-sm font-semibold capitalize mt-2">{capitalize(pokemon.name)}</p>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default function PokemonDetails() {
  const params = useParams();
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSpriteKey, setCurrentSpriteKey] = useState('official_artwork');

  const id = params?.id;

  useEffect(() => {
    if (!id) {
      setError("ID do Pokémon inválido.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setCurrentSpriteKey('official_artwork'); 
      const data = await pokemonBloc.fetchPokemonDetails(id);
      
      console.log("Dados recebidos do Pokémon:", data);

      if (!data) setError("Pokémon não encontrado.");
      else setPokemonData(data);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20"><div className="pokeball-loading mx-auto"></div><p className="mt-4">Carregando detalhes...</p></div>;
  }

  if (error || !pokemonData) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-bold">{error || "Não foi possível carregar os dados do Pokémon."}</p>
        <Link href="/home">
          <button className="mt-4 bg-pokeBlue text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors">Voltar para a Pokédex</button>
        </Link>
      </div>
    );
  }

  const { name, id: pokemonId, types = [], description, stats = [], height, weight, abilities = [], generation, habitat, evolution_chain = [], sprites = {} } = pokemonData;
  const mainType = types.length > 0 ? capitalize(types[0].name) : 'Normal';
  const headerBgClass = `bg-type${mainType}`;

  const currentIdNum = parseInt(id);
  const prevId = currentIdNum > 1 ? currentIdNum - 1 : null;
  const nextId = currentIdNum < 1025 ? currentIdNum + 1 : null;

  const pokemonTypeNames = types.map(t => t.name.toLowerCase());
  const weaknesses = allTypes.filter(type => isPokemonWeakAgainst(pokemonTypeNames, type));
  
  const spriteCycleOrder = ['official_artwork', 'front_default', 'front_shiny', 'back_default', 'back_shiny'];
  const availableSprites = spriteCycleOrder.filter(key => sprites[key]);
  
  const cycleSprite = (event) => {
    event.preventDefault();
    const currentIndex = availableSprites.indexOf(currentSpriteKey);
    const nextIndex = (currentIndex + 1) % availableSprites.length;
    setCurrentSpriteKey(availableSprites[nextIndex]);
  };
  
  const currentImageUrl = sprites[currentSpriteKey] || pokemonData.background_image || '/placeholder.png';

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <nav className="pokemon-nav flex justify-between items-center mb-6">
          <Link href="/home" className="pokemon-nav-button bg-white text-pokeRed shadow rounded-lg px-4 py-2 flex items-center hover:bg-gray-100 transition-colors">
            <HomeIcon className="h-5 w-5 mr-2" /> Voltar
          </Link>
          <div className="flex gap-2">
            {prevId && (
              <Link href={`/home/${prevId}`} className="pokemon-nav-button bg-white shadow rounded-lg px-4 py-2 flex items-center hover:bg-gray-100 transition-colors">
                <ArrowLeftIcon className="h-5 w-5 mr-1" /> Anterior
              </Link>
            )}
            {nextId && (
              <Link href={`/home/${nextId}`} className="pokemon-nav-button bg-white shadow rounded-lg px-4 py-2 flex items-center hover:bg-gray-100 transition-colors">
                Próximo <ArrowRightIcon className="h-5 w-5 ml-1" />
              </Link>
            )}
          </div>
        </nav>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className={`p-6 text-white ${headerBgClass} detail-header rounded-t-xl flex justify-between items-center`}>
            <h1 className="detail-title text-4xl font-bold capitalize">{capitalize(name)}</h1>
            <span className="text-2xl font-bold">{formatPokemonNumber(pokemonId)}</span>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative group">
                <img
                  src={currentImageUrl}
                  alt={`${capitalize(name)} - ${currentSpriteKey}`}
                  className="w-64 h-64 object-contain drop-shadow-lg"
                  onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.png'; }}
                />
                {availableSprites.length > 1 && (
                  <button 
                    onClick={cycleSprite} 
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-40 hover:bg-opacity-60 text-white p-2 rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Mudar visualização"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="detail-section w-full bg-gray-50 rounded-lg shadow-inner p-6">
                <h2 className="text-2xl font-bold mb-3 text-gray-800">Descrição</h2>
                <p className="text-gray-700 leading-relaxed text-justify">{description}</p>
              </div>

              {evolution_chain && evolution_chain.length > 0 && (
                <div className="detail-section w-full bg-gray-50 rounded-lg shadow-inner p-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Linha Evolutiva</h2>
                    <EvolutionChain evolutionData={evolution_chain} currentPokemonId={id} />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="detail-section bg-gray-50 rounded-lg shadow-inner p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Detalhes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-md text-gray-700">
                  <div><strong>Altura:</strong> {height ? `${height} m` : '?'}</div>
                  <div><strong>Peso:</strong> {weight ? `${weight} kg` : '?'}</div>
                  <div className="sm:col-span-2"><strong>Geração:</strong> {generation ? capitalize(generation.replace('generation-','')) : '?'}</div>
                  <div className="sm:col-span-2"><strong>Habitat:</strong> {habitat ? capitalize(habitat) : '?'}</div>
                </div>
              </div>
              <div className="detail-section bg-gray-50 rounded-lg shadow-inner p-6">
                 <h2 className="text-2xl font-bold mb-4 text-gray-800">Tipos</h2>
                 <div className="flex gap-3 flex-wrap">
                   {types.map(typeInfo => (
                     <span key={typeInfo.name} className={`px-4 py-1.5 text-white text-md rounded-full shadow-md ${`bg-type${capitalize(typeInfo.name)}`}`}>
                       {capitalize(typeInfo.name)}
                     </span>
                   ))}
                 </div>
              </div>
              <div className="detail-section bg-gray-50 rounded-lg shadow-inner p-6">
                 <h2 className="text-2xl font-bold mb-4 text-gray-800">Fraquezas</h2>
                 <div className="flex gap-3 flex-wrap">
                   {weaknesses.map(type => (
                     <span key={type} className={`px-4 py-1.5 text-white text-md rounded-full shadow-md ${`bg-type${capitalize(type)}`}`}>
                       {capitalize(type)}
                     </span>
                   ))}
                 </div>
              </div>
              <div className="detail-section bg-gray-50 rounded-lg shadow-inner p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Habilidades</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {abilities.map( (abilityInfo, index) => (
                        <li key={index} className="capitalize text-md">{capitalize(abilityInfo.name)}</li>
                    ))}
                </ul>
              </div>
              <div className="detail-section bg-gray-50 rounded-lg shadow-inner p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Estatísticas Base</h2>
                {stats.map(stat => (
                  <StatBar key={stat.name} name={stat.name} value={stat.value} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}