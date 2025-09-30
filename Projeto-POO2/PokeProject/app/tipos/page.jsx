"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import PokemonCard from '../components/PokemonCard';
import { fetchPokemonByCategory } from '../actions/gameActions'; // Importar a nova função

// Lista de tipos de Pokémon com cores e descrições
const pokemonTypesData = [
    { id: 1, name: "Normal", apiName: "normal", color: "bg-typeNormal", description: "Pokémon sem fraquezas ou resistências elementares especiais." },
    { id: 2, name: "Fire", apiName: "fire", color: "bg-typeFire", description: "Pokémon que controlam o fogo, fortes contra Planta, Gelo, Inseto e Aço." },
    { id: 3, name: "Water", apiName: "water", color: "bg-typeWater", description: "Pokémon aquáticos, fortes contra Fogo, Terra e Pedra." },
    { id: 4, name: "Grass", apiName: "grass", color: "bg-typeGrass", description: "Pokémon do tipo Planta, fortes contra Água, Terra e Pedra." },
    { id: 5, name: "Electric", apiName: "electric", color: "bg-typeElectric", description: "Pokémon elétricos, fortes contra Água e Voador." },
    { id: 6, name: "Ice", apiName: "ice", color: "bg-typeIce", description: "Pokémon de Gelo, fortes contra Planta, Terra, Voador e Dragão." },
    { id: 7, name: "Fighting", apiName: "fighting", color: "bg-typeFighting", description: "Pokémon lutadores, fortes contra Normal, Gelo, Pedra, Sombrio e Aço." },
    { id: 8, name: "Poison", apiName: "poison", color: "bg-typePoison", description: "Pokémon venenosos, fortes contra Planta e Fada." },
    { id: 9, name: "Ground", apiName: "ground", color: "bg-typeGround", description: "Pokémon terrestres, fortes contra Fogo, Elétrico, Venenoso, Pedra e Aço." },
    { id: 10, name: "Flying", apiName: "flying", color: "bg-typeFlying", description: "Pokémon voadores, fortes contra Planta, Lutador e Inseto." },
    { id: 11, name: "Psychic", apiName: "psychic", color: "bg-typePsychic", description: "Pokémon psíquicos, fortes contra Lutador e Venenoso." },
    { id: 12, name: "Bug", apiName: "bug", color: "bg-typeBug", description: "Pokémon do tipo Inseto, fortes contra Planta, Psíquico e Sombrio." },
    { id: 13, name: "Rock", apiName: "rock", color: "bg-typeRock", description: "Pokémon de Pedra, fortes contra Fogo, Gelo, Voador e Inseto." },
    { id: 14, name: "Ghost", apiName: "ghost", color: "bg-typeGhost", description: "Pokémon fantasmas, fortes contra Psíquico e Fantasma." },
    { id: 15, name: "Dragon", apiName: "dragon", color: "bg-typeDragon", description: "Pokémon dragões, fortes contra Dragão." },
    { id: 16, name: "Dark", apiName: "dark", color: "bg-typeDark", description: "Pokémon sombrios, fortes contra Psíquico e Fantasma." },
    { id: 17, name: "Steel", apiName: "steel", color: "bg-typeSteel", description: "Pokémon de Aço, fortes contra Gelo, Pedra e Fada." },
    { id: 18, name: "Fairy", apiName: "fairy", color: "bg-typeFairy", description: "Pokémon fadas, fortes contra Lutador, Dragão e Sombrio." },
    // --- TIPOS ADICIONADOS ---
    { id: 10001, name: "Unknown", apiName: "unknown", color: "bg-gray-400", description: "Um tipo indefinido para Pokémon com características misteriosas ou desconhecidas." },
    { id: 10002, name: "Shadow", apiName: "shadow", color: "bg-gray-800", description: "Um tipo exclusivo de Pokémon que tiveram seus corações artificialmente fechados." }
];

// Habilidades comuns para filtro (exemplo)
const commonAbilities = [
    "overgrow", "blaze", "torrent", "shield-dust", "shed-skin", "compound-eyes",
    "swarm", "keen-eye", "run-away", "intimidate", "static", "sand-veil",
    "lightning-rod", "levitate", "chlorophyll", "effect-spore", "synchronize",
    "clear-body", "natural-cure", "serene-grace", "swift-swim", "battle-armor"
];

