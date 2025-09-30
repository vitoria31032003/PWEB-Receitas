// src/data/pokemon-api-logging-decorator.js

export class PokemonAPILoggingDecorator {
    constructor(pokemonAPI) {
        this.pokemonAPI = pokemonAPI;
    }

    async fetch(url) {
        console.log(`[LOGGING DECORATOR] Fetching URL: ${url}`);
        const result = await this.pokemonAPI.fetch(url);
        console.log(`[LOGGING DECORATOR] Finished fetching URL: ${url}`);
        return result;
    }

    async getPokemonDetails(idOrUrl) {
        console.log(`[LOGGING DECORATOR] Getting details for Pokemon: ${idOrUrl}`);
        const result = await this.pokemonAPI.getPokemonDetails(idOrUrl);
        console.log(`[LOGGING DECORATOR] Finished getting details for Pokemon: ${idOrUrl}`);
        return result;
    }

    async getAbilityDetails(url) {
        console.log(`[LOGGING DECORATOR] Getting details for Ability: ${url}`);
        const result = await this.pokemonAPI.getAbilityDetails(url);
        console.log(`[LOGGING DECORATOR] Finished getting details for Ability: ${url}`);
        return result;
    }

    async getPokemonList(limit, offset) {
        console.log(`[LOGGING DECORATOR] Getting Pokemon list with limit ${limit} and offset ${offset}`);
        const result = await this.pokemonAPI.getPokemonList(limit, offset);
        console.log(`[LOGGING DECORATOR] Finished getting Pokemon list.`);
        return result;
    }

    async getCategoryData(categoryType, categoryValue) {
        console.log(`[LOGGING DECORATOR] Getting category data for ${categoryType}: ${categoryValue}`);
        const result = await this.pokemonAPI.getCategoryData(categoryType, categoryValue);
        console.log(`[LOGGING DECORATOR] Finished getting category data.`);
        return result;
    }

    async getAllAbilities(limit = 400) {
        console.log(`[LOGGING DECORATOR] Getting all abilities with limit ${limit}`);
        const result = await this.pokemonAPI.getAllAbilities(limit);
        console.log(`[LOGGING DECORATOR] Finished getting all abilities.`);
        return result;
    }

    async getEvolutionChain(url) {
        console.log(`[LOGGING DECORATOR] Getting evolution chain for: ${url}`);
        const result = await this.pokemonAPI.getEvolutionChain(url);
        console.log(`[LOGGING DECORATOR] Finished getting evolution chain.`);
        return result;
    }
}


