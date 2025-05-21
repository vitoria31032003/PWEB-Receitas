import Link from 'next/link';

// Mapeamento de tipos para classes de cores
const typeColors = {
  normal: 'bg-typeNormal',
  fire: 'bg-typeFire',
  water: 'bg-typeWater',
  grass: 'bg-typeGrass',
  electric: 'bg-typeElectric',
  ice: 'bg-typeIce',
  fighting: 'bg-typeFighting',
  poison: 'bg-typePoison',
  ground: 'bg-typeGround',
  flying: 'bg-typeFlying',
  psychic: 'bg-typePsychic',
  bug: 'bg-typeBug',
  rock: 'bg-typeRock',
  ghost: 'bg-typeGhost',
  dragon: 'bg-typeDragon',
  dark: 'bg-typeDark',
  steel: 'bg-typeSteel',
  fairy: 'bg-typeFairy',
};

// Função para formatar o número do Pokémon
const formatPokemonNumber = (id) => {
  return `#${String(id).padStart(4, '0')}`;
};

export default function PokemonCard({ pokemon }) {
  // Extrair os tipos do Pokémon (se disponíveis)
  const types = pokemon.description_raw ? 
    pokemon.description_raw.split('\n\n')[0].replace('Tipos: ', '').split(', ') : 
    [];
  
  // Determinar a cor de fundo com base no primeiro tipo
  const mainType = types.length > 0 ? types[0].toLowerCase() : 'normal';
  const bgColorClass = typeColors[mainType] || 'bg-typeNormal';
  
  return (
    <Link href={`/home/${pokemon.id}`}>
      <div className="pokemon-card transform transition-all duration-300 hover:scale-105 cursor-pointer">
        {/* Cabeçalho do card com número */}
        <div className={`card-header ${bgColorClass} text-white p-2 rounded-t-lg flex justify-between items-center`}>
          <h3 className="text-lg font-bold capitalize">{pokemon.name}</h3>
          <span className="text-sm font-medium">{formatPokemonNumber(pokemon.id)}</span>
        </div>
        
        {/* Imagem do Pokémon */}
        <div className="card-body bg-white p-4 flex justify-center items-center">
          <div className="relative w-full pt-[100%]"> {/* Aspect ratio 1:1 */}
            <img 
              src={pokemon.background_image} 
              alt={pokemon.name} 
              className="absolute inset-0 w-full h-full object-contain p-2"
              loading="lazy"
            />
          </div>
        </div>
        
        {/* Rodapé com tipos */}
        <div className="card-footer bg-gray-100 p-3 rounded-b-lg">
          <div className="flex flex-wrap gap-2 justify-center">
            {types.map((type, index) => {
              const typeClass = typeColors[type.toLowerCase()] || 'bg-typeNormal';
              return (
                <span 
                  key={index} 
                  className={`${typeClass} text-white text-xs px-3 py-1 rounded-full font-medium`}
                >
                  {type}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}
