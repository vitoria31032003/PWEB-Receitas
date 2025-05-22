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

export default async function GameDetails({ params }) {
  const pokemonData = await fetchGameDetails(params.id);

  if (!pokemonData || pokemonData.error) {
    return (
      <div className="text-white text-center p-6 bg-pokeRed rounded-lg max-w-md mx-auto mt-12">
        <p className="font-semibold text-xl">Erro ao carregar os detalhes do Pokémon.</p>
        <Link href="/games">
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
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl overflow-hidden shadow-pokemon-card">
        {/* Cabeçalho com número e nome */}
        <div className="bg-pokeRed text-white p-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">{pokemonData.name}</h1>
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
                  <span 
                    key={index} 
                    className={`pokemon-type ${typeClasses[type.toLowerCase()] || 'type-normal'}`}
                  >
                    {type}
                  </span>
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
            <Link href={`/games/${prevId}`}>
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
          
          <Link href="/games">
            <button className="bg-pokeRed text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
              Voltar para a Pokédex
            </button>
          </Link>
          
          {nextId ? (
            <Link href={`/games/${nextId}`}>
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
