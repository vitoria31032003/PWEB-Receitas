"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard';
import { fetchPokemonByCategory } from '../actions/gameActions';

// Lista de regiões de Pokémon (mantida com Hisui e Kitakami)
const pokemonRegions = [
    { id: 1, name: "Kanto", apiName: "kanto", generationId: 1, color: "bg-red-600", description: "A região onde tudo começou, lar dos primeiros 151 Pokémon." },
    { id: 2, name: "Johto", apiName: "johto", generationId: 2, color: "bg-yellow-600", description: "Vizinhança de Kanto, introduzindo 100 novos Pokémon e os tipos Aço e Sombrio." },
    { id: 3, name: "Hoenn", apiName: "hoenn", generationId: 3, color: "bg-green-600", description: "Uma região tropical com 135 novos Pokémon, batalhas em dupla e Habilidades." },
    { id: 4, name: "Sinnoh", apiName: "sinnoh", generationId: 4, color: "bg-blue-600", description: "Região com rica mitologia, 107 novos Pokémon e a divisão físico/especial." },
    { id: 10, name: "Hisui", apiName: "hisui", generationId: 8, color: "bg-cyan-700", description: "A Sinnoh do passado feudal, com Pokémon selvagens e formas antigas únicas." },
    { id: 5, name: "Unova", apiName: "unova", generationId: 5, color: "bg-indigo-600", description: "Uma região distante com 156 novos Pokémon, a maior adição até hoje." },
    { id: 6, name: "Kalos", apiName: "kalos", generationId: 6, color: "bg-purple-600", description: "Inspirada na França, introduziu o tipo Fada e a Mega Evolução." },
    { id: 7, name: "Alola", apiName: "alola", generationId: 7, color: "bg-pink-600", description: "Um arquipélago tropical com formas regionais e os poderosos Z-Moves." },
    { id: 8, name: "Galar", apiName: "galar", generationId: 8, color: "bg-teal-600", description: "Inspirada no Reino Unido, com os fenômenos Dynamax e Gigantamax." },
    { id: 9, name: "Paldea", apiName: "paldea", generationId: 9, color: "bg-orange-600", description: "Uma vasta região de mundo aberto e o fenômeno Terastal." },
    { id: 11, name: "Kitakami", apiName: "kitakami", generationId: 9, color: "bg-emerald-600", description: "Uma terra pacífica de folclore, visitada durante o DLC de Scarlet & Violet." },
];

