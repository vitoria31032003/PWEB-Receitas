"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingAnimation from '../components/LoadingAnimation';

export default function AboutPage() {
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!loading) {
      setIsVisible(true);
    }
  }, [loading]);
  
  if (loading) {
    return <LoadingAnimation />;
  }
  
  return (
    <div className={`min-h-screen py-12 px-6 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-4xl mx-auto bg-white rounded-xl overflow-hidden shadow-pokemon-card">
        <div className="bg-pokeRed text-white p-6">
          <h1 className="text-3xl font-bold text-center">Sobre a Pokédex</h1>
        </div>
        
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <img 
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" 
              alt="Pikachu" 
              className="w-48 h-48 object-contain transform hover:scale-110 transition-transform duration-300"
            />
          </div>
          
          <div className="space-y-6 text-gray-700">
            <p className="text-lg">
              A Pokédex é uma enciclopédia eletrônica portátil que os Treinadores Pokémon carregam para registrar 
              informações sobre as diferentes espécies de Pokémon que encontram durante suas jornadas.
            </p>
            
            <p className="text-lg">
              Este projeto é uma implementação web da Pokédex, utilizando dados da PokeAPI para fornecer informações 
              detalhadas sobre todos os Pokémon conhecidos. A interface foi projetada para se assemelhar ao site oficial 
              da Pokédex, oferecendo uma experiência familiar aos fãs de Pokémon.
            </p>
            
            <p className="text-lg">
              Você pode navegar pelos Pokémon, pesquisar por nome ou número, filtrar por tipo, e visualizar estatísticas 
              detalhadas de cada criatura. A Pokédex é constantemente atualizada com novos Pokémon e informações.
            </p>
            
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-pokeRed">Recursos da Pokédex</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Informações detalhadas sobre todos os Pokémon</li>
                <li>Pesquisa por nome ou número</li>
                <li>Visualização de estatísticas e habilidades</li>
                <li>Navegação entre Pokémon relacionados</li>
                <li>Interface responsiva para todos os dispositivos</li>
                <li>Animações e efeitos visuais interativos</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/home">
              <button className="bg-pokeRed text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors transform hover:scale-105 duration-300">
                Explorar a Pokédex
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
