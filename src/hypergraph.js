import Hyperedge from "./Hyperedge";
import * as utils from "./utils";
import ForceGraph from "./ForceGraph";

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

        const hyperedges = options.hyperedges || [];
        for (const hyperedge of hyperedges) {
            this.add.apply(this, hyperedge);
        }
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
        const hyperedge = new Hyperedge(symbols);
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

    /*
    constructor(options = {}) {
        this._nodes = new Map();
        this._hyperedges = new Map();
        this.forceGraph = new ForceGraph(this);

        const hyperedges = options.hyperedges || [];
        for (const hyperedge of hyperedges) {
            this.add(hyperedge);
        }
    }

    get nodes() {
        return Array.from(this._nodes.values());
    }

    get hyperedges() {
        return Array.from(this._hyperedges.values());
    }

    add(node_or_edge) {
        if (node_or_edge instanceof Node) {
            this._nodes.set(node_or_edge.id, node_or_edge);
        } else if (node_or_edge instanceof Hyperedge) {
            this._hyperedges.set(node_or_edge.id, node_or_edge);
            for (const node of node_or_edge.nodes) {
                this._nodes.set(node.id, node);
            }
        } else if (Array.isArray(node_or_edge)) {
            const edge = new Hyperedge(node_or_edge, this);
            this.add(edge);
        } else {
            throw new Error("Invalid input");
        }
    }

    graphData() {
        return this.forceGraph.graphData();
    }
    */
}

/*
function isNode(input) {
    return input instanceof Node || typeof input === "string";
}

function isHyperedge(input) {
    return input instanceof Hyperedge || Array.isArray(input);
}

class Nodes {
    constructor(hypergraph) {
        this.hypergraph = hypergraph;
        this.nodes = new Map();
    }

    get all() {
        return Array.from(this.nodes.values());
    }

    create(input, opts = {}) {
        if (input instanceof Node) return input;
        const options = Object.assign({}, opts, {
            hypergraph: this.hypergraph
        });
        return new Node(input, options);
    }
}

class Hyperedges {
    constructor(hypergraph) {
        this.hypergraph = hypergraph;
        this.hyperedges = new Map();
        this.index = 0;
    }

    get newIndex() {
        this.index++;
        return this.index;
    }

    get all() {
        return Array.from(this.hyperedges.values());
    }

    create(input) {
        console.log("CREATE", input);
        if (input instanceof Hyperedge) return input;
        return new Hyperedge(input, {
            index: this.newIndex,
            hypergraph: this.hypergraph
        });
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
            this.options.interwingle = Hypergraph.INTERWINGLE.CONFLUENCE;
        }

        this.nodes = new Nodes(this);
        this.hyperedges = new Hyperedges(this);
    }

    create() {
        if (isNode(arguments[0])) {
            return this.nodes.create.apply(this.nodes, arguments);
        } else if (isHyperedge(arguments[0])) {
            return this.hyperedges.create.apply(this.hyperedges, arguments);
        }

        throw new Error("Invalid input");
    }

    get nodes() {
        return Array.from(this._nodes.values());
    }

    get hyperedges() {
        return Array.from(this._hyperedges.values());
    }

    has(input) {
        if (input instanceof Node) {
            return !!this._nodes.has(input.id);
        } else if (typeof input === "string") {
            return !!this._nodes.has(input);
        } else if (input instanceof Hyperedge) {
            return this._hyperedges.has(input.id);
        } else if (Array.isArray(input)) {
            return this._hyperedges.has(Hyperedge.id(input));
        }

        return null;
    }

    get(input) {
        if (input instanceof Node) {
            return this._nodes.get(input.id);
        } else if (typeof input === "string") {
            return this._nodes.get(input)
        } else if (input instanceof Hyperedge) {
            return this._hyperedges.get(input.id);
        } else if (Array.isArray(input)) {
            return this._hyperedges.get(Hyperedge.id(input));
        }

        return null;
    }

    create(input, object = null) {
        if (Array.isArray(input)) { return new Hyperedge(input, this) }
        return new Node(input, { object });
    }

    add(node_or_edge, object = null) {
        if (node_or_edge instanceof Node) {
            return this.addNode(node_or_edge);
        } else if (typeof node_or_edge === "string") {
            const node = new Node(node_or_edge, {
                hypertype: this,
                object
            });

            return this.addNode(node);
        } else if (node_or_edge instanceof Hyperedge) {
            return this.addHyperedge(node_or_edge);
        } else if (Array.isArray(node_or_edge)) {
            const edge = new Hyperedge(node_or_edge, this);
            return this.addHyperedge(edge);
        }
    }

    addNode(node) {
        this._nodes.set(node.id, node);

        if (node.hyperedge) {
            this.nodeEdgeIndex.set(node.id, node.hyperedge.id);
        }

        return node;
    }

    addHyperedge(edge) {
        this._hyperedges.set(edge.id, edge);
        for (const node of edge.nodes) {
            this.addNode(node);
        }
        return edge;
    }

    addHyperedges(hyperedges) {
        for (const hyperedge of hyperedges) {
            this.addHyperedge(hyperedge);
        }
    }

}

    */