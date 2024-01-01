export default class Hypergraph {
    constructor(hyperedges) {
        this.hyperedges = new Set();
        this.nodes = new Set();

        this.load(hyperedges);
    }

    load(hyperedges = []) {
        this.hyperedges = new Set(hyperedges);
        this.nodes = new Set();

        for (const hyperedge of hyperedges) {
            for (const node of hyperedge) {
                this.nodes.add(node);
            }
        }
    }

    add(node_or_hyperedge) {
        if (Array.isArray(node_or_hyperedge)) {
            this.hyperedges.add(node_or_hyperedge);
            for (const node of node_or_hyperedge) {
                this.nodes.add(node);
            }

        } else {
            this.nodes.add(node_or_hyperedge);
        }
    }
}