
// src/utils/categoryFilterKeys.js

export function getFilterKeyForCategory(categoryType) {
    switch (categoryType) {
        case 'type': return 'sType';
        case 'generation': return 'sGeneration';
        case 'pokemon-habitat': return 'sHabitat';
        case 'region': return 'sRegion';
        case 'ability': return 'sAbility';
        default: return null;
    }
}


