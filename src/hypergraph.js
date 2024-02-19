import Hyperedge from "./Hyperedge.js";
import * as utils from "./utils.js";
import ForceGraph from "./ForceGraph.js";

export default class Hypergraph {
    static INTERWINGLE = {
        ISOLATED: 0,
        CONFLUENCE: 1,
        FUSION: 2,
        BRIDGE: 3
    };

    constructor(options = {}) {
        this.options = options;
        this.interwingle = (typeof this.options.interwingle === "undefined") ? Hypergraph.INTERWINGLE.ISOLATED : this.options.interwingle;

        this.hyperedges = [];
        this.forceGraph = new ForceGraph(this);

        this.addHyperedges(options.hyperedges || []);
    }

    addHyperedges(hyperedges = []) {
        for (const hyperedge of hyperedges) {
            this.add.apply(this, hyperedge);
        }
    }

    get symbols() {
        const symbols = new Map();
        for (const hyperedge of this.hyperedges) {
            for (const symbol of hyperedge.symbols) {
                symbols.set(symbol, symbol);
            }
        }

        return Array.from(symbols.values());
    }

    get isIsolated() {
        return this.interwingle === Hypergraph.INTERWINGLE.ISOLATED;
    }

    get isConfluence() {
        return this.interwingle >= Hypergraph.INTERWINGLE.CONFLUENCE;
    }

    get isFusion() {
        return this.interwingle >= Hypergraph.INTERWINGLE.FUSION;
    }

    get isBridge() {
        return this.interwingle >= Hypergraph.INTERWINGLE.BRIDGE;
    }

    add() {
        const symbols = Array.from(arguments);
        const hyperedge = new Hyperedge(symbols, this);
        this.hyperedges.push(hyperedge);
        return hyperedge;
    }

    get() {
        const symbols = Array.from(arguments);
        for (const hyperedge of this.hyperedges) {
            if (utils.arraysEqual(hyperedge.symbols, symbols)) {
                return hyperedge;
            }
        }

        return null;
    }

    graphData() {
        const hyperedges = this.filter(...arguments);
        return this.forceGraph.graphData(hyperedges);
    }

    has() {
        return this.filter.apply(this, arguments).length > 0;
    }

    filter() {
        if (arguments.length === 0) return [];

        const hyperedges = utils.hyperedgesFromArguments(...arguments);

        const matches = [];
        for (const hyperedge of hyperedges) {
            for (const edge of this.hyperedges) {
                if (edge.has(hyperedge)) {
                    matches.push(edge);
                }
            }
        }

        return matches;
    }

    reset() {
        this.options.interwingle = Hypergraph.INTERWINGLE.ISOLATED;
        this.hyperedges = [];
    }

    remove() {
        const edge = this.get(...arguments);
        this.hyperedges.splice(this.hyperedges.indexOf(edge), 1);
        return true;
    }
}