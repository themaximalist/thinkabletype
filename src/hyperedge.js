import Node from "./node.js";
import merge from "lodash/merge.js";

import { suggest } from "./llm.js";

export default class Hyperedge {
    constructor(nodes, hypergraph) {
        this.nodes = nodes;
        this.hypergraph = hypergraph;
    }

    id() {
        return Hyperedge.id(this.nodes);
    }

    get symbols() {
        return this.nodes.map(node => node.symbol);
    }

    get symbol() {
        return Hyperedge.symbol(this.nodes);
    }

    has(node_or_edge) {
        if (node_or_edge instanceof Node) {
            return this.symbols.indexOf(node_or_edge.symbol) !== -1;
        } else if (typeof node_or_edge === "string") {
            return this.symbols.indexOf(node_or_edge) !== -1;
        } else if (node_or_edge instanceof Hyperedge) {
            const id = node_or_edge.id();
            return this.id().indexOf(id) !== -1;
        } else if (Array.isArray(node_or_edge)) {
            const id = Hyperedge.id(node_or_edge);
            return this.id().indexOf(id) !== -1;
        }

        return false;
    }

    equal(hyperedge) {
        if (hyperedge instanceof Hyperedge) {
            return this.id() === hyperedge.id();
        } else if (Array.isArray(hyperedge)) {
            return this.id() === Hyperedge.id(hyperedge);
        }

        return false;
    }

    hyperedges() {
        return Object.keys(this.hypergraph._hyperedges).filter(hyperedge => hyperedge.indexOf(this.id()) !== -1);
    }

    async suggest(options = {}) {
        const llmOptions = merge({}, this.hypergraph.options.llm, options);
        const symbols = await suggest(this.symbol, llmOptions);
        const nodes = await Promise.all(symbols.map(symbol => Node.create(symbol, this.hypergraph)));
        return nodes.filter(node => {
            if (this.has(node)) return false;
            if (node.symbol === this.symbol) return false;
            return true;
        });
    }

    async similar(num = 3, threshold = 1.0) {
        const matches = await this.hypergraph.vectordb.search(this.symbol, num, threshold);

        const results = [];
        for (const match of matches) {
            if (match.input == this.symbol) continue;
            for (const hyperedge of this.hypergraph.hyperedges) {
                if (hyperedge.symbol == match.input) {
                    results.push({ distance: match.distance, hyperedge });
                }
            }
        }

        results.sort((a, b) => a.distance - b.distance);

        return results;
    }

    static id(nodes) {
        return nodes.map(node => Node.id(node)).join(",");
    }

    static symbol(nodes) {
        return nodes.map(node => (node instanceof Node ? node.symbol : symbol)).join(" ");
    }

    static has(nodes, hypergraph) {
        const id = Hyperedge.id(nodes);
        const hyperedge_ids = Object.keys(hypergraph._hyperedges);
        for (const hyperedge_id of hyperedge_ids) {
            if (hyperedge_id.indexOf(id) !== -1) {
                return true;
            }
        }

        return false;
    }

    static get(nodes, hypergraph) {
        const id = Hyperedge.id(nodes);
        let hyperedge = hypergraph._hyperedges[id];

        // full match
        if (hyperedge) {
            return hyperedge;
        }

        // partial match
        hyperedge = [];
        for (const n of nodes) {
            const node = Node.get(n, hypergraph);
            if (!node) { return null }
            hyperedge.push(node);
        }

        return new Hyperedge(hyperedge, hypergraph);
    }

    static async add(nodes, hypergraph) {
        const hyperedge = await Hyperedge.create(nodes, hypergraph);
        for (const node of hyperedge.nodes) {
            await Node.add(node, hypergraph);
        }

        hypergraph._hyperedges[hyperedge.id()] = hyperedge;

        return hyperedge;
    }

    static async create(nodes, hypergraph) {
        if (nodes instanceof Hyperedge) { return hyperedge }

        const edge = await Promise.all(nodes.map(node => Node.create(node, hypergraph)));
        const hyperedge = new Hyperedge(edge, hypergraph);

        await hypergraph.vectordb.add(hyperedge.symbol);
        return hyperedge;
    }
}
