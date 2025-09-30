// src/bloc/pokemon-bloc.js

import { pokemonEventEmitter } from "../events/pokemon-event-emitter";
import { fetchGames, fetchPokemonByCategory, fetchAllAbilitiesWithDetails, fetchGameDetails } from "../../app/actions/gameActions";

class PokemonBloc {
    constructor() {
        this.state = {
            pokemonList: [],
            filters: {
                sName: ".", sType: ".", sWeakness: ".", sAbility: ".",
                sHeight: ".", sWeight: ".", sOrdering: ".", sPage: 1
            },
            loading: false,
            isLoadingMore: false,
            hasMore: true,
            error: null,
            abilities: []
        };
        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
        listener(this.state); // Envia o estado atual imediatamente
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    _emit(newState) {
        this.state = { ...this.state, ...newState };
        this.listeners.forEach(listener => listener(this.state));
    }

    // Ação para carregar habilidades (deve ser chamada de um Client Component)
    async loadAbilities() {
        if (this.state.abilities.length > 0) return; // Evita recarregar
        this._emit({ loading: true });
        try {
            const abilities = await fetchAllAbilitiesWithDetails();
            this._emit({ abilities, loading: false });
        } catch (error) {
            console.error("Erro ao carregar habilidades:", error);
            this._emit({ error: "Falha ao carregar habilidades.", loading: false });
        }
    }

    // Define filtros e dispara uma nova busca
    async setFilters(newFilters) {
        const updatedFilters = { ...this.state.filters, ...newFilters, sPage: 1 };
        this._emit({ filters: updatedFilters });
        await this.fetchPokemon(updatedFilters);
    }
    
    // Reseta os filtros para o estado inicial e busca novamente
    async resetFilters() {
        const initialFilters = {
            sName: ".", sType: ".", sWeakness: ".", sAbility: ".",
            sHeight: ".", sWeight: ".", sOrdering: ".", sPage: 1
        };
        this._emit({ filters: initialFilters });
        await this.fetchPokemon(initialFilters);
    }

    // Ação principal para buscar Pokémon com base nos filtros atuais
    async fetchPokemon(filtersToUse = this.state.filters) {
        this._emit({ loading: true, error: null, isLoadingMore: false });

        try {
            const result = await fetchGames(filtersToUse);
            this._emit({
                pokemonList: result.pokemon || [],
                hasMore: result.hasMore,
                loading: false,
                filters: filtersToUse // Garante que os filtros estejam sincronizados
            });
            pokemonEventEmitter.emit("pokemonFetched", result.pokemon || []);
        } catch (error) {
            console.error("Erro ao buscar Pokémon:", error);
            this._emit({ error: "Falha ao buscar Pokémon.", loading: false });
        }
    }
    
    // Ação para carregar mais Pokémon (paginação)
    async loadMorePokemon() {
        if (this.state.loading || this.state.isLoadingMore || !this.state.hasMore) return;

        this._emit({ isLoadingMore: true });
        const nextPage = this.state.filters.sPage + 1;
        const newFilters = { ...this.state.filters, sPage: nextPage };

        try {
            const result = await fetchGames(newFilters);
            const newPokemon = (result.pokemon || []).filter(newPoke =>
                !this.state.pokemonList.some(existingPoke => existingPoke.id === newPoke.id)
            );

            this._emit({
                pokemonList: [...this.state.pokemonList, ...newPokemon],
                hasMore: result.hasMore,
                isLoadingMore: false,
                filters: newFilters
            });
        } catch (error) {
            console.error("Erro ao carregar mais Pokémon:", error);
            this._emit({ isLoadingMore: false, error: "Falha ao carregar mais." });
        }
    }

    // Ação para buscar detalhes de um Pokémon específico
    async fetchPokemonDetails(id) {
        this._emit({ loading: true, error: null });
        try {
            const pokemonDetails = await fetchGameDetails(id);
            this._emit({ loading: false }); // Para o loading geral
            return pokemonDetails; // Retorna os detalhes para o componente
        } catch (error) {
            console.error(`Erro ao buscar detalhes do Pokémon ${id}:`, error);
            this._emit({ error: "Falha ao buscar detalhes do Pokémon.", loading: false });
            return null;
        }
    }
}

export const pokemonBloc = new PokemonBloc();