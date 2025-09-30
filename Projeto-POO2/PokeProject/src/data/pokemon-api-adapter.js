
// src/data/pokemon-api-adapter.js

import { pokemonDataMapper } from './pokemon-data-mapper';
import { PokemonAPILoggingDecorator } from './pokemon-api-logging-decorator';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Adapter para a PokeAPI
class PokemonAPIAdapter {
    constructor() {
        this.dataMapper = pokemonDataMapper;
    }

    async fetch(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Falha ao buscar dados de ${url}, status: ${response.status}`);
        }
        return response.json();
    }

    async getPokemonDetails(idOrUrl) {
        const url = idOrUrl.includes(BASE_URL) ? idOrUrl : `${BASE_URL}/pokemon/${idOrUrl}`;
        const pokemonData = await this.fetch(url);
        let speciesData = null;
        if (pokemonData.species?.url) {
            try {
                speciesData = await this.fetch(pokemonData.species.url);
            } catch (speciesError) {
                console.warn(`Erro ao buscar species data para ${pokemonData.name}:`, speciesError);
            }
        }
        return this.dataMapper.mapPokemonData(pokemonData, speciesData);
    }

    async getAbilityDetails(url) {
        const data = await this.fetch(url);
        const effectEntry = data.effect_entries?.find(e => e.language.name === 'en') || data.effect_entries?.[0];
        const nameEntry = data.names?.find(n => n.language.name === 'pt-br') || data.names?.find(n => n.language.name === 'en') || { name: data.name };

        return {
            id: data.id,
            name: data.name,
            localizedName: nameEntry.name,
            description: effectEntry?.short_effect || effectEntry?.effect || "Descrição não disponível.",
            url: url
        };
    }

    async getPokemonList(limit, offset) {
        return this.fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    }

    async getCategoryData(categoryType, categoryValue) {
        return this.fetch(`${BASE_URL}/${categoryType}/${categoryValue}`);
    }

    async getAllAbilities(limit = 400) {
        return this.fetch(`${BASE_URL}/ability?limit=${limit}`);
    }

    async getEvolutionChain(url) {
        return this.fetch(url);
    }
}

const basePokemonAPI = new PokemonAPIAdapter();
export const pokemonAPI = new PokemonAPILoggingDecorator(basePokemonAPI);


