import csv from "papaparse"
import merge from "lodash/merge.js";

import Node from "./node.js";
import Hyperedge from "./hyperedge.js";
import { calculatePageRank, pageRank } from "./pagerank.js";
import { suggest } from "./llm.js";
import VectorDB from "@themaximalist/vectordb.js"

export default class Hypergraph {
    constructor(options = {}) {
        if (typeof options.vectordb === "undefined") { options.vectordb = {} }
        if (typeof options.llm === "undefined") { options.llm = {} }

        this.options = options;
        this.vectordb = new VectorDB(options.vectordbOptions);
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
        const hyperedges = csv.parse(input).data;
        return await Hypergraph.load(hyperedges, options);
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