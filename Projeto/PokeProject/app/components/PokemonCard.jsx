import Link from 'next/link';
import { useState, useEffect } from 'react';

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

// Função para capitalizar a primeira letra e tratar nomes com hífen
const capitalize = (s) => {
    if (!s) return '';
    return s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function PokemonCard({ pokemon }) {
  // Estado para controlar o sprite atual
  const [currentSprite, setCurrentSprite] = useState('official_artwork'); // Inicia com a arte oficial

  // Verificar se pokemon existe e tem id
  if (!pokemon || !pokemon.id) {
    // Pode retornar um placeholder ou null se o dado estiver inválido
    console.warn("Dados inválidos para PokemonCard:", pokemon);
    return null; 
  }

  // Extrair os tipos do Pokémon (agora são objetos {name, url})
  const types = pokemon.types || [];
  
  // Determinar a cor de fundo com base no primeiro tipo (acessando .name)
  const mainTypeName = types.length > 0 && types[0]?.name ? types[0].name.toLowerCase() : 'normal';
  const bgColorClass = typeColors[mainTypeName] || 'bg-typeNormal';

  // Formatar altura e peso
  const height = pokemon.height ? `${pokemon.height}m` : '?';
  const weight = pokemon.weight ? `${pokemon.weight}kg` : '?';

  // Pegar a primeira habilidade (acessando .name)
  const firstAbilityName = pokemon.abilities && pokemon.abilities.length > 0 && pokemon.abilities[0]?.name 
                           ? capitalize(pokemon.abilities[0].name) 
                           : 'N/A';

  // Obter os sprites disponíveis, garantindo que o objeto exista
  const sprites = pokemon.sprites || {};
  const availableSprites = {
    official_artwork: sprites.official_artwork,
    front_default: sprites.front_default,
    back_default: sprites.back_default,
    front_shiny: sprites.front_shiny,
    back_shiny: sprites.back_shiny,
  };

  // Filtrar sprites que realmente existem (não são null ou undefined)
  const validSpriteKeys = Object.keys(availableSprites).filter(key => availableSprites[key]);

  // Definir a ordem de ciclo dos sprites
  const spriteCycleOrder = ['official_artwork', 'front_default', 'back_default', 'front_shiny', 'back_shiny'].filter(key => validSpriteKeys.includes(key));

  // Função para mudar para o próximo sprite
  const cycleSprite = (event) => {
    event.preventDefault(); // Impede a navegação ao clicar no botão
    event.stopPropagation(); // Impede a propagação do evento para o Link

    const currentIndex = spriteCycleOrder.indexOf(currentSprite);
    const nextIndex = (currentIndex + 1) % spriteCycleOrder.length;
    setCurrentSprite(spriteCycleOrder[nextIndex]);
  };

  // Determinar a URL da imagem atual
  const currentImageUrl = availableSprites[currentSprite] || availableSprites['official_artwork'] || availableSprites['front_default'] || '/placeholder.png'; // Fallback

  // Atualiza o sprite inicial se a arte oficial não estiver disponível
  useEffect(() => {
    if (!availableSprites['official_artwork'] && availableSprites['front_default']) {
      setCurrentSprite('front_default');
    } else if (spriteCycleOrder.length > 0 && !spriteCycleOrder.includes(currentSprite)) {
        // Se o sprite atual não for mais válido (raro), volta pro primeiro da lista
        setCurrentSprite(spriteCycleOrder[0]);
    }
  }, [availableSprites, spriteCycleOrder]); // Adiciona spriteCycleOrder como dependência

  return (
    <Link href={`/home/${pokemon.id}`} className="block group">
      <div className={`pokemon-card rounded-lg shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300 flex flex-col h-full ${bgColorClass}-light relative`}>
        {/* Cabeçalho do card */}
        <div className={`card-header ${bgColorClass} text-white p-2 rounded-t-lg flex justify-between items-center`}>
          <h3 className="text-lg font-bold capitalize truncate" title={capitalize(pokemon.name)}>{capitalize(pokemon.name)}</h3>
          <span className="text-sm font-medium flex-shrink-0 ml-2">{formatPokemonNumber(pokemon.id)}</span>
        </div>
        
        {/* Corpo do card com Imagem e Botão de Troca */}
        <div className="card-body bg-white p-3 flex-grow flex flex-col justify-center items-center relative">
          <div className="relative w-full aspect-square">
            <img 
              src={currentImageUrl} 
              alt={`${capitalize(pokemon.name)} - ${currentSprite.replace('_', ' ')}`} 
              className="absolute inset-0 w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.png'; }} // Fallback em caso de erro na imagem
            />
          </div>
          {/* Botão para ciclar sprites (posicionado no canto inferior direito da imagem) */} 
          {spriteCycleOrder.length > 1 && (
             <button 
               onClick={cycleSprite} 
               className="absolute bottom-2 right-2 bg-gray-500 bg-opacity-50 hover:bg-opacity-75 text-white p-1 rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
               title="Mudar Ponto de Vista"
               aria-label="Mudar Ponto de Vista do Pokémon"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2M15 15h-4.5" />
                </svg>
             </button>
          )}
        </div>
        
        {/* Informações Adicionais */}
        <div className="card-info bg-gray-50 p-2 text-xs text-gray-600 border-t border-gray-200">
          <div className="flex justify-around">
            <div className="text-center">
              <span className="font-semibold block">Altura</span>
              <span>{height}</span>
            </div>
            <div className="text-center">
              <span className="font-semibold block">Peso</span>
              <span>{weight}</span>
            </div>
          </div>
          <div className="flex justify-around mt-1 pt-1 border-t border-gray-100">
            <div className="text-center">
              <span className="font-semibold block">Geração</span>
              <span>{pokemon.generation ? capitalize(pokemon.generation.replace("generation-", "")) : "."}</span>
            </div>
            <div className="text-center">
              <span className="font-semibold block">Habitat</span>
              <span>{pokemon.habitat && pokemon.habitat !== "unknown" ? capitalize(pokemon.habitat) : "."}</span>
            </div>
          </div>
          <div className="text-center mt-1 pt-1 border-t border-gray-100">
             <span className="font-semibold block">Habilidades</span>
             <span className="truncate block text-xs" title={pokemon.abilities?.map(a => capitalize(a.name)).join(', ') || 'N/A'}>
               {pokemon.abilities && pokemon.abilities.length > 0
                 ? pokemon.abilities.map(a => capitalize(a.name)).join(', ')
                 : 'N/A'}
             </span>
          </div>

          {/* Linha Evolutiva - Simplificada */}
          {pokemon.evolution_chain_url && (
            <div className="text-center mt-1 pt-1 border-t border-gray-100">
              <span className="font-semibold block text-xs">Linha Evolutiva</span>
              <span className="text-xs text-gray-500">Disponível na página de detalhes</span>
            </div>
          )}
        </div>

        {/* Rodapé com tipos (acessando .name) */}
        <div className="card-footer bg-gray-100 p-2 rounded-b-lg border-t border-gray-200">
          <div className="flex flex-wrap gap-1 justify-center">
            {types.map((typeInfo, index) => {
              // Verifica se typeInfo e typeInfo.name existem
              if (!typeInfo || !typeInfo.name) return null; 
              const typeNameLower = typeInfo.name.toLowerCase();
              const typeClass = typeColors[typeNameLower] || 'bg-gray-400';
              return (
                <span 
                  key={index} 
                  className={`${typeClass} text-white text-[10px] px-2 py-0.5 rounded-full font-medium capitalize`}
                >
                  {capitalize(typeInfo.name)} 
                </span>
              );
            })}
            {types.length === 0 && (
               <span className="text-gray-400 text-xs">Tipo não definido</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Adicionar classes de fundo claro para os tipos (exemplo)
// Idealmente, isso seria gerado dinamicamente ou definido no tailwind.config.js
/*
.bg-typeNormal-light { background-color: #f5f5f5; }
.bg-typeFire-light { background-color: #fff0e6; }
.bg-typeWater-light { background-color: #e6f7ff; }
.bg-typeGrass-light { background-color: #f0fff0; }
.bg-typeElectric-light { background-color: #fffbe6; }
.bg-typeIce-light { background-color: #f0ffff; }
.bg-typeFighting-light { background-color: #fff5f5; }
.bg-typePoison-light { background-color: #f5e6ff; }
.bg-typeGround-light { background-color: #fffaf0; }
.bg-typeFlying-light { background-color: #f0f8ff; }
.bg-typePsychic-light { background-color: #fff0f5; }
.bg-typeBug-light { background-color: #f5fff5; }
.bg-typeRock-light { background-color: #fff8dc; }
.bg-typeGhost-light { background-color: #f8f8ff; }
.bg-typeDragon-light { background-color: #f0f0ff; }
.bg-typeDark-light { background-color: #f5f5f5; }
.bg-typeSteel-light { background-color: #f5f5f5; }
.bg-typeFairy-light { background-color: #fff0f5; }
*/