export default function TiposPage() {
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [selectedType, setSelectedType] = useState(null); // Armazena o objeto do tipo selecionado
    const [pokemonList, setPokemonList] = useState([]);
    const [filters, setFilters] = useState({ // Estado inicial dos filtros
        sName: '',
        sAbility: '',
        sHeight: '',
        sWeight: '',
        sOrdering: '',
        sPage: 1
    });
    const [loading, setLoading] = useState(false); // Loading para busca/filtros
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading para rolagem infinita
    const [hasMore, setHasMore] = useState(true);
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Referência para o elemento de observação da rolagem infinita
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
        // Simular carregamento inicial da lista de tipos
        const timer = setTimeout(() => {
            setLoadingInitial(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Carregar Pokémon quando um tipo é selecionado ou filtros mudam
    useEffect(() => {
        if (!selectedType) return; // Não busca se nenhum tipo está selecionado

        setLoading(true);
        const fetchData = async () => {
            try {
                // Passa 'type' como categoryType e o apiName do tipo selecionado
                const result = await fetchPokemonByCategory('type', selectedType.apiName, filters);

                if (filters.sPage === 1) {
                    setPokemonList(result.pokemon);
                } else {
                    // Adiciona apenas Pokémon que ainda não estão na lista
                    const newPokemon = result.pokemon.filter(newPoke =>
                        !pokemonList.some(existingPoke => existingPoke.id === newPoke.id)
                    );
                    setPokemonList(prev => [...prev, ...newPokemon]);
                }
                setHasMore(result.hasMore);

            } catch (error) {
                console.error("Erro ao buscar Pokémon por tipo:", error);
                setHasMore(false);
            } finally {
                setLoading(false);
                setIsLoadingMore(false);
            }
        };

        fetchData();
    }, [selectedType, filters]); // Depende do tipo selecionado e dos filtros

    // Atualiza os filtros
    const updateFilters = (event) => {
        const { name, value } = event.target;
        setFilters((prev) => ({ ...prev, [name]: value, sPage: 1 })); // Reseta a página ao mudar filtro

        if (name === 'sName') {
            if (searchTimeout) clearTimeout(searchTimeout);
            if (value.length > 2 || value === '') {
                const newTimeout = setTimeout(() => {
                    // A busca será acionada pelo useEffect
                }, 500);
                setSearchTimeout(newTimeout);
            }
        }
    };

    const resetFilters = () => {
        setFilters({
            sName: '',
            sAbility: '',
            sHeight: '',
            sWeight: '',
            sOrdering: '',
            sPage: 1
        });
    };

    const applyFilters = () => {
        if (filters.sPage !== 1) {
            setFilters(prev => ({ ...prev, sPage: 1 }));
        } else {
            setFilters(prev => ({ ...prev }));
        }
    };

    const loadMorePokemon = () => {
        if (!isLoadingMore && hasMore && !loading) {
            setIsLoadingMore(true);
            setFilters(prev => ({ ...prev, sPage: prev.sPage + 1 }));
        }
    };

    const handleSelectType = (type) => {
        setSelectedType(type);
        setFilters({
            sName: '', sAbility: '', sHeight: '', sWeight: '', sOrdering: '', sPage: 1
        });
        setPokemonList([]);
        setHasMore(true);
        setShowAdvancedSearch(false);
    };

    const backToTypes = () => {
        setSelectedType(null);
        setPokemonList([]);
        setFilters({ sName: '', sAbility: '', sHeight: '', sWeight: '', sOrdering: '', sPage: 1 });
    };

    if (loadingInitial) {
        return (
            <div className="min-h-screen bg-white py-12 px-4 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando tipos...</p>
                </div>
            </div>
        );
    }

    if (selectedType) {
        const typeColor = selectedType.color || 'bg-gray-500';
        const textColor = typeColor.replace('bg-', 'text-');

        return (
            <div className="min-h-screen bg-white py-9 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center mb-6">
                        <button onClick={backToTypes} className="mr-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors" aria-label="Voltar para a lista de tipos">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <h1 className={`text-3xl md:text-4xl font-bold ${textColor}`}>Tipo: {selectedType.name}</h1>
                    </div>
                    <div className={`${typeColor} text-white p-4 rounded-lg mb-8 shadow`}><p>{selectedType.description}</p></div>
                    <div className="search-bar bg-gray-100 p-4 md:p-6 rounded-lg shadow-md mb-8">
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex-grow relative">
                                <label htmlFor="pokemon-search" className="sr-only">Buscar por nome</label>
                                <input id="pokemon-search" type="text" name="sName" placeholder={`Buscar em ${selectedType.name}...`} value={filters.sName} onChange={updateFilters} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                                {filters.sName && (<button onClick={() => { setFilters(prev => ({ ...prev, sName: '', sPage: 1 })); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" aria-label="Limpar busca"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></button>)}
                            </div>
                            <button onClick={applyFilters} className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center sm:w-auto w-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>Buscar</button>
                        </div>
                        <div className="text-right mb-4">
                            <button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className="text-sm text-red-600 hover:text-red-700 transition-colors flex items-center justify-end">
                                {showAdvancedSearch ? (<><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>Ocultar filtros avançados</>) : (<><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>Mostrar filtros avançados</>)}
                            </button>
                        </div>
                        {showAdvancedSearch && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-300">
                                <div><label htmlFor="pokemon-ability" className="block text-sm font-medium text-gray-700 mb-1">Habilidade</label><select id="pokemon-ability" name="sAbility" value={filters.sAbility} onChange={updateFilters} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"><option value="">Todas</option>{commonAbilities.map(ability => (<option key={ability} value={ability}>{ability.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</option>))}</select></div>
                                <div><label htmlFor="pokemon-height" className="block text-sm font-medium text-gray-700 mb-1">Altura</label><select id="pokemon-height" name="sHeight" value={filters.sHeight} onChange={updateFilters} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"><option value="">Qualquer</option><option value="small">Pequeno (&lt; 1m)</option><option value="medium">Médio (1m - 2m)</option><option value="large">Grande (&gt; 2m)</option></select></div>
                                <div><label htmlFor="pokemon-weight" className="block text-sm font-medium text-gray-700 mb-1">Peso</label><select id="pokemon-weight" name="sWeight" value={filters.sWeight} onChange={updateFilters} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"><option value="">Qualquer</option><option value="light">Leve (&lt; 10kg)</option><option value="medium">Médio (10kg - 50kg)</option><option value="heavy">Pesado (&gt; 50kg)</option></select></div>
                                <div className="md:col-span-1 lg:col-span-3 flex justify-end mt-2"><button onClick={resetFilters} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">Limpar Filtros Avançados</button></div>
                            </div>
                        )}
                    </div>
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
                        <div className="mb-3 sm:mb-0">{!loading && pokemonList.length > 0 && (<p className="text-gray-600 text-sm">Exibindo {pokemonList.length} Pokémon do tipo {selectedType.name}</p>)}{!loading && pokemonList.length === 0 && (<p className="text-gray-600 text-sm">Nenhum Pokémon encontrado para os filtros selecionados.</p>)}</div>
                        <div className="flex items-center"><label htmlFor="pokemon-ordering" className="mr-2 text-gray-700 text-sm">Organizar por:</label><select id="pokemon-ordering" name="sOrdering" value={filters.sOrdering} onChange={updateFilters} className="p-2 text-sm rounded-lg border border-gray-300 focus:ring-red-500 focus:border-red-500"><option value="">Número (Crescente)</option><option value="name">Nome (A-Z)</option><option value="-name">Nome (Z-A)</option><option value="height">Altura (Crescente)</option><option value="-height">Altura (Decrescente)</option><option value="weight">Peso (Crescente)</option><option value="-weight">Peso (Decrescente)</option></select></div>
                    </div>
                    {loading && pokemonList.length === 0 ? (<div className="text-center py-12"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mx-auto mb-4"></div><p className="text-gray-600">Carregando Pokémon...</p></div>) : (<>{pokemonList.length > 0 ? (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">{pokemonList.map((pokemon, index) => { if (pokemonList.length === index + 1) { return (<div ref={lastPokemonElementRef} key={pokemon.id}><PokemonCard pokemon={pokemon} /></div>); } else { return <PokemonCard key={pokemon.id} pokemon={pokemon} />; } })}</div>) : (!loading && (<div className="text-center py-12 text-gray-500"><p>Nenhum Pokémon encontrado com os filtros selecionados para o tipo {selectedType.name}.</p></div>))}
                        {isLoadingMore && (<div className="text-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto"></div><p className="mt-2 text-sm text-gray-500">Carregando mais...</p></div>)}
                        {!hasMore && pokemonList.length > 0 && (<div className="text-center py-6 text-gray-500 text-sm">Fim da lista de Pokémon do tipo {selectedType.name}.</div>)}</>)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">Explorar por Tipo</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {pokemonTypesData.map((type) => (
                        <button key={type.id} onClick={() => handleSelectType(type)} className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-white text-left flex flex-col justify-between h-40 ${type.color}`}>
                            <div><h2 className="text-2xl font-bold mb-2 capitalize">{type.name}</h2><p className="text-sm opacity-90">{type.description}</p></div>
                            <span className="mt-2 text-right font-semibold text-lg">→</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}