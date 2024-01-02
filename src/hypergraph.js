const uuidv4 = require("uuid/v4");

class Node {
    constructor(node) {
        this.node = node;
        this.uuid = uuidv4();
    }
}

export default class Hypergraph {
    constructor(hyperedges) {
        this.reset();
        this.load(hyperedges);
    }

    get hyperedges() {
        return Object.values(this._hyperedges);
    }

    reset() {
        this._hyperedges = {};
        this.nodes = new Set();
    }

    load(hyperedges = []) {
        this.reset();

        for (const hyperedge of hyperedges) {
            this.addHyperedge(hyperedge);
        }
    }

    get(node_or_hyperedge) {
        if (Array.isArray(node_or_hyperedge)) {
            return this._hyperedges[node_or_hyperedge];
        } else {
            return this.nodes[node_or_hyperedge];
        }
    }

    has(node_or_hyperedge) {
        if (Array.isArray(node_or_hyperedge)) {
            return this._hyperedges[node_or_hyperedge] !== undefined;
        } else {
            return this.nodes.has(node_or_hyperedge);
        }
    }

    add(node_or_hyperedge) {
        if (Array.isArray(node_or_hyperedge)) {
            this.addHyperedge(node_or_hyperedge);
        } else {
            this.addNode(node_or_hyperedge);
        }
    }

    addNode(node) {
        this.nodes.add(node);
    }

    addHyperedge(hyperedge) {
        for (const node of hyperedge) {
            this.addNode(node);
        }

        this._hyperedges[hyperedge] = hyperedge;
    }

    /*
    constructor(hyperedges) {
        this.hyperedges = new Set();
        this.nodes = new Set();

        this.load(hyperedges);
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
    */
}