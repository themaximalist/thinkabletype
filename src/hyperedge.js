import Node from "./node.js";

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

    static id(nodes) {
        return nodes.map(node => Node.id(node)).join(",");
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

    static async create(hyperedge, hypergraph) {
        if (hyperedge instanceof Hyperedge) { return hyperedge }

        const nodes = await Promise.all(hyperedge.map(node => Node.create(node, hypergraph)));
        return new Hyperedge(nodes, hypergraph);
    }
}

class HyperedgeBak {

    has(node_or_edge) {
        if (node_or_edge instanceof Node || typeof node_or_edge === "string") {
            return this.hasNode(node_or_edge);
        }

        return this.hasHyperedge(node_or_edge);
    }

    hasNode(node_or_str) {
        for (const node of this.nodes) {
            if (node.equal(node_or_str)) {
                return true;
            }
        }

        return false;
    }

    hasHyperedge(hyperedge) {
        if (Array.isArray(hyperedge)) {
            hyperedge = Hyperedge.create(hyperedge, this.hypergraph);
        }

        if (!hyperedge instanceof Hyperedge) {
            return false;
        }

        return this.id().indexOf(hyperedge.id()) !== -1;
    }

    hyperedges() {
        return this.hypergraph.hyperedges.filter(hyperedge => hyperedge.hasHyperedge(this));
    }
}
