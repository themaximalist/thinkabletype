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
        this.pageranks = {};
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
                this.addNode(node, true);
            }

            this._hyperedges[hyperedge.id()] = hyperedge;

            this.calculatePageRank();

            return hyperedge;
        } else {
            return this.addNode(input);
        }
    }

    addNode(input, bulk = false) {
        const node = Node.create(input, this);
        if (this.hasNode(node)) {
            return node;
        }

        this._nodes[node.id()] = node;

        if (!bulk) {
            this.calculatePageRank();
        }

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

    calculatePageRank(iterations = 100, dampingFactor = 0.85, precision = 3) {
        // Initialize PageRank for each node
        let pageRanks = {};
        const initialRank = 1 / this.nodes.length;
        this.nodes.forEach(node => {
            pageRanks[node.id()] = initialRank;
        });

        // Iterate PageRank calculation
        for (let i = 0; i < iterations; i++) {
            let newPageRanks = {};

            // Distribute ranks from each node to other nodes via hyperedges
            this.nodes.forEach(node => {
                let outboundRank = 0;

                const hyperedges = node.hyperedges();
                hyperedges.forEach(hyperedge => {
                    // equally distribute the rank among all nodes in the hyperedge
                    const share = pageRanks[node.id()] / hyperedge.nodes.length;
                    hyperedge.nodes.forEach(neighbor => {
                        if (!node.equal(neighbor)) {
                            if (!newPageRanks[neighbor.id()]) {
                                newPageRanks[neighbor.id()] = 0;
                            }
                            newPageRanks[neighbor.id()] += share;
                        }
                    });
                });
            });

            // Apply damping factor and update ranks
            this.nodes.forEach(node => {
                const rankFromSelf = (1 - dampingFactor) / this.nodes.length;
                const rankFromOthers = dampingFactor * (newPageRanks[node.id()] || 0);
                pageRanks[node.id()] = rankFromSelf + rankFromOthers;
            });
        }

        // Round the PageRanks to the desired precision
        Object.keys(pageRanks).forEach(nodeId => {
            pageRanks[nodeId] = parseFloat(pageRanks[nodeId].toFixed(precision));
        });

        this.pageranks = pageRanks;

        return pageRanks;
    }

    pagerank(nodeId, precision = 3) {
        // Ensure the PageRanks are calculated
        const pageRanks = this.calculatePageRank(100, 0.85, precision);

        // Object to hold contributions
        let contributions = {};

        this.nodes.forEach(node => {
            // Initialize contribution from each node
            contributions[node.id()] = 0;

            // Calculate contributions from hyperedges
            const hyperedges = node.hyperedges();
            hyperedges.forEach(hyperedge => {
                if (hyperedge.hasNode(nodeId)) {
                    // Distribute the rank equally among nodes in the hyperedge
                    const share = pageRanks[node.id()] / hyperedge.nodes.length;
                    contributions[node.id()] += share;
                }
            });
        });

        // Round off the contribution values
        Object.keys(contributions).forEach(nodeId => {
            contributions[nodeId] = parseFloat(contributions[nodeId].toFixed(precision));
        });

        return contributions;
    }


}
