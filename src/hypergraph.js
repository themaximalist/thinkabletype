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
        if (typeof this.options.interwingle === "undefined") {
            this.options.interwingle = Hypergraph.INTERWINGLE.ISOLATED;
        }

        this.hyperedges = [];
        this.forceGraph = new ForceGraph(this);

        const hyperedges = options.hyperedges || [];
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
        return this.options.interwingle === Hypergraph.INTERWINGLE.ISOLATED;
    }

    get isConfluence() {
        return this.options.interwingle >= Hypergraph.INTERWINGLE.CONFLUENCE;
    }

    get isFusion() {
        return this.options.interwingle >= Hypergraph.INTERWINGLE.FUSION;
    }

    get isBridge() {
        return this.options.interwingle >= Hypergraph.INTERWINGLE.BRIDGE;
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
        return this.forceGraph.graphData();
    }

    has() {
        return this.filter.apply(this, arguments).length > 0;
    }

    filter() {
        const hyperedges = [];
        for (const hyperedge of this.hyperedges) {
            if (hyperedge.has.apply(hyperedge, arguments)) {
                hyperedges.push(hyperedge);
            }
        }

        return hyperedges;
    }

    reset() {
        this.options.interwingle = Hypergraph.INTERWINGLE.ISOLATED;
        this.hyperedges = [];
    }
}