import { suggest } from "./llm.js";
import merge from "lodash/merge.js";

export default class Node {

    constructor(symbol, hypergraph) {
        this.symbol = symbol;
        this.hypergraph = hypergraph;
    }

    id() {
        return Node.id(this.symbol);
    }

    equal(node) {
        if (node instanceof Node) {
            return this.id() === node.id();
        } else if (typeof node === "string") {
            return this.id() === node;
        }

        return false;
    }

    hyperedges() {
        return this.hypergraph.hyperedges.filter(hyperedge => hyperedge.has(this));
    }

    similar(num = 3, threshold = 1.0) {
        return this.hypergraph.similar(this, num, threshold);
    }

    async suggest(options = {}) {
        const llmOptions = merge({}, this.hypergraph.options.llm, options);
        const symbols = await suggest(this.symbol, llmOptions);
        return await Promise.all(symbols.map(symbol => Node.create(symbol, this.hypergraph)));
    }

    static id(symbol) {
        if (symbol instanceof Node) { return symbol.id() }
        if (typeof symbol !== "string") { symbol = String(symbol) }
        if (symbol.indexOf(",") !== -1) { symbol = `"${symbol}"` }
        return `NODE:${symbol}`;
    }

    static get(symbol, hypergraph) {
        const id = Node.id(symbol);
        return hypergraph._nodes[id];
    }

    static async create(symbol, hypergraph) {
        if (symbol instanceof Node) { return symbol }

        const node = new Node(symbol, hypergraph);
        await hypergraph.vectordb.add(String(node.symbol));
        return node;
    }

    static async add(symbol, hypergraph) {
        const node = await Node.create(symbol, hypergraph);
        hypergraph._nodes[node.id()] = node;
        return node;
    }

    static has(symbol, hypergraph) {
        if (typeof symbol === "string") {
            for (const node of hypergraph.nodes) {
                if (node.symbol === symbol) {
                    return true;
                }
            }
        } else if (symbol instanceof Node) {
            for (const node of hypergraph.nodes) {
                if (node.symbol === symbol.symbol) {
                    return true;
                }
            }
        }

        return false;
    }
}
