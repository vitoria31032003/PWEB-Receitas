"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard';
import { fetchPokemonByCategory, fetchAllAbilitiesWithDetails } from '../actions/gameActions';
import LoadingAnimation from '../components/LoadingAnimation';

// Lista de tipos (INTACTO)
const pokemonTypes = [
    "normal", "fire", "water", "grass", "electric", "ice", "fighting",
    "poison", "ground", "flying", "psychic", "bug", "rock", "ghost",
    "dragon", "dark", "steel", "fairy"
];

// Array de cores SÓLIDAS para os cards
const cardSolidColors = [
    { bg: "bg-blue-500", hover: "hover:bg-blue-600", ring: "focus:ring-blue-500" },
    { bg: "bg-emerald-500", hover: "hover:bg-emerald-600", ring: "focus:ring-emerald-500" },
    { bg: "bg-indigo-500", hover: "hover:bg-indigo-600", ring: "focus:ring-indigo-500" },
    { bg: "bg-rose-500", hover: "hover:bg-rose-600", ring: "focus:ring-rose-500" },
    { bg: "bg-amber-500", hover: "hover:bg-amber-600", ring: "focus:ring-amber-500" },
    { bg: "bg-cyan-500", hover: "hover:bg-cyan-600", ring: "focus:ring-cyan-500" },
    { bg: "bg-purple-500", hover: "hover:bg-purple-600", ring: "focus:ring-purple-500" },
];


