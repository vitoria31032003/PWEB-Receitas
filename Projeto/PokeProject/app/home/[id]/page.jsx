"use client";

import { useState, useEffect, use } from 'react'; // Importar 'use' do React
import { useParams } from 'next/navigation'; // Importar useParams
import { fetchGameDetails } from '../../actions/gameActions';
import Link from 'next/link';

// Mapeamento de tipos para classes CSS e cores de fundo (mantido)
const typeStyles = {
  normal: { class: 'type-normal', bg: 'bg-typeNormal' },
  fire: { class: 'type-fire', bg: 'bg-typeFire' },
  water: { class: 'type-water', bg: 'bg-typeWater' },
  grass: { class: 'type-grass', bg: 'bg-typeGrass' },
  electric: { class: 'type-electric', bg: 'bg-typeElectric' },
  ice: { class: 'type-ice', bg: 'bg-typeIce' },
  fighting: { class: 'type-fighting', bg: 'bg-typeFighting' },
  poison: { class: 'type-poison', bg: 'bg-typePoison' },
  ground: { class: 'type-ground', bg: 'bg-typeGround' },
  flying: { class: 'type-flying', bg: 'bg-typeFlying' },
  psychic: { class: 'type-psychic', bg: 'bg-typePsychic' },
  bug: { class: 'type-bug', bg: 'bg-typeBug' },
  rock: { class: 'type-rock', bg: 'bg-typeRock' },
  ghost: { class: 'type-ghost', bg: 'bg-typeGhost' },
  dragon: { class: 'type-dragon', bg: 'bg-typeDragon' },
  dark: { class: 'type-dark', bg: 'bg-typeDark' },
  steel: { class: 'type-steel', bg: 'bg-typeSteel' },
  fairy: { class: 'type-fairy', bg: 'bg-typeFairy' },
};

// Função para formatar o número do Pokémon (mantido)
const formatPokemonNumber = (id) => {
  return `Nº ${String(id).padStart(4, '0')}`;
};

// Função para capitalizar a primeira letra (mantido)
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ') : '';

