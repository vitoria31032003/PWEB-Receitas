"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard'; // Certifique-se que o caminho está correto
import { fetchPokemonByCategory, fetchAllAbilitiesWithDetails } from '../actions/gameActions'; // Certifique-se que o caminho está correto
import LoadingAnimation from '../components/LoadingAnimation'; // Componente de loading

// Reutilizar listas de tipos para filtros avançados
const pokemonTypes = [
    "normal", "fire", "water", "grass", "electric", "ice", "fighting",
    "poison", "ground", "flying", "psychic", "bug", "rock", "ghost",
    "dragon", "dark", "steel", "fairy"
];

export default function HabilidadesPage() {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [allAbilities, setAllAbilities] = useState([]);
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [pokemonList, setPokemonList] = useState([]);
  const [filters, setFilters] = useState({
    sName: ".",
    sType: ".",
    sWeakness: ".",
    sHeight: ".",
    sWeight: ".",
    sOrdering: ".",
    sPage: 1
  });
  const [loading, setLoading] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [abilitySearchTerm, setAbilitySearchTerm] = useState("");

  const observer = useRef();
  const lastPokemonElementRef = useCallback(node => {
    if (loading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePokemon();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isLoadingMore, hasMore]);

  // Carregar habilidades iniciais
  useEffect(() => {
    const loadAbilities = async () => {
      setLoadingInitial(true);
      try {
        const abilitiesData = await fetchAllAbilitiesWithDetails();
        setAllAbilities(abilitiesData);
      } catch (error) {
        console.error("Erro ao buscar lista detalhada de habilidades:", error);
      } finally {
        setLoadingInitial(false);
      }
    };
    loadAbilities();
  }, []);

  // Buscar Pokémon quando uma habilidade é selecionada ou filtros mudam
  useEffect(() => {
    if (!selectedAbility) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await fetchPokemonByCategory("ability", selectedAbility.name, filters);

        if (filters.sPage === 1) {
          setPokemonList(result.pokemon || []); // Garantir que seja um array
        } else {
          const newPokemon = (result.pokemon || []).filter(newPoke =>
            !pokemonList.some(existingPoke => existingPoke.id === newPoke.id)
          );
          setPokemonList(prev => [...prev, ...newPokemon]);
        }
        setHasMore(result.hasMore);

      } catch (error) {
        console.error("Erro ao buscar Pokémon por habilidade:", error);
        setPokemonList([]); // Limpar lista em caso de erro
        setHasMore(false);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    };

    // Debounce para busca por nome
    if (filters.sName !== "." && filters.sName.length > 0) {
        if (searchTimeout) clearTimeout(searchTimeout);
        const newTimeout = setTimeout(() => {
            fetchData();
        }, 500); // Atraso de 500ms
        setSearchTimeout(newTimeout);
    } else {
        if (searchTimeout) clearTimeout(searchTimeout);
        fetchData(); // Busca imediata se não for filtro de nome
    }

    // Limpar timeout ao desmontar ou mudar dependências
    return () => {
        if (searchTimeout) clearTimeout(searchTimeout);
    };

  }, [selectedAbility, filters]); // Dependências: habilidade selecionada e filtros

  // Atualizar filtros
  const updateFilters = (event) => {
    const { name, value } = event.target;
    const filterValue = value === "" ? "." : value;
    // Resetar página para 1 sempre que um filtro (exceto página) mudar
    setFilters((prev) => ({ ...prev, [name]: filterValue, sPage: 1 }));
  };

  // Resetar filtros
  const resetFilters = () => {
    setFilters({
      sName: ".", sType: ".", sWeakness: ".", sHeight: ".", sWeight: ".", sOrdering: ".", sPage: 1
    });
    setShowAdvancedSearch(false); // Ocultar filtros avançados ao resetar
  };

  // Aplicar filtros (força re-fetch se a página já for 1)
  const applyFilters = () => {
    // Força um re-fetch recriando o objeto de filtros (mesmo que a página seja 1)
    setFilters(prev => ({...prev}));
  };

  // Carregar mais Pokémon
  const loadMorePokemon = () => {
    if (!isLoadingMore && hasMore && !loading) {
      setIsLoadingMore(true);
      setFilters(prev => ({ ...prev, sPage: prev.sPage + 1 }));
    }
  };

  // Selecionar habilidade
  const handleSelectAbility = (ability) => {
    setSelectedAbility(ability);
    resetFilters(); // Reseta filtros ao selecionar nova habilidade
    setPokemonList([]); // Limpa lista antiga
    setHasMore(true); // Assume que há mais para carregar inicialmente
  };

  // Voltar para a lista de habilidades
  const backToAbilities = () => {
    setSelectedAbility(null);
    setPokemonList([]);
    setAbilitySearchTerm(""); // Limpa busca de habilidade
  };

  // Filtrar habilidades baseado no termo de busca
  const filteredAbilities = allAbilities.filter(ability =>
    ability.localizedName.toLowerCase().includes(abilitySearchTerm.toLowerCase())
  );

  // ----- Renderização -----

  // Estado de Carregamento Inicial (Habilidades)
  if (loadingInitial) {
    return <LoadingAnimation message="Carregando Habilidades..." />;
  }

  // --- Tela de Listagem de Pokémon (Habilidade Selecionada) ---
  if (selectedAbility) {
    const abilityColor = "bg-indigo-600"; // Cor tema ajustada
    const textColor = "text-indigo-700";

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-indigo-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho: Voltar, Título, Descrição */}
          <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-indigo-100">
            <div className="flex items-center mb-4">
              <button
                onClick={backToAbilities}
                className="mr-4 text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-100 transition-all duration-200 ease-in-out transform hover:scale-110"
                aria-label="Voltar para a lista de habilidades"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
              </button>
              <h1 className={`text-3xl md:text-4xl font-bold ${textColor}`}>
                Habilidade: {selectedAbility.localizedName}
              </h1>
            </div>
            <div className={`${abilityColor} text-white p-4 rounded-lg shadow-inner`}>
              <p className="text-base md:text-lg">{selectedAbility.description || "Descrição não disponível."}</p>
            </div>
          </div>

          {/* Barra de Filtros */} 
          <div className="search-bar bg-white p-5 rounded-xl shadow-md mb-8 border border-gray-200 sticky top-4 z-10">
            {/* Filtro por Nome e Botão Buscar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-grow relative">
                <label htmlFor="pokemon-search" className="sr-only">Buscar por nome</label>
                <input
                  id="pokemon-search"
                  type="text"
                  name="sName"
                  placeholder={`Buscar Pokémon com ${selectedAbility.localizedName}...`}
                  value={filters.sName === "." ? "" : filters.sName}
                  onChange={updateFilters}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pokeRed focus:border-transparent transition-shadow duration-200 shadow-sm"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                {filters.sName !== "." && (
                  <button
                    onClick={() => updateFilters({ target: { name: 'sName', value: '' } })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    aria-label="Limpar busca"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                     </svg>
                  </button>
                )}
              </div>
              {/* Botão Buscar removido - busca automática com debounce */}
            </div>

            {/* Botão de Filtros Avançados e Ordenação */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 border-t border-gray-100 pt-4">
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex items-center group"
              >
                {showAdvancedSearch ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    Ocultar filtros avançados
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    Mostrar filtros avançados
                  </>
                )}
              </button>
              <div className="w-full sm:w-auto">
                <label htmlFor="pokemon-ordering" className="sr-only">Ordenar por</label>
                <select
                  id="pokemon-ordering"
                  name="sOrdering"
                  value={filters.sOrdering}
                  onChange={updateFilters}
                  className="w-full sm:w-auto p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                >
                  <option value=".">Ordenar por ID</option>
                  <option value="name">Nome (A-Z)</option>
                  <option value="-name">Nome (Z-A)</option>
                  <option value="height">Altura (Menor-Maior)</option>
                  <option value="-height">Altura (Maior-Menor)</option>
                  <option value="weight">Peso (Leve-Pesado)</option>
                  <option value="-weight">Peso (Pesado-Leve)</option>
                </select>
              </div>
            </div>

            {/* Filtros Avançados (Collapsible) */}
            {showAdvancedSearch && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200 animate-fade-in-down">
                 {/* Filtro Tipo */}
                 <div>
                   <label htmlFor="pokemon-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                   <select
                     id="pokemon-type"
                     name="sType"
                     value={filters.sType}
                     onChange={updateFilters}
                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                   >
                     <option value=".">Todos</option>
                     {pokemonTypes.map(type => (
                       <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                     ))}
                   </select>
                 </div>
                 {/* Filtro Fraqueza (Desabilitado) */}
                 <div>
                   <label htmlFor="pokemon-weakness" className="block text-sm font-medium text-gray-400 mb-1">Fraqueza</label>
                   <select
                     id="pokemon-weakness"
                     name="sWeakness"
                     value={filters.sWeakness}
                     onChange={updateFilters}
                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100 shadow-sm text-sm text-gray-400"
                     disabled
                   >
                     <option value=".">Todas (Indisponível)</option>
                   </select>
                 </div>
                 {/* Filtro Altura */}
                 <div>
                   <label htmlFor="pokemon-height" className="block text-sm font-medium text-gray-700 mb-1">Altura</label>
                   <select
                     id="pokemon-height"
                     name="sHeight"
                     value={filters.sHeight}
                     onChange={updateFilters}
                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                   >
                     <option value=".">Qualquer</option>
                     <option value="small">Pequeno (&lt; 1m)</option>
                     <option value="medium">Médio (1m - 2m)</option>
                     <option value="large">Grande (&gt; 2m)</option>
                   </select>
                 </div>
                 {/* Filtro Peso */}
                 <div>
                   <label htmlFor="pokemon-weight" className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
                   <select
                     id="pokemon-weight"
                     name="sWeight"
                     value={filters.sWeight}
                     onChange={updateFilters}
                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                   >
                     <option value=".">Qualquer</option>
                     <option value="light">Leve (&lt; 10kg)</option>
                     <option value="medium">Médio (10kg - 50kg)</option>
                     <option value="heavy">Pesado (&gt; 50kg)</option>
                   </select>
                 </div>
                 {/* Espaço vazio para alinhar botão */}
                 <div className="lg:col-span-1"></div>
                 {/* Botão Limpar Filtros */}
                 <div className="lg:col-span-1 flex items-end justify-end">
                    <button
                      onClick={resetFilters}
                      className="w-full md:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors shadow-sm text-sm font-medium"
                    >
                      Limpar Filtros
                    </button>
                 </div>
              </div>
            )}
          </div>

          {/* Contagem de Pokémon */}
          <div className="mb-6 text-center sm:text-left">
            {!loading && pokemonList.length > 0 && (
              <p className="text-gray-600 text-sm">
                Exibindo {pokemonList.length} Pokémon com a habilidade <span className="font-semibold text-indigo-700">{selectedAbility.localizedName}</span>
              </p>
            )}
             {!loading && pokemonList.length === 0 && !hasMore && (
               <p className="text-gray-600 text-sm">Nenhum Pokémon encontrado com esta habilidade e filtros aplicados.</p>
             )}
          </div>

          {/* Grid de Pokémon */}
          {loading && filters.sPage === 1 ? (
            <LoadingAnimation message="Buscando Pokémon..." />
          ) : pokemonList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {pokemonList.map((pokemon, index) => (
                  <div key={pokemon.id} ref={pokemonList.length === index + 1 ? lastPokemonElementRef : null}>
                    <PokemonCard pokemon={pokemon} />
                  </div>
              ))}
            </div>
          ) : (
            !loading && (
                <div className="text-center py-16 bg-white rounded-lg shadow border border-gray-200 mt-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-5 text-xl font-medium text-gray-700">Nenhum Pokémon encontrado.</p>
                  <p className="mt-2 text-sm text-gray-500">Tente ajustar os filtros ou volte para escolher outra habilidade.</p>
                </div>
            )
          )}

          {/* Indicador de Carregando Mais */}
          {isLoadingMore && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm font-medium">Carregando mais Pokémon...</p>
            </div>
          )}

          {/* Mensagem de Fim da Lista */}
          {!hasMore && !loading && !isLoadingMore && pokemonList.length > 0 && (
            <p className="text-center text-gray-500 py-10 font-medium text-lg">Fim da lista de Pokémon.</p>
          )}
        </div>
      </div>
    );
  }

  // --- Tela de Seleção de Habilidades ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-10 tracking-tight">
          Escolha uma <span className="text-indigo-600">Habilidade</span>
        </h1>

        {/* Barra de Busca de Habilidades */}
        <div className="mb-10 max-w-2xl mx-auto relative shadow-sm">
          <label htmlFor="ability-search" className="sr-only">Buscar habilidade</label>
          <input
            id="ability-search"
            type="text"
            placeholder="Buscar habilidade pelo nome..."
            value={abilitySearchTerm}
            onChange={(e) => setAbilitySearchTerm(e.target.value)}
            className="w-full p-4 pl-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow duration-200 text-lg"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Grid de Habilidades */}
        {filteredAbilities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredAbilities.map((ability) => (
              <button
                key={ability.id}
                onClick={() => handleSelectAbility(ability)}
                className="group block p-5 border border-gray-200 rounded-lg hover:shadow-lg hover:border-indigo-400 transition-all duration-300 ease-in-out text-left bg-white transform hover:-translate-y-1 hover:scale-103 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <h2 className="text-lg font-semibold text-indigo-700 group-hover:text-indigo-800 transition-colors duration-200 truncate" title={ability.localizedName}>{ability.localizedName}</h2>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 group-hover:text-gray-600 transition-colors duration-200" title={ability.description || "Sem descrição"}>{ability.description || "Sem descrição"}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow border border-gray-200 mt-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-5 text-xl font-medium text-gray-700">Nenhuma habilidade encontrada.</p>
            {abilitySearchTerm && <p className="mt-2 text-sm text-gray-500">Verifique o termo buscado: "{abilitySearchTerm}".</p>}
          </div>
        )}
      </div>
    </div>
  );
}

