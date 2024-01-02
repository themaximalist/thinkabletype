const uuid = require("uuid").v4;

class Node {
    constructor(node, hypergraph) {
        this.hypergraph = hypergraph;
        this.node = node;
    }

    id() {
        return this.node;
    }

    equal(node_or_str) {
        if (node_or_str instanceof Node) {
            return this.id() === node_or_str.id();
        } else if (typeof node_or_str === "string") {
            return this.id() === node_or_str;
        }

        return false;
    }

    hyperedges() {
        return this.hypergraph.hyperedges.filter(hyperedge => hyperedge.has(this));
    }

}

class Hyperedge {
    constructor(nodes, hypergraph) {
        this.nodes = nodes;
    }

    id() {
        return this.nodes.map(node => node.id()).join("->");
    }

    has(node_or_edge) {
        if (node_or_edge instanceof Node || typeof node_or_edge === "string") {
            for (const node of this.nodes) {
                if (node.equal(node_or_edge)) {
                    return true;
                }
            }
        } else if (node_or_edge instanceof Hyperedge) {
            throw "not implemented"
        }

        return false;
    }

    equal(hyperedge) {
        return this.id() === hyperedge.id();
    }
}

export default class Hypergraph {
    constructor(hyperedges) {
        this.reset();
        this.load(hyperedges);
    }

    reset() {
        this._nodes = {};
        this._hyperedges = {};
    }

    get nodes() {
        return Object.values(this._nodes);
    }

    get hyperedges() {
        return Object.values(this._hyperedges);
    }

    get(input) {
        if (Array.isArray(input)) {
            return this.getHyperedge(input);
        } else {
            return this.getNode(input);
        }
    }

    getHyperedge(input) {
        if (input instanceof Hyperedge) {
            return this._hyperedges[input.nodes.map(node => node.node)];
        } else {
            return this._hyperedges[input];
        }
    }

    getNode(input) {
        if (input instanceof Node) {
            return this._nodes[input.node];
        } else {
            return this._nodes[input];
        }
    }

    add(input) {
        if (Array.isArray(input)) {
            return this.addHyperedge(input);
        } else {
            return this.addNode(input);
        }
    }

    addNode(input) {
        // check if node already exists or node is of type Node
        if (input instanceof Node) {
            return input;
        } else if (this.hasNode(input)) {
            return this._nodes[input];
        }

        const node = new Node(input, this);
        this._nodes[input] = node;
        return node;
    }

    addHyperedge(input) {
        const nodes = input.map(node => this.addNode(node));
        const hyperedge = new Hyperedge(nodes, this);
        this._hyperedges[input] = hyperedge;
        return hyperedge;
    }

    has(input) {
        if (Array.isArray(input)) {
            return this.hasHyperedge(input);
        } else {
            return this.hasNode(input);
        }
    }

    hasNode(input) {
        if (input instanceof Node) {
            return this._nodes[input.node] !== undefined;
        } else {
            return this._nodes[input] !== undefined;
        }
    }

    hasHyperedge(input) {
        if (input instanceof Hyperedge) {
            return this._hyperedges[input.nodes.map(node => node.node)] !== undefined;
        } else {
            return this._hyperedges[input] !== undefined;
        }
    }

    load(hyperedges = []) {
        this.reset();
        for (const hyperedge of hyperedges) {
            this.add(hyperedge);
        }
    }
}
