const uuid = require("uuid").v4;

export class Node {
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

    static create(input, hypergraph) {
        if (input instanceof Node) {
            return input;
        }

        input = String(input);

        return new Node(input, hypergraph);
    }

}

export class Hyperedge {
    constructor(nodes, hypergraph) {
        this.nodes = nodes;
        this.hypergraph = hypergraph;
    }

    id() {
        return this.nodes.map(node => node.id()).join(" -> ");
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

export class Hypergraph {
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
        if (Array.isArray(input)) {
            input = Hyperedge.create(input, this);
        }

        if (!input instanceof Hyperedge) {
            return null;
        }

        const hyperedge = this._hyperedges[input.id()];
        if (hyperedge) {
            return hyperedge;
        }

        return input;
    }

    getNode(input) {
        if (typeof input === "string") {
            input = Node.create(input, this);
        }

        if (!input instanceof Node) {
            return false;
        }

        return this._nodes[input.id()];
    }

    add(input) {
        if (Array.isArray(input)) {
            const hyperedge = Hyperedge.create(input, this);

            for (const node of hyperedge.nodes) {
                this.addNode(node);
            }

            this._hyperedges[hyperedge.id()] = hyperedge;
            return hyperedge;
        } else {
            return this.addNode(input);
        }
    }

    addNode(input) {
        const node = Node.create(input, this);
        if (this.hasNode(node)) {
            return node;
        }

        this._nodes[node.id()] = node;
        return node;
    }

    has(input) {
        if (Array.isArray(input)) {
            return this.hasHyperedge(input);
        } else {
            return this.hasNode(input);
        }
    }

    hasNode(input) {
        if (typeof input === "string") {
            input = Node.create(input, this);
        }

        return this._nodes[input.id()] !== undefined;
    }

    hasHyperedge(input) {
        if (Array.isArray(input)) {
            input = Hyperedge.create(input, this);
        }

        for (const hyperedge of this.hyperedges) {
            if (hyperedge.hasHyperedge(input)) {
                return true;
            }
        }

        return false;
    }

    load(hyperedges = []) {
        this.reset();
        for (const hyperedge of hyperedges) {
            this.add(hyperedge);
        }
    }

    static parse(input) {
        const hyperedges = input.split("\n").map(line => line.split(" -> "));
        return new Hypergraph(hyperedges);
    }
}
