import * as utils from "./utils.js";

// Hyperedge is made up of symbols
export default class Hyperedge {
    constructor(symbols = [], thinkabletype) {
        this.symbols = symbols;
        this.thinkabletype = thinkabletype;
    }

    get id() {
        const id = this.symbols.join("->");
        if (this.thinkabletype.isIsolated) {
            return `${this.index}:${id}`;
        }

        return id;
    }

    get index() {
        return this.thinkabletype.hyperedges.indexOf(this);
    }

    get firstSymbol() {
        return this.symbols[0];
    }

    get lastSymbol() {
        return this.symbols[this.symbols.length - 1];
    }

    add() {
        const symbols = Array.from(arguments);
        this.symbols.push(...symbols);
        this.thinkabletype.setUnsynced();
    }

    remove(symbol_or_index) {
        if (typeof symbol_or_index === "number") {
            this.symbols.splice(symbol_or_index, 1);
            this.thinkabletype.setUnsynced();
        } else if (typeof symbol_or_index === "string") {
            const index = this.symbols.indexOf(symbol_or_index);
            if (index !== -1) {
                this.symbols.splice(index, 1);
                this.thinkabletype.setUnsynced();
            }
        }
    }

    has(hyperedge) {
        if (!Array.isArray(hyperedge)) hyperedge = [hyperedge];
        return utils.arrayContains(this.symbols, hyperedge);
    }

    equal(hyperedge) {
        return this.id === hyperedge.id;
    }

    async similar() {
        const hyperedges = new Map();
        for (const symbol of this.symbols) {
            const edges = await this.thinkabletype.similar(symbol);
            for (const edge of edges) {
                if (edge.equal(this)) continue;
                hyperedges.set(edge.id, edge);
            }
        }

        return Array.from(hyperedges.values());
    }

    async suggest(options = {}) {
        return this.thinkabletype.suggest(this.symbols, options);
    }
}