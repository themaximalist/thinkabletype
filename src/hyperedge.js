import Node from "./node.js";

export default class Hyperedge {
    constructor(nodes, hypergraph) {
        this.nodes = nodes;
        this.hypergraph = hypergraph;
    }

    get loaded() {
        return this.nodes.every(node => node.loaded);
    }

    async waitForLoaded() {
        while (!this.loaded) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    id() {
        return this.nodes.map(node => node.id()).join(",");
    }

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

    equal(hyperedge) {
        return this.id() === hyperedge.id();
    }

    hyperedges() {
        return this.hypergraph.hyperedges.filter(hyperedge => hyperedge.hasHyperedge(this));
    }

    static create(input, hypergraph) {
        const nodes = input.map(node => Node.create(node, hypergraph));
        return new Hyperedge(nodes, hypergraph);
    }
}
