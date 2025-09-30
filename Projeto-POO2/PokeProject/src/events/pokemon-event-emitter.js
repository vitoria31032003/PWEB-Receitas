// src/events/pokemon-event-emitter.js

class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
    }

    off(eventName, callback) {
        if (!this.listeners[eventName]) return;
        this.listeners[eventName] = this.listeners[eventName].filter(
            listener => listener !== callback
        );
    }

    emit(eventName, ...args) {
        if (!this.listeners[eventName]) return;
        this.listeners[eventName].forEach(listener => {
            try {
                listener(...args);
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
            }
        });
    }
}

export const pokemonEventEmitter = new EventEmitter();


