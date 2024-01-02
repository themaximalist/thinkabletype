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
        if (typeof input === "string") {
            return new Node(input, hypergraph);
        } else if (input instanceof Node) {
            return input;
        }

        return null;
    }

}

export class Hyperedge {
    constructor(nodes, hypergraph) {
        this.nodes = nodes;
    }

    id() {
        return this.nodes.map(node => node.id()).join(" -> ");
    }

    has(node_or_edge) {
        if (node_or_edge instanceof Node || typeof node_or_edge === "string") {
            for (const node of this.nodes) {
                if (node.equal(node_or_edge)) {
                    return true;
                }
            }

            return false;
        }

        let hyperedge = null;

        if (node_or_edge instanceof Hyperedge) {
            hyperedge = node_or_edge;
        } else if (Array.isArray(node_or_edge)) {
            hyperedge = new Hyperedge(node_or_edge, this.hypergraph);
        }

        if (!hyperedge) {
            return false;
        }

        return false;
    }


    equal(hyperedge) {
        return this.id() === hyperedge.id();
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

        return this._hyperedges[input.id()];
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
        if (input instanceof Node) {
            return this._nodes[input.node] !== undefined;
        } else {
            return this._nodes[input] !== undefined;
        }
    }

    hasHyperedge(input) {
        if (Array.isArray(input)) {
            input = Hyperedge.create(input, this);
        }

        if (!input instanceof Hyperedge) {
            return false;
        }

        return this._hyperedges[input.id()] !== undefined;
    }

    load(hyperedges = []) {
        this.reset();
        for (const hyperedge of hyperedges) {
            this.add(hyperedge);
        }
    }
}
