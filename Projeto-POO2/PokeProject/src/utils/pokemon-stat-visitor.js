// src/utils/pokemon-stat-visitor.js

export class PokemonStatVisitor {
    visit(pokemon) {
        if (!pokemon || !pokemon.stats) {
            return 0; // Ou lançar um erro, dependendo da necessidade
        }
        let totalStats = 0;
        for (const stat of pokemon.stats) {
            totalStats += stat.value;
        }
        return totalStats;
    }
}


