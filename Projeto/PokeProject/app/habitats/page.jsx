"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard';
import { fetchPokemonByCategory } from '../actions/gameActions';

// Lista de habitats de Pokémon COMPLETA
const pokemonHabitats = [
    { id: 1, name: "Caverna", apiName: "cave", color: "bg-stone-600", description: "Pokémon que vivem em cavernas e ambientes subterrâneos." },
    { id: 2, name: "Floresta", apiName: "forest", color: "bg-green-700", description: "Pokémon que habitam florestas densas e bosques." },
    { id: 3, name: "Planície", apiName: "grassland", color: "bg-lime-600", description: "Pokémon que habitam campos abertos e planícies." },
    { id: 4, name: "Montanha", apiName: "mountain", color: "bg-orange-800", description: "Pokémon que vivem em regiões montanhosas e elevadas." },
    { id: 5, name: "Raro", apiName: "rare", color: "bg-purple-600", description: "Pokémon raros que habitam locais específicos e difíceis de encontrar." },
    { id: 6, name: "Terreno Acidentado", apiName: "rough-terrain", color: "bg-yellow-700", description: "Pokémon que vivem em terrenos irregulares e acidentados." },
    { id: 7, name: "Mar", apiName: "sea", color: "bg-blue-600", description: "Pokémon que habitam a superfície de oceanos e mares." },
    { id: 8, name: "Urbano", apiName: "urban", color: "bg-slate-500", description: "Pokémon adaptados a cidades e ambientes construídos." },
    { id: 9, name: "Água Doce", apiName: "waters-edge", color: "bg-cyan-500", description: "Pokémon que vivem em lagos, rios e suas margens." },
    { id: 10, name: "Mata/Selva", apiName: "jungle", color: "bg-emerald-700", description: "Pokémon encontrados em selvas densas e úmidas." },
    { id: 11, name: "Mar Profundo", apiName: "deep-sea", color: "bg-blue-900", description: "Pokémon que vivem nas profundezas escuras do oceano." },
    { id: 12, name: "Desconhecido", apiName: "unknown", color: "bg-gray-800", description: "Pokémon cujo habitat natural não foi determinado." },
];


