import Hyperedge from "./hyperedge";
import Node from "./node";

export default class Hypergraph {
    static INTERWINGLE = {
        ISOLATED: 0,
        CONFLUENCE: 1,
        FUSION: 2,
        BRIDGE: 3
    };

    constructor(hyperedges = [], options = {}) {
        this.options = options;

        this._nodes = new Map();
        this._hyperedges = new Map();

        // this._links = new Map();

        this.endSymbolIndex = new Map();
        this.symbolIndex = new Map();
        this.masqueradeIndex = new Map();
        this.nodeEdgeIndex = new Map();

        this.addHyperedges(hyperedges);
    }

    get nodes() {
        return Array.from(this._nodes.values());
    }

    get links() {
        // return Array.from(this._links.values());
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

    get hyperedges() {
        return Array.from(this._hyperedges.values());
    }

    has(input) {
        if (input instanceof Node) {
            return !!this._nodes.has(input.id);
        } else if (typeof input === "string") {
            return !!this.symbolIndex.has(input);
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

    graphData() {
        throw "BOOM"
        return {
            nodes: Array.from(this._nodes.values()),
            links: Array.from(this._links.values())
        };
    }

    searchGraphData(queries = []) {
        const graphData = {
            nodes: new Map(),
            links: new Map()
        };

        for (const edge of queries) {
            if (edge.length === 1) {
                const nodes = this.symbolIndex.get(edge[0]) || [];
                for (const node of nodes.values()) {
                    this.findHyperedgeGraphData(node.hyperedge, graphData.nodes, graphData.links);
                }
            } else {
                const subsetID = edge.join("->");
                for (const link of this._links.values()) {
                    if (link.hyperedgeID.indexOf(subsetID) === -1) continue;
                    const hyperedge = this._hyperedges.get(link.hyperedgeID);
                    this.findHyperedgeGraphData(hyperedge, graphData.nodes, graphData.links);
                }
            }
        }

        if (this.isFusion) {
            this.crawlMasqueradeGraphData(graphData);
        }

        if (this.isBridge) {
            this.crawlBridgeGraphData(graphData);
        }

        this.verifyGraphData(graphData);

        return {
            nodes: Array.from(graphData.nodes.values()),
            links: Array.from(graphData.links.values())
        };
    }

    verifyGraphData(graphData) {
        const { nodes, links } = graphData;
        const nodeIDs = new Set(nodes.keys());

        for (const link of links.values()) {
            if (!nodeIDs.has(link.source)) {
                console.log("MISSING SOURCE", link);
                throw "ERRR";
            } else if (!nodeIDs.has(link.target)) {
                console.log("MISSING TARGET", link);
                throw "ERRR";
            }
        }
    }

    findHyperedgeGraphData(hyperedge, nodes, links) {
        const targets = new Set();
        for (const node of hyperedge.nodes.values()) {
            targets.add(node.id);
        }

        for (let node of hyperedge.nodes) {
            node = node.resolvedNode();
            nodes.set(node.id, this._nodes.get(node.id));
        }

        for (const link of this._links.values()) {
            if (link.hyperedgeID === hyperedge.id) {
                links.set(link.id, link);
            } else if (this.isBridge && targets.has(link.target)) {
                links.set(link.id, link);
            }
        }
    }

    crawlMasqueradeGraphData(graphData) {
        const nodes = Array.from(graphData.nodes.values());
        for (const node of nodes) {
            for (const link of this._links.values()) {
                if (link.source === node.id || link.target === node.id) {
                    if (this.isBridge && link.bridge) {
                        const bridgeNode = this._nodes.get(link.source);
                        graphData.nodes.set(bridgeNode.id, bridgeNode);
                        graphData.links.set(link.id, link);
                    } else {
                        const hyperedge = this._hyperedges.get(link.hyperedgeID);
                        this.findHyperedgeGraphData(hyperedge, graphData.nodes, graphData.links);
                    }
                }
            }
        }
    }

    // TODO: could be more efficient by not updating stuff we've already updated
    crawlBridgeGraphData(graphData) {
        const nodes = Array.from(graphData.nodes.values());
        for (const node of nodes) {
            if (node.bridge) {
                for (const link of this._links.values()) {
                    if (link.source === node.id) {
                        const hyperedgeID = this.nodeEdgeIndex.get(link.target);
                        const hyperedge = this._hyperedges.get(hyperedgeID);
                        this.findHyperedgeGraphData(hyperedge, graphData.nodes, graphData.links);
                    }
                }
            }
        }
    }

    updateIndex(index, node) {
        if (!index.has(node.symbol)) {
            index.set(node.symbol, []);
        }

        index.get(node.symbol).push(node);
    }

    create(input, object = null) {
        // this.needsSyncPagerank = true;
        if (Array.isArray(input)) { return new Hyperedge(input, this) }
        return new Node(input);
    }

    add(node_or_edge, object = null) {
        if (node_or_edge instanceof Node) {
            this.addNode(node_or_edge);
            return node_or_edge;
        } else if (typeof node_or_edge === "string") {
            const node = new Node(node_or_edge, null, null, this, object);
            this.addNode(node);
            return node;
        } else if (node_or_edge instanceof Hyperedge) {
            this.addHyperedge(node_or_edge);
            return node_or_edge
        } else if (Array.isArray(node_or_edge)) {
            const edge = new Hyperedge(node_or_edge, this);
            this.addHyperedge(edge);
            return edge;
        }
    }

    addNode(node) {
        this._nodes.set(node.id, node);

        this.updateIndex(this.symbolIndex, node);

        if (node.isEnd) {
            this.updateIndex(this.endSymbolIndex, node);
        }

        if (node.hyperedge) {
            this.nodeEdgeIndex.set(node.id, node.hyperedge.id);
        }

        // node.updateGraphData();
    }

    addHyperedge(edge) {
        this._hyperedges.set(edge.id, edge);
        for (const node of edge.nodes) {
            this.addNode(node);
        }
    }

    addHyperedges(hyperedges) {
        for (const hyperedge of hyperedges) {
            this.addHyperedge(hyperedge);
        }
    }
}

/*
import csv from "papaparse"
// import merge from "lodash/merge.js";

import Node from "./node.js";
import Hyperedge from "./hyperedge.js";

import { calculatePageRank, pageRank } from "./pagerank.js";

// TODO: Need to move interwingle parameter here....

// import { suggest } from "./llm.js";
// import VectorDB from "@themaximalist/vectordb.js"

export default class Hypergraph {
    static INTERWINGLE = {
        ISOLATED: 0,
        CONFLUENCE: 1,
        FUSION: 2,
        BRIDGE: 3
    };

    constructor(hyperedges = [], options = {}) {
        this.options = options;
        if (typeof this.options.interwingle === "undefined") this.options.interwingle = Hypergraph.INTERWINGLE.ISOLATED;

        this._nodes = new Map();
        this._hyperedges = new Map();

        this.needsSyncPagerank = false;

        for (const hyperedge of hyperedges) {
            this.add(hyperedge);
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

    get nodes() {
        const nodes = {};
        for (const node of this._nodes.values()) {
            nodes[node.id] = node;
        }

        for (const hyperedge of this._hyperedges.values()) {
            for (const node of hyperedge.nodes) {
                nodes[node.id] = node;
            }
        }

        return Object.values(nodes);
    }

    get hyperedges() {
        return Array.from(this._hyperedges.values());
    }

    get isLoaded() {
        return this.hyperedges.filter(hyperedge => !hyperedge.isLoaded).length === 0;
    }

    get all() {
        // this could be managed more efficiently by a better data structure
        // basically we manage everything through hyperedges
        // but sometimes nodes have no hyperedge...so to return everything we have to check
        const unique = new Set();
        const hypergraph = [];
        for (const hyperedge of this.hyperedges) {
            hypergraph.push(hyperedge.symbols);
            for (const symbol of hyperedge.symbols) {
                unique.add(symbol);
            }
        }

        for (const node of this.nodes) {
            if (!unique.has(node.symbol)) {
                hypergraph.push([node.symbol]);
            }
        }

        return hypergraph;
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

    add(input, object = null) {
        const node_or_edge = this.create(input, object);
        if (node_or_edge instanceof Node) {
            this._nodes.set(node_or_edge.id, node_or_edge);
        } else if (node_or_edge instanceof Hyperedge) {
            this._hyperedges.set(node_or_edge.id, node_or_edge);
            for (const node of node_or_edge.nodes) {
                this._nodes.set(node.id, node);
            }
        }

        return node_or_edge;
    }

    create(input, object = null) {
        this.needsSyncPagerank = true;
        if (Array.isArray(input)) { return Hyperedge.create(input, this) }
        return Node.create(input, this, object);
    }

    get needsSync() {
        return this.needsSyncPagerank;
    }

    sync() {
        this.syncPagerank();
    }

    syncPagerank() {
        this.pageranks = calculatePageRank(this);
        this.needsSyncPagerank = false;
    }

    pagerank(symbol) {
        if (typeof symbol === "string") {
            symbol = this.get(symbol);
        }

        if (!symbol instanceof Node) { return 0 }

        return pageRank(this, symbol);
    }

    static parse(input, options = {}) {
        const hyperedges = csv.parse(input, options.parse || {}).data;
        return new Hypergraph(hyperedges, options);
    }
}

class Hypergraph1 {
    constructor(options = {}) {
        if (typeof options.vectordb === "undefined") { options.vectordb = {} }
        if (typeof options.llm === "undefined") { options.llm = {} }

        this.options = options;
        this.vectordb = new VectorDB(options.vectordb);
        this._nodes = {};
        this._hyperedges = {};
        this.pageranks = {};
    }

    static async load(hyperedges = [], options = {}) {
        const graph = new Hypergraph(options);
        for (const hyperedge of hyperedges) {
            await graph.add(hyperedge, true); // bulk
        }

        graph.pageranks = calculatePageRank(graph);

        return graph;
    }

    static async parse(input, options = {}) {
        const hyperedges = csv.parse(input, options.parse || {}).data;
        return await Hypergraph.load(hyperedges, options);
    }



    pagerank(symbol) {
        if (typeof symbol === "string") {
            symbol = Node.get(symbol, this);
        }

        if (!symbol instanceof Node) { return 0 }

        return pageRank(this, symbol);
    }

    async add(input, bulk = false) {
        try {
            if (Array.isArray(input)) { return await Hyperedge.add(input, this) }
            return await Node.add(input, this);
        } finally {
            if (!bulk) {
                this.pageranks = calculatePageRank(this);
            }
        }
    }

    async create(input) {
        if (Array.isArray(input)) { return await Hyperedge.create(input, this) }
        return await Node.create(input, this);
    }

    get nodes() {
        return Object.values(this._nodes);
    }

    get hyperedges() {
        return Object.values(this._hyperedges);
    }


    async similar(node, num = 3, threshold = 1.0) {
        if (typeof node === "string") {
            node = await Node.create(node, this);
        }

        const matches = await this.vectordb.search(node.symbol, num, threshold);
        const results = [];

        for (const { input: symbol, distance } of matches) {
            if (symbol == node.symbol) continue;
            const newNode = await Node.get(symbol, this);
            if (newNode) results.push({ distance, node: newNode });
        }

        results.sort((a, b) => a.distance - b.distance);

        return results;
    }

    async suggest(options = {}) {
        const args = await Promise.all(Array.from(arguments).map(arg => Node.create(arg, this)));
        if (args.length === 0) { return [] }

        const combined_symbol = args.map(args => args.symbol).join(" and ");
        const llmOptions = merge(this.options.llm, options);
        const symbols = await suggest(combined_symbol, llmOptions);

        const nodes = await Promise.all(symbols.map(symbol => Node.create(symbol, this)));
        return nodes.filter(node => {
            for (const arg of args) {
                if (arg.equal(node)) return false;
            }
            return true;
        });
    }
}

*/