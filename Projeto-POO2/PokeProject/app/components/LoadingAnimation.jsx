"use client";

import { useState, useEffect } from 'react';

// Componente para animação de carregamento de página
export default function LoadingAnimation() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress(prev => Math.min(prev + Math.random() * 15, 100));
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [progress]);
  
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="w-24 h-24 relative animate-bounce">
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
          alt="Pokeball" 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="mt-8 w-64 bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-pokeRed h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="mt-4 text-gray-700 font-medium">Carregando Pokédex... {Math.floor(progress)}%</p>
    </div>
  );
}
