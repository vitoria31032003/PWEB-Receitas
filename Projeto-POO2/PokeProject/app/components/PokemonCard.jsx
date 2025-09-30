import Link from 'next/link';
// 1. Importar useState e useEffect para gerenciar o estado do sprite
import { useState, useEffect } from 'react';
import { isPokemonWeakAgainst } from '../../src/utils/type-effectiveness';

// Funções auxiliares mantidas
const capitalize = (s) => {
    if (!s) return '';
    return s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
const formatPokemonNumber = (id) => `#${String(id).padStart(4, '0')}`;
const allTypes = ["normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];

export default function PokemonCard({ pokemon }) {
  // 2. Estado para controlar qual sprite está sendo exibido
  const [currentSpriteKey, setCurrentSpriteKey] = useState('official_artwork');

  if (!pokemon || !pokemon.id) {
    return null;
  }

  const { types = [], sprites = {} } = pokemon;
  const mainTypeName = types.length > 0 ? types[0].name.toLowerCase() : 'normal';
  const bgColorClass = `bg-type${capitalize(mainTypeName)}`;
  
  const pokemonTypeNames = types.map(t => t.name.toLowerCase());
  const weaknesses = allTypes.filter(type => isPokemonWeakAgainst(pokemonTypeNames, type));

  // 3. Define a ordem de ciclo e filtra os sprites que realmente existem
  const spriteCycleOrder = ['official_artwork', 'front_default', 'front_shiny', 'back_default', 'back_shiny'];
  const availableSprites = spriteCycleOrder.filter(key => sprites[key]);
  
  // Garante que o sprite inicial seja válido
  useEffect(() => {
    if (!sprites[currentSpriteKey] && availableSprites.length > 0) {
      setCurrentSpriteKey(availableSprites[0]);
    }
  }, [sprites, currentSpriteKey, availableSprites]);

  // 4. Função para mudar para o próximo sprite
  const cycleSprite = (event) => {
    // Impede que o clique no botão navegue para a página de detalhes
    event.preventDefault();
    event.stopPropagation();

    const currentIndex = availableSprites.indexOf(currentSpriteKey);
    const nextIndex = (currentIndex + 1) % availableSprites.length;
    setCurrentSpriteKey(availableSprites[nextIndex]);
  };

  const currentImageUrl = sprites[currentSpriteKey] || pokemon.background_image || '/placeholder.png';

  return (
    <Link href={`/home/${pokemon.id}`} className="block group">
      <div className="pokemon-card bg-white h-full flex flex-col rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
        
        <div className={`p-3 rounded-t-lg text-white ${bgColorClass} flex justify-between items-center`}>
          <h3 className="text-lg font-bold capitalize truncate">{capitalize(pokemon.name)}</h3>
          <span className="text-sm font-medium">{formatPokemonNumber(pokemon.id)}</span>
        </div>
        
        {/* 5. Container da imagem agora é relativo para posicionar o botão */}
        <div className="p-4 flex-grow flex justify-center items-center bg-gray-50 relative">
          <img 
            src={currentImageUrl}
            alt={`${capitalize(pokemon.name)} - ${currentSpriteKey}`}
            className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.png'; }}
          />
          
          {/* 6. Botão para alterar a imagem */}
          {availableSprites.length > 1 && (
             <button 
               onClick={cycleSprite} 
               className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-40 hover:bg-opacity-60 text-white p-1.5 rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
               title="Mudar visualização"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
             </button>
          )}
        </div>
        
        <div className="p-3 bg-gray-100 rounded-b-lg border-t border-gray-200 space-y-2">
          {/* Seção de Tipos */}
          <div>
            <h4 className="text-xs font-bold text-center text-gray-500 mb-1">TIPO</h4>
            <div className="flex flex-wrap gap-1 justify-center">
                {types.map((typeInfo) => (
                    <span key={typeInfo.name} className={`px-2 py-0.5 text-xs text-white rounded-full font-medium capitalize ${`bg-type${capitalize(typeInfo.name)}`}`}>
                        {capitalize(typeInfo.name)}
                    </span>
                ))}
            </div>
          </div>

          {/* Seção de Fraquezas */}
          {weaknesses.length > 0 && (
            <div className="border-t pt-2">
                <h4 className="text-xs font-bold text-center text-gray-500 mb-1">FRAQUEZAS</h4>
                <div className="flex flex-wrap gap-1 justify-center">
                    {weaknesses.slice(0, 4).map(type => (
                        <span key={type} className={`px-2 py-0.5 text-xs text-white rounded-full font-medium capitalize ${`bg-type${capitalize(type)}`}`}>
                            {capitalize(type)}
                        </span>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}