// Componente para exibir as estatísticas com barras visuais (mantido)
const StatBar = ({ name, value }) => {
  const percentage = Math.min(100, (value / 255) * 100);
  let barColor = 'bg-red-500';
  if (value >= 120) barColor = 'bg-green-500';
  else if (value >= 90) barColor = 'bg-yellow-500';
  else if (value >= 60) barColor = 'bg-orange-500';

  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 capitalize">{capitalize(name)}</span>
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

// Componente para exibir a linha evolutiva (mantido)
const EvolutionChain = ({ evolutionData, currentPokemonId }) => {
  if (!evolutionData || evolutionData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        Informações evolutivas não disponíveis.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
      {evolutionData.map((pokemon, index) => {
        const isCurrentPokemon = pokemon.id === parseInt(currentPokemonId);

        return (
          <div key={pokemon.id} className="flex items-center">
            {index > 0 && (
              <div className="flex items-center justify-center mx-2 md:mx-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            )}
            <Link href={`/home/${pokemon.id}`}>
              <div className={`p-3 rounded-lg ${isCurrentPokemon ? 'bg-pokeRed bg-opacity-10 border-2 border-pokeRed' : 'bg-gray-100 hover:bg-gray-200'} transition-colors duration-300 flex flex-col items-center text-center w-28 md:w-32`}>
                <img
                  src={pokemon.image || '/placeholder.png'}
                  alt={pokemon.name}
                  className="w-20 h-20 md:w-24 md:h-24 object-contain mb-1"
                  onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.png'; }}
                />
                <p className="text-xs text-gray-500">{formatPokemonNumber(pokemon.id)}</p>
                <p className="font-semibold text-sm mt-1 capitalize truncate w-full">{capitalize(pokemon.name)}</p>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

// Remover 'params' das props, usar useParams()
export default function PokemonDetails() {
  const params = useParams(); // Usar o hook useParams
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    // Acessar o id diretamente do objeto retornado por useParams
    const idParam = params?.id;

    if (!idParam) {
      setError("ID do Pokémon inválido.");
      setLoading(false);
      return;
    }

    const id = parseInt(idParam);
    if (isNaN(id)) {
       setError("ID do Pokémon inválido.");
       setLoading(false);
       return;
    }
    setCurrentId(id);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchGameDetails(id);

        if (!data) {
          setError("Pokémon não encontrado ou erro ao carregar detalhes.");
        } else {
          setPokemonData(data);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
        setError("Ocorreu um erro ao buscar os detalhes do Pokémon.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.id]); // Dependência continua sendo o id do params

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-6 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pokeRed mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do Pokémon...</p>
        </div>
      </div>
    );
  }

  if (error || !pokemonData) {
    return (
      <div className="min-h-screen bg-white py-12 px-6 flex justify-center items-center">
        <div className="text-center p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-md mx-auto">
          <p className="font-semibold text-xl mb-4">{error || "Erro desconhecido."}</p>
          <Link href="/home">
            <button className="bg-pokeRed text-white hover:bg-opacity-90 rounded-lg px-6 py-2 transition-colors">
              Voltar para a Pokédex
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Extrair dados para facilitar o uso
  const {
    name,
    id: pokemonIdValue,
    background_image,
    types = [],
    height,
    weight,
    abilities = [],
    stats = [],
    description,
    generation,
    habitat,
    moves = [],
    evolution_chain = []
  } = pokemonData;

  // Determinar a cor principal baseada no primeiro tipo com verificação
  const mainType = types && types.length > 0 && types[0]?.name ? types[0].name.toLowerCase() : 'normal';
  const mainBgColor = typeStyles[mainType]?.bg || 'bg-gray-500';

  // Determinar IDs de navegação (mantido)
  const prevId = currentId > 1 ? currentId - 1 : null;
  const maxPokemonId = 1025;
  const nextId = currentId < maxPokemonId ? currentId + 1 : null;

  return (
    <div className="min-h-screen py-8 md:py-12 px-4 bg-gray-100">
      {/* Navegação Superior (mantida) */}
      <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center">
        {prevId ? (
          <Link href={`/home/${prevId}`} className="flex items-center text-gray-600 hover:text-pokeRed transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {formatPokemonNumber(prevId)}
          </Link>
        ) : <div></div>}
        <Link href="/home" className="text-gray-600 hover:text-pokeRed transition-colors font-semibold">
          Voltar à Pokédex
        </Link>
        {nextId ? (
          <Link href={`/home/${nextId}`} className="flex items-center text-gray-600 hover:text-pokeRed transition-colors">
            {formatPokemonNumber(nextId)}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        ) : <div></div>}
      </div>

      {/* Card Principal (mantido) */}
      <div className={`max-w-5xl mx-auto bg-white rounded-xl overflow-hidden shadow-lg border-t-8 ${mainBgColor.replace('bg-', 'border-')}`}>
        {/* Cabeçalho com número e nome (mantido) */}
        <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center bg-gray-50 border-b border-gray-200">
          <h1 className="text-3xl md:text-4xl font-bold capitalize text-gray-800 mb-2 sm:mb-0">{capitalize(name)}</h1>
          <span className={`text-xl font-semibold px-3 py-1 rounded-full text-white ${mainBgColor}`}>{formatPokemonNumber(pokemonIdValue)}</span>
        </div>

        {/* Conteúdo Principal (Grid) (mantido) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-8">
          {/* Coluna Esquerda: Imagem e Descrição (mantida) */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-xs mb-6">
              <img
                src={background_image || '/placeholder.png'}
                alt={name}
                className="w-full h-auto object-contain transform group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
                onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.png'; }}
              />
            </div>
            <div className="bg-gray-100 p-4 rounded-lg w-full">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Descrição</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{description || "Descrição não disponível."}</p>
            </div>
          </div>

          {/* Coluna Direita: Informações, Habilidades, Tipos, Stats (mantida) */}
          <div>
            {/* Informações Básicas (mantida) */}
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h2 className="text-xl font-bold mb-3 text-blue-800">Informações Básicas</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong className="text-gray-600">Altura:</strong> {height ? `${height} m` : '?'}</div>
                <div><strong className="text-gray-600">Peso:</strong> {weight ? `${weight} kg` : '?'}</div>
                <div><strong className="text-gray-600">Geração:</strong> {generation ? capitalize(generation.replace('generation-', '')) : '?'}</div>
                <div><strong className="text-gray-600">Habitat:</strong> {habitat && habitat !== 'unknown' ? capitalize(habitat) : '?'}</div>
              </div>
            </div>

            {/* Tipos (mantida) */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3 text-gray-700">Tipos</h2>
              <div className="flex flex-wrap gap-2">
                {types.map((typeInfo) => (
                  <span
                    key={typeInfo.name}
                    className={`pokemon-type ${typeStyles[typeInfo.name.toLowerCase()]?.class || 'type-normal'}`}
                  >
                    {capitalize(typeInfo.name)}
                  </span>
                ))}
                {types.length === 0 && <span className="text-gray-500 text-sm">Nenhum tipo definido.</span>}
              </div>
            </div>

            {/* Habilidades (mantida) */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3 text-gray-700">Habilidades</h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {abilities.map((abilityInfo) => (
                  <li key={abilityInfo.name}>
                    {capitalize(abilityInfo.name)}
                    {abilityInfo.is_hidden && <span className="text-xs text-gray-500 ml-1">(Oculta)</span>}
                  </li>
                ))}
                {abilities.length === 0 && <li className="list-none text-gray-500">Nenhuma habilidade listada.</li>}
              </ul>
            </div>

            {/* Estatísticas (mantida) */}
            <div>
              <h2 className="text-xl font-bold mb-3 text-gray-700">Estatísticas Base</h2>
              {stats.map((stat) => (
                <StatBar key={stat.name} name={stat.name} value={stat.value} />
              ))}
              {stats.length === 0 && <p className="text-gray-500 text-sm">Estatísticas não disponíveis.</p>}
            </div>
          </div>
        </div>

        {/* Linha Evolutiva (mantida) */}
        <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Linha Evolutiva</h2>
          <EvolutionChain evolutionData={evolution_chain} currentPokemonId={currentId} />
        </div>

        {/* Movimentos (mantida) */}
        <div className="p-6 md:p-8 bg-white border-t border-gray-200">
           <h2 className="text-2xl font-bold mb-4 text-gray-700">Alguns Movimentos</h2>
           {moves.length > 0 ? (
             <div className="flex flex-wrap gap-2">
               {moves.map((move) => (
                 <span key={move.name} className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full capitalize">
                   {capitalize(move.name)}
                 </span>
               ))}
             </div>
           ) : (
             <p className="text-gray-500 text-sm">Nenhum movimento listado.</p>
           )}
        </div>

        {/* Navegação Inferior (mantida) */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-between items-center">
           {prevId ? (
             <Link href={`/home/${prevId}`} className="bg-pokeBlue text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center text-sm">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
               </svg>
               Anterior
             </Link>
           ) : (
             <div className="w-24"></div>
           )}

           <Link href="/home">
             <button className="bg-pokeRed text-white px-5 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm">
               Voltar à Pokédex
             </button>
           </Link>

           {nextId ? (
             <Link href={`/home/${nextId}`} className="bg-pokeBlue text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center text-sm">
               Próximo
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
               </svg>
             </Link>
           ) : (
             <div className="w-24"></div>
           )}
        </div>
      </div>
    </div>
  );
}