export default function HabilidadesPage() {
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [allAbilities, setAllAbilities] = useState([]);
    const [selectedAbility, setSelectedAbility] = useState(null);
    const [pokemonList, setPokemonList] = useState([]);
    const [filters, setFilters] = useState({ sName: ".", sType: ".", sWeakness: ".", sHeight: ".", sWeight: ".", sOrdering: ".", sPage: 1 });
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

    useEffect(() => {
        if (!selectedAbility) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await fetchPokemonByCategory("ability", selectedAbility.name, filters);
                if (filters.sPage === 1) {
                    const uniquePokemon = [];
                    const seenIds = new Set();
                    (result.pokemon || []).forEach(pokemon => {
                        if (!seenIds.has(pokemon.id)) {
                            seenIds.add(pokemon.id);
                            uniquePokemon.push(pokemon);
                        }
                    });
                    setPokemonList(uniquePokemon);
                } else {
                    const newPokemon = (result.pokemon || []).filter(newPoke => !pokemonList.some(existingPoke => existingPoke.id === newPoke.id));
                    setPokemonList(prev => [...prev, ...newPokemon]);
                }
                setHasMore(result.hasMore);
            } catch (error) {
                console.error("Erro ao buscar Pokémon por habilidade:", error);
                setPokemonList([]);
                setHasMore(false);
            } finally {
                setLoading(false);
                setIsLoadingMore(false);
            }
        };
        if (filters.sName !== "." && filters.sName.length > 0) {
            if (searchTimeout) clearTimeout(searchTimeout);
            const newTimeout = setTimeout(() => {
                fetchData();
            }, 500);
            setSearchTimeout(newTimeout);
        } else {
            if (searchTimeout) clearTimeout(searchTimeout);
            fetchData();
        }
        return () => {
            if (searchTimeout) clearTimeout(searchTimeout);
        };
    }, [selectedAbility, filters]);

    const updateFilters = (event) => {
        const { name, value } = event.target;
        const filterValue = value === "" ? "." : value;
        setFilters((prev) => ({ ...prev, [name]: filterValue, sPage: 1 }));
    };

    const resetFilters = () => {
        setFilters({ sName: ".", sType: ".", sWeakness: ".", sHeight: ".", sWeight: ".", sOrdering: ".", sPage: 1 });
        setShowAdvancedSearch(false);
    };

    const loadMorePokemon = () => {
        if (!isLoadingMore && hasMore && !loading) {
            setIsLoadingMore(true);
            setFilters(prev => ({ ...prev, sPage: prev.sPage + 1 }));
        }
    };

    const handleSelectAbility = (ability) => {
        setSelectedAbility(ability);
        resetFilters();
        setPokemonList([]);
        setHasMore(true);
    };

    const backToAbilities = () => {
        setSelectedAbility(null);
        setPokemonList([]);
        setAbilitySearchTerm("");
    };

    const filteredAbilities = allAbilities.filter(ability =>
        ability.localizedName.toLowerCase().includes(abilitySearchTerm.toLowerCase())
    );

    // ----- Renderização -----

    if (loadingInitial) {
        return <LoadingAnimation message="Carregando Habilidades..." />;
    }

    // --- Tela de Listagem de Pokémon (CÓDIGO ORIGINAL, APENAS ESTILO AJUSTADO) ---
    if (selectedAbility) {
        const abilityColor = "bg-indigo-600";
        const textColor = "text-indigo-700";
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 via-indigo-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-indigo-100">
                        <div className="flex items-center mb-4">
                            <button onClick={backToAbilities} className="mr-4 text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-100 transition-all duration-200 ease-in-out transform hover:scale-110" aria-label="Voltar para a lista de habilidades">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                            </button>
                            <h1 className={`text-3xl md:text-4xl font-bold ${textColor}`}>Habilidade: {selectedAbility.localizedName}</h1>
                        </div>
                        <div className={`${abilityColor} text-white p-4 rounded-lg shadow-inner`}>
                            <p className="text-base md:text-lg">{selectedAbility.description || "Descrição não disponível."}</p>
                        </div>
                    </div>
                    <div className="search-bar bg-white p-5 rounded-xl shadow-md mb-8 border border-gray-200 sticky top-4 z-10">
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex-grow relative">
                                <label htmlFor="pokemon-search" className="sr-only">Buscar por nome</label>
                                <input id="pokemon-search" type="text" name="sName" placeholder={`Buscar Pokémon com ${selectedAbility.localizedName}...`} value={filters.sName === "." ? "" : filters.sName} onChange={updateFilters} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pokeRed focus:border-transparent transition-shadow duration-200 shadow-sm" />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                {filters.sName !== "." && (<button onClick={() => updateFilters({ target: { name: 'sName', value: '' } })} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100" aria-label="Limpar busca"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></button>)}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 border-t border-gray-100 pt-4">
                            <button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex items-center group">{showAdvancedSearch ? (<><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>Ocultar filtros avançados</>) : (<><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>Mostrar filtros avançados</>)}</button>
                            <div className="w-full sm:w-auto"><label htmlFor="pokemon-ordering" className="sr-only">Ordenar por</label><select id="pokemon-ordering" name="sOrdering" value={filters.sOrdering} onChange={updateFilters} className="w-full sm:w-auto p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"><option value=".">Ordenar por ID</option><option value="name">Nome (A-Z)</option><option value="-name">Nome (Z-A)</option><option value="height">Altura (Menor-Maior)</option><option value="-height">Altura (Maior-Menor)</option><option value="weight">Peso (Leve-Pesado)</option><option value="-weight">Peso (Pesado-Leve)</option></select></div>
                        </div>
                        {showAdvancedSearch && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200 animate-fade-in-down"><div><label htmlFor="pokemon-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label><select id="pokemon-type" name="sType" value={filters.sType} onChange={updateFilters} className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"><option value=".">Todos</option>{pokemonTypes.map(type => (<option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>))}</select></div><div><label htmlFor="pokemon-weakness" className="block text-sm font-medium text-gray-400 mb-1">Fraqueza</label><select id="pokemon-weakness" name="sWeakness" value={filters.sWeakness} onChange={updateFilters} className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100 shadow-sm text-sm text-gray-400" disabled><option value=".">Todas (Indisponível)</option></select></div><div><label htmlFor="pokemon-height" className="block text-sm font-medium text-gray-700 mb-1">Altura</label><select id="pokemon-height" name="sHeight" value={filters.sHeight} onChange={updateFilters} className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"><option value=".">Qualquer</option><option value="small">Pequeno (&lt; 1m)</option><option value="medium">Médio (1m - 2m)</option><option value="large">Grande (&gt; 2m)</option></select></div><div><label htmlFor="pokemon-weight" className="block text-sm font-medium text-gray-700 mb-1">Peso</label><select id="pokemon-weight" name="sWeight" value={filters.sWeight} onChange={updateFilters} className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"><option value=".">Qualquer</option><option value="light">Leve (&lt; 10kg)</option><option value="medium">Médio (10kg - 50kg)</option><option value="heavy">Pesado (&gt; 50kg)</option></select></div><div className="lg:col-span-1"></div><div className="lg:col-span-1 flex items-end justify-end"><button onClick={resetFilters} className="w-full md:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors shadow-sm text-sm font-medium">Limpar Filtros</button></div></div>)}
                    </div>
                    <div className="mb-6 text-center sm:text-left">{!loading && pokemonList.length > 0 && (<p className="text-gray-600 text-sm">Exibindo {pokemonList.length} Pokémon com a habilidade <span className="font-semibold text-indigo-700">{selectedAbility.localizedName}</span></p>)}{!loading && pokemonList.length === 0 && !hasMore && (<p className="text-gray-600 text-sm">Nenhum Pokémon encontrado com esta habilidade e filtros aplicados.</p>)}</div>
                    {loading && filters.sPage === 1 ? (<LoadingAnimation message="Buscando Pokémon..." />) : pokemonList.length > 0 ? (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">{pokemonList.map((pokemon, index) => { const uniqueKey = `${pokemon.id}-${index}`; return (<div key={uniqueKey} ref={pokemonList.length === index + 1 ? lastPokemonElementRef : null}><PokemonCard pokemon={pokemon} /></div>); })}</div>) : (!loading && (<div className="text-center py-16 bg-white rounded-lg shadow border border-gray-200 mt-8"><svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p className="mt-5 text-xl font-medium text-gray-700">Nenhum Pokémon encontrado.</p><p className="mt-2 text-sm text-gray-500">Tente ajustar os filtros ou volte para escolher outra habilidade.</p></div>))}
                    {isLoadingMore && (<div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto mb-3"></div><p className="text-gray-600 text-sm font-medium">Carregando mais Pokémon...</p></div>)}
                    {!hasMore && !loading && !isLoadingMore && pokemonList.length > 0 && (<p className="text-center text-gray-500 py-10 font-medium text-lg">Fim da lista de Pokémon.</p>)}
                </div>
            </div>
        );
    }

    // --- Tela de Seleção de Habilidades (ESTILO MODIFICADO) ---
    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-10 tracking-tight">
                    Escolha uma <span className="text-indigo-600">Habilidade</span>
                </h1>

                <div className="mb-10 max-w-2xl mx-auto relative shadow-sm">
                    <label htmlFor="ability-search" className="sr-only">Buscar habilidade</label>
                    <input id="ability-search" type="text" placeholder="Buscar habilidade pelo nome..." value={abilitySearchTerm} onChange={(e) => setAbilitySearchTerm(e.target.value)} className="w-full p-4 pl-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow duration-200 text-lg" />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                {/* Grid de Habilidades com Cores Sólidas */}
                {filteredAbilities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredAbilities.map((ability) => {
                            const colorSet = cardSolidColors[ability.id % cardSolidColors.length];
                            return (
                                <button
                                    key={ability.id}
                                    onClick={() => handleSelectAbility(ability)}
                                    className={`group block p-6 rounded-2xl text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 ${colorSet.bg} ${colorSet.hover} ${colorSet.ring}`}
                                >
                                    <h2 className="text-xl font-bold truncate" title={ability.localizedName}>
                                        {ability.localizedName}
                                    </h2>
                                    <p className="text-sm text-white/80 mt-2 line-clamp-3" title={ability.description || "Sem descrição"}>
                                        {ability.description || "Sem descrição"}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow border border-gray-200 mt-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="mt-5 text-xl font-medium text-gray-700">Nenhuma habilidade encontrada.</p>
                        {abilitySearchTerm && <p className="mt-2 text-sm text-gray-500">Verifique o termo buscado: "{abilitySearchTerm}".</p>}
                    </div>
                )}
            </div>
        </div>
    );
}