const pokemonTypes = ["normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
const commonAbilities = ["overgrow", "blaze", "torrent", "shield-dust", "shed-skin", "compound-eyes", "swarm", "keen-eye", "run-away", "intimidate", "static", "sand-veil", "lightning-rod", "levitate", "chlorophyll", "effect-spore", "synchronize", "clear-body", "natural-cure", "serene-grace", "swift-swim", "battle-armor"];

export default function RegioesPage() {
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState(null);
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
        if (!selectedRegion) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await fetchPokemonByCategory("region", selectedRegion.apiName, filters);
                if (filters.sPage === 1) {
                    setPokemonList(result.pokemon || []); // Garante que seja um array
                } else {
                    const newPokemon = (result.pokemon || []).filter(newPoke =>
                        !pokemonList.some(existingPoke => existingPoke.id === newPoke.id)
                    );
                    setPokemonList(prev => [...prev, ...newPokemon]);
                }
                setHasMore(result.hasMore);
            } catch (error) {
                console.error("Erro ao buscar Pokémon por região:", error);
                setPokemonList([]); // Limpa a lista em caso de erro
                setHasMore(false);
            } finally {
                setLoading(false);
                setIsLoadingMore(false);
            }
        };

        // Lógica de debounce (atraso) para a busca por nome
        if (filters.sName !== "." && filters.sName.length > 0) {
            if (searchTimeout) clearTimeout(searchTimeout);
            const newTimeout = setTimeout(() => {
                fetchData();
            }, 500); // Atraso de 500ms
            setSearchTimeout(newTimeout);
        } else {
            // Executa imediatamente para qualquer outro filtro ou na primeira carga
            if (searchTimeout) clearTimeout(searchTimeout);
            fetchData();
        }

        // Limpa o timeout quando o componente é desmontado
        return () => {
            if (searchTimeout) clearTimeout(searchTimeout);
        };

    }, [selectedRegion, filters]); // Dispara sempre que a região ou os filtros mudam

    const updateFilters = (event) => {
        const { name, value } = event.target;
        const filterValue = value === "" ? "." : value;
        setFilters((prev) => ({ ...prev, [name]: filterValue, sPage: 1 }));
    };
    
    // O resto do seu código permanece igual...
    const resetFilters = () => {
        setFilters({ sName: ".", sType: ".", sWeakness: ".", sAbility: ".", sHeight: ".", sWeight: ".", sOrdering: ".", sPage: 1 });
    };

    const applyFilters = () => {
        // Esta função pode ser removida se a busca é automática, mas mantida por segurança
        setFilters(prev => ({...prev})); 
    };

    const loadMorePokemon = () => {
        if (!isLoadingMore && hasMore && !loading) {
            setIsLoadingMore(true);
            setFilters(prev => ({ ...prev, sPage: prev.sPage + 1 }));
        }
    };

    const handleSelectRegion = (region) => {
        setSelectedRegion(region);
        setFilters({ sName: ".", sType: ".", sWeakness: ".", sAbility: ".", sHeight: ".", sWeight: ".", sOrdering: ".", sPage: 1 });
        setPokemonList([]);
        setHasMore(true);
        setShowAdvancedSearch(false);
    };

    const backToRegions = () => {
        setSelectedRegion(null);
        setPokemonList([]);
    };

    if (loadingInitial) {
        return (
            <div className="min-h-screen bg-white py-12 px-4 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando regiões...</p>
                </div>
            </div>
        );
    }
    
    // --- RENDERIZAÇÃO INTACTA ---
    if (selectedRegion) {
        const regionColor = selectedRegion.color || "bg-gray-500";
        const textColor = regionColor.replace("bg-", "text-");

        return (
            <div className="min-h-screen bg-white py-9 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center mb-6">
                        <button onClick={backToRegions} className="mr-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors" aria-label="Voltar para a lista de regiões">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <h1 className={`text-3xl md:text-4xl font-bold ${textColor}`}>Região: {selectedRegion.name}</h1>
                    </div>
                    <div className={`${regionColor} text-white p-4 rounded-lg mb-8 shadow`}>
                        <p>{selectedRegion.description}</p>
                    </div>

                    {/* Bloco de Filtros */}
                    <div className="search-bar bg-gray-100 p-4 md:p-6 rounded-lg shadow-md mb-8">
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex-grow relative">
                                <input
                                    id="pokemon-search"
                                    type="text"
                                    name="sName"
                                    placeholder={`Buscar em ${selectedRegion.name}...`}
                                    value={filters.sName === "." ? "" : filters.sName}
                                    onChange={updateFilters}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Grid de Pokémon */}
                    {loading && filters.sPage === 1 ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Buscando Pokémon...</p>
                        </div>
                    ) : pokemonList.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                            {pokemonList.map((pokemon, index) => (
                                <div ref={pokemonList.length === index + 1 ? lastPokemonElementRef : null} key={pokemon.id}>
                                    <PokemonCard pokemon={pokemon} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        !loading && (
                            <div className="text-center py-12 text-gray-500">
                                <p>Nenhum Pokémon encontrado com os filtros selecionados para a região de {selectedRegion.name}.</p>
                            </div>
                        )
                    )}

                    {isLoadingMore && (
                        <div className="text-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                            <p className="mt-2 text-sm text-gray-500">Carregando mais...</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    // Renderização da lista de regiões (INTACTA)
    return (
        <div className="min-h-screen bg-white py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">Explorar por Região</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {pokemonRegions.map((region) => (
                        <button key={region.id} onClick={() => handleSelectRegion(region)} className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-white text-left flex flex-col justify-between h-40 ${region.color}`}>
                            <div>
                                <h2 className="text-2xl font-bold mb-2 capitalize">{region.name}</h2>
                                <p className="text-sm opacity-90">{region.description}</p>
                            </div>
                            <span className="mt-2 text-right font-semibold text-lg">→</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}