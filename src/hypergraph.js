import Hyperedge from "./Hyperedge.js";
import * as utils from "./utils.js";
import ForceGraph from "./ForceGraph.js";

function crawlGraphData(hyperedges, graphData) {
    const hyperedgeIDs = new Set(hyperedges.map(hyperedge => hyperedge.id));
    const nodeIDs = new Set();

    const nodes = new Map();
    const links = new Map();

    for (const link of graphData.links) {
        const hyperedgeID = link._meta.hyperedgeID;
        if (hyperedgeIDs.has(hyperedgeID)) {
            links.set(link.id, link);
            nodeIDs.add(link.source);
            nodeIDs.add(link.target);
        }
    }

    for (const node of graphData.nodes) {
        if (nodeIDs.has(node.id)) {
            nodes.set(node.id, node);
        }
    }

    return {
        nodes: Array.from(nodes.values()),
        links: Array.from(links.values())
    }
}

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

    filterGraphData() {
        const hyperedges = this.filter.apply(this, arguments);
        const graphData = this.graphData();

        return crawlGraphData(hyperedges, graphData);
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