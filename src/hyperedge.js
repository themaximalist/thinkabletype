import * as utils from "./utils.js";

export default class Hyperedge {
    constructor(symbols = []) {
        this.symbols = symbols;
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
    }

    remove(symbol_or_index) {
        if (typeof symbol_or_index === "number") {
            this.symbols.splice(symbol_or_index, 1);
        } else if (typeof symbol_or_index === "string") {
            const index = this.symbols.indexOf(symbol_or_index);
            if (index !== -1) {
                this.symbols.splice(index, 1);
            }
        }
    }

    has() {
        return utils.arrayContains(this.symbols, arguments);
    }

    equal(hyperedge) {
        return this.id === hyperedge.id;
    }
}