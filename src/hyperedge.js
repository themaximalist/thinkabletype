import * as utils from "./utils.js";

export default class Hyperedge {
    constructor(symbols = [], hypertype) {
        this.symbols = symbols;
        this.hypertype = hypertype;
    }

    get id() {
        return this.symbols.join("->");
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
        this.hypertype.setUnsynced();
    }

    remove(symbol_or_index) {
        if (typeof symbol_or_index === "number") {
            this.symbols.splice(symbol_or_index, 1);
            this.hypertype.setUnsynced();
        } else if (typeof symbol_or_index === "string") {
            const index = this.symbols.indexOf(symbol_or_index);
            if (index !== -1) {
                this.symbols.splice(index, 1);
                this.hypertype.setUnsynced();
            }
        }
    }

    has() {
        return utils.arrayContains(this.symbols, arguments);
    }

    equal(hyperedge) {
        return this.id === hyperedge.id;
    }

    async similar() {
        const hyperedges = new Map();
        for (const symbol of this.symbols) {
            const edges = await this.hypertype.similar(symbol);
            for (const edge of edges) {
                if (edge.equal(this)) continue;
                hyperedges.set(edge.id, edge);
            }
        }

        return Array.from(hyperedges.values());
    }

    async suggest(options = {}) {
        return this.hypertype.suggest(this.symbols, options);
    }
}