import csv from "papaparse"
import VectorDB from "@themaximalist/vectordb.js"

import Node from "./node.js";
import Hyperedge from "./hyperedge.js";
import { calculatePageRank, pageRank } from "./pagerank.js";

export default class Hypergraph {
    constructor() {
        this.vectordb = new VectorDB();
        this._nodes = {};
        this._hyperedges = {};
        this.pageranks = {};
    }

    static async load(hyperedges = []) {
        const graph = new Hypergraph();
        for (const hyperedge of hyperedges) {
            await graph.add(hyperedge);
        }

        this.pageranks = calculatePageRank(graph);

        return graph;
    }

    static async parse(input) {
        const hyperedges = csv.parse(input).data;
        return await Hypergraph.load(hyperedges);
    }

    get(input) {
        if (Array.isArray(input)) { return Hyperedge.get(input, this) }
        return Node.get(input, this);
    }

    has(input) {
        if (Array.isArray(input)) { return Hyperedge.has(input, this) }
        return Node.has(input, this);
    }

    pagerank(symbol) {
        if (typeof symbol === "string") {
            symbol = Node.get(symbol, this);
        }

        if (!symbol instanceof Node) { return 0 }

        return pageRank(this, symbol);
    }

    async add(input) {
        try {
            if (Array.isArray(input)) { return await Hyperedge.add(input, this) }
            return await Node.add(input, this);
        } finally {
            this.pageranks = calculatePageRank(this);
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
}