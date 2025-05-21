"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Componente para animação de carregamento estilo Pokéball
const PokeBallLoader = () => (
  <div className="flex justify-center items-center py-12">
    <div className="relative w-16 h-16 animate-spin">
      <div className="absolute w-full h-8 top-0 rounded-t-full bg-pokeRed"></div>
      <div className="absolute w-full h-8 bottom-0 rounded-b-full bg-white"></div>
      <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-white border-4 border-grayDark z-10"></div>
      <div className="absolute inset-0 rounded-full border-4 border-grayDark"></div>
    </div>
    <p className="ml-4 text-lg font-semibold text-gray-700">Carregando...</p>
  </div>
);

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  
  // Efeito de fade-in para o footer
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <footer className={`bg-pokeRed text-white py-8 mt-12 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <img 
                src="https://www.pokemon.com/static-assets/app/static3/img/og-default-image.jpeg" 
                alt="Pokémon Logo" 
                className="h-10 mr-2"
              />
              <span className="text-2xl font-bold">Pokédex</span>
            </Link>
            <p className="mt-2 text-sm">© {year} Pokémon. Todos os direitos reservados.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold mb-3">Pokédex</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/home" className="text-gray-200 hover:text-white transition-colors">
                    Todos os Pokémon
                  </Link>
                </li>
                <li>
                  <Link href="/tipos" className="text-gray-200 hover:text-white transition-colors">
                    Tipos
                  </Link>
                </li>
                <li>
                  <Link href="/geracoes" className="text-gray-200 hover:text-white transition-colors">
                    Gerações
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/habitats" className="text-gray-200 hover:text-white transition-colors">
                    Habitats
                  </Link>
                </li>
                <li>
                  <Link href="/regioes" className="text-gray-200 hover:text-white transition-colors">
                    Regiões
                  </Link>
                </li>
                <li>
                  <Link href="/habilidades" className="text-gray-200 hover:text-white transition-colors">
                    Habilidades
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-200 hover:text-white transition-colors">
                    Sobre
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-red-600 text-center">
          <p className="text-sm">
            Este projeto é uma adaptação visual inspirada no site oficial da Pokédex. 
            Todos os dados são fornecidos pela PokeAPI.
          </p>
        </div>
      </div>
    </footer>
  );
}
