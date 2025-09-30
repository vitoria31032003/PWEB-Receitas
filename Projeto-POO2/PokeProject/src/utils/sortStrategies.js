
// src/utils/sortStrategies.js

export const sortStrategies = {
    idAsc: (a, b) => a.id - b.id,
    nameAsc: (a, b) => a.name.localeCompare(b.name),
    nameDesc: (a, b) => b.name.localeCompare(a.name),
    heightAsc: (a, b) => (a.height ?? 0) - (b.height ?? 0),
    heightDesc: (a, b) => (b.height ?? 0) - (a.height ?? 0),
    weightAsc: (a, b) => (a.weight ?? 0) - (b.weight ?? 0),
    weightDesc: (a, b) => (b.weight ?? 0) - (a.weight ?? 0),
};

export function getSortStrategy(ordering) {
    switch (ordering) {
        case 'name': return sortStrategies.nameAsc;
        case '-name': return sortStrategies.nameDesc;
        case 'height': return sortStrategies.heightAsc;
        case '-height': return sortStrategies.heightDesc;
        case 'weight': return sortStrategies.weightAsc;
        case '-weight': return sortStrategies.weightDesc;
        default: return sortStrategies.idAsc;
    }
}