const pokemonTypes = ["normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
const commonAbilities = ["overgrow", "blaze", "torrent", "shield-dust", "shed-skin", "compound-eyes", "swarm", "keen-eye", "run-away", "intimidate", "static", "sand-veil", "lightning-rod", "levitate", "chlorophyll", "effect-spore", "synchronize", "clear-body", "natural-cure", "serene-grace", "swift-swim", "battle-armor"];

export default function HabitatsPage() {
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [selectedHabitat, setSelectedHabitat] = useState(null);
    const [pokemonList, setPokemonList] = useState([]);
    const [filters, setFilters] = useState({ sName: ".", sType: ".", sWeakness: ".", sAbility: ".", sHeight: ".", sWeight: ".", sOrdering: ".", sPage: 1 });
    const [loading, setLoading] = useState(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchTimeout, setSearchTimeout] = useState(null);

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
        const timer = setTimeout(() => { setLoadingInitial(false); }, 500);
        return () => clearTimeout(timer);
    }, []);

    // --- LÓGICA DE BUSCA CORRIGIDA ---
    useEffect(() => {
        if (!selectedHabitat) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await fetchPokemonByCategory("pokemon-habitat", selectedHabitat.apiName, filters);
                if (filters.sPage === 1) {
                    setPokemonList(result.pokemon || []);
                } else {
                    const newPokemon = (result.pokemon || []).filter(newPoke => !pokemonList.some(existingPoke => existingPoke.id === newPoke.id));
                    setPokemonList(prev => [...prev, ...newPokemon]);
                }
                setHasMore(result.hasMore);
            } catch (error) {
                console.error("Erro ao buscar Pokémon por habitat:", error);
                setPokemonList([]);
                setHasMore(false);
            } finally {
                setLoading(false);
                setIsLoadingMore(false);
            }
        };

        if (filters.sName !== "." && filters.sName.length > 0) {
            if (searchTimeout) clearTimeout(searchTimeout);
            const newTimeout = setTimeout(() => { fetchData(); }, 500);
            setSearchTimeout(newTimeout);
        } else {
            if (searchTimeout) clearTimeout(searchTimeout);
            fetchData();
        }

        return () => {
            if (searchTimeout) clearTimeout(searchTimeout);
        };
    }, [selectedHabitat, filters]);

    const updateFilters = (event) => {
        const { name, value } = event.target;
        const filterValue = value === "" ? "." : value;
        setFilters((prev) => ({ ...prev, [name]: filterValue, sPage: 1 }));
    };

    const resetFilters = () => {
        setFilters({ sName: ".", sType: ".", sWeakness: ".", sAbility: ".", sHeight: ".", sWeight: ".", sOrdering: ".", sPage: 1 });
    };
    
    const applyFilters = () => setFilters(prev => ({...prev}));
    const loadMorePokemon = () => { if (!isLoadingMore && hasMore && !loading) { setIsLoadingMore(true); setFilters(prev => ({ ...prev, sPage: prev.sPage + 1 })); } };
    const handleSelectHabitat = (habitat) => { setSelectedHabitat(habitat); setFilters({ sName: ".", sType: ".", sWeakness: ".", sAbility: ".", sHeight: ".", sWeight: ".", sOrdering: ".", sPage: 1 }); setPokemonList([]); setHasMore(true); setShowAdvancedSearch(false); };
    const backToHabitats = () => { setSelectedHabitat(null); setPokemonList([]); };

    if (loadingInitial) {
        return (
            <div className="min-h-screen bg-white py-12 px-4 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando habitats...</p>
                </div>
            </div>
        );
    }

    if (selectedHabitat) {
        const habitatColor = selectedHabitat.color || "bg-gray-500";
        const textColor = habitatColor.replace("bg-", "text-");

        return (
            <div className="min-h-screen bg-white py-9 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center mb-6">
                        <button onClick={backToHabitats} className="mr-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors" aria-label="Voltar"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                        <h1 className={`text-3xl md:text-4xl font-bold ${textColor}`}>Habitat: {selectedHabitat.name}</h1>
                    </div>
                    <div className={`${habitatColor} text-white p-4 rounded-lg mb-8 shadow`}><p>{selectedHabitat.description}</p></div>

                    {/* --- FILTROS RESTAURADOS --- */}
                    <div className="search-bar bg-gray-100 p-4 md:p-6 rounded-lg shadow-md mb-8">
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex-grow relative">
                                <label htmlFor="pokemon-search" className="sr-only">Buscar por nome</label>
                                <input id="pokemon-search" type="text" name="sName" placeholder={`Buscar em ${selectedHabitat.name}...`} value={filters.sName === "." ? "" : filters.sName} onChange={updateFilters} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                                {filters.sName !== "." && (<button onClick={() => { setFilters(prev => ({ ...prev, sName: ".", sPage: 1 })); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" aria-label="Limpar busca"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></button>)}
                            </div>
                            <button onClick={applyFilters} className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center sm:w-auto w-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>Buscar</button>
                        </div>
                        <div className="text-right mb-4">
                            <button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className="text-sm text-red-600 hover:text-red-700 transition-colors flex items-center justify-end w-full">
                                {showAdvancedSearch ? (<><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>Ocultar filtros avançados</>) : (<><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>Mostrar filtros avançados</>)}
                            </button>
                        </div>
                        {showAdvancedSearch && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-300">
                                <div><label htmlFor="pokemon-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label><select id="pokemon-type" name="sType" value={filters.sType} onChange={updateFilters} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"><option value=".">Todos</option>{pokemonTypes.map(type => (<option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>))}</select></div>
                                <div><label htmlFor="pokemon-weakness" className="block text-sm font-medium text-gray-700 mb-1">Fraqueza</label><select id="pokemon-weakness" name="sWeakness" value={filters.sWeakness} onChange={updateFilters} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"><option value=".">Todas</option>{pokemonTypes.map(type => (<option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>))}</select></div>
                                <div><label htmlFor="pokemon-ability" className="block text-sm font-medium text-gray-700 mb-1">Habilidade</label><select id="pokemon-ability" name="sAbility" value={filters.sAbility} onChange={updateFilters} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"><option value=".">Todas</option>{commonAbilities.map(ability => (<option key={ability} value={ability}>{ability.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</option>))}</select></div>
                                <div><label htmlFor="pokemon-height" className="block text-sm font-medium text-gray-700 mb-1">Altura</label><select id="pokemon-height" name="sHeight" value={filters.sHeight} onChange={updateFilters} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"><option value=".">Qualquer</option><option value="small">Pequeno (&lt; 1m)</option><option value="medium">Médio (1m - 2m)</option><option value="large">Grande (&gt; 2m)</option></select></div>
                                <div><label htmlFor="pokemon-weight" className="block text-sm font-medium text-gray-700 mb-1">Peso</label><select id="pokemon-weight" name="sWeight" value={filters.sWeight} onChange={updateFilters} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"><option value=".">Qualquer</option><option value="light">Leve (&lt; 10kg)</option><option value="medium">Médio (10kg - 50kg)</option><option value="heavy">Pesado (&gt; 50kg)</option></select></div>
                                <div className="lg:col-span-1 flex items-end justify-end"><button onClick={resetFilters} className="w-full md:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">Limpar Filtros</button></div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
                         {/* ... Contagem e Ordenação ... */}
                    </div>

                    {/* Grid de Pokémon */}
                    {loading && filters.sPage === 1 ? (<div className="text-center py-12"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mx-auto mb-4"></div><p className="text-gray-600">Carregando Pokémon...</p></div>) : pokemonList.length > 0 ? (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">{pokemonList.map((pokemon, index) => { if (pokemonList.length === index + 1) { return (<div ref={lastPokemonElementRef} key={pokemon.id}><PokemonCard pokemon={pokemon} /></div>); } else { return <PokemonCard key={pokemon.id} pokemon={pokemon} />; } })}</div>) : (!loading && (<div className="text-center py-12 text-gray-500"><p>Nenhum Pokémon encontrado com os filtros selecionados para o habitat {selectedHabitat.name}.</p></div>))}
                    {isLoadingMore && (<div className="text-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto"></div><p className="mt-2 text-sm text-gray-500">Carregando mais...</p></div>)}
                    {!hasMore && pokemonList.length > 0 && (<div className="text-center py-6 text-gray-500 text-sm">Fim da lista de Pokémon do habitat {selectedHabitat.name}.</div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">Explorar por Habitat</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {pokemonHabitats.map((habitat) => (<button key={habitat.id} onClick={() => handleSelectHabitat(habitat)} className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-white text-left flex flex-col justify-between h-40 ${habitat.color}`}><div><h2 className="text-2xl font-bold mb-2 capitalize">{habitat.name}</h2><p className="text-sm opacity-90">{habitat.description}</p></div><span className="mt-2 text-right font-semibold text-lg">→</span></button>))}
                </div>
            </div>
        </div>
    );
}