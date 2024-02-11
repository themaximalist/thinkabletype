import csv from "papaparse"
import Hypergraph from "./Hypergraph.js";

import { calculatePageRank, pageRank } from "./pagerank.js";
// import { suggest } from "./llm.js";
import VectorDB from "@themaximalist/vectordb.js"

export default class HyperType extends Hypergraph {

    constructor(options = {}) {
        super(options);

        this.vectordb = new VectorDB(options.vectordb);

        this.pageranks = {};
        this._synced = {
            pagerank: true,
            embeddings: true,
        };

        if (this.hyperedges.length > 0) {
            this.setUnsynced();
        }
    }

    add() {
        this.setUnsynced();
        return super.add.apply(this, arguments);
    }

    get synced() {
        for (const sync of Object.values(this._synced)) {
            if (!sync) return false;
        }
        return true;
    }

    setUnsynced() {
        const obj = Object.assign({}, this._synced);

        for (const key of Object.keys(obj)) {
            obj[key] = false;
        }
        this._synced = obj;

        return false;
    }

    async sync() {
        await this.syncPagerank();
        await this.syncEmbeddings();
        return this.synced;
    }

    async syncPagerank() {
        if (this._synced.pagerank) return true;
        this.pageranks = await calculatePageRank(this);
        this._synced.pagerank = true;
        return true;
    }

    async syncEmbeddings() {
        if (this._synced.embeddings) return true;

        this._synced.embeddings = true;
        return true;
    }

    pagerank(symbol) {
        return pageRank(this, symbol);
    }


    static parse(input, options = {}) {
        options.hyperedges = csv.parse(input, options.parse || {}).data;
        return new HyperType(options);
    }

    // async similar(node, num = 3, threshold = 1.0) {
    //     if (typeof node === "string") {
    //         node = await Node.create(node, this);
    //     }

    //     const matches = await this.vectordb.search(node.symbol, num, threshold);
    //     const results = [];

    //     for (const { input: symbol, distance } of matches) {
    //         if (symbol == node.symbol) continue;
    //         const newNode = await Node.get(symbol, this);
    //         if (newNode) results.push({ distance, node: newNode });
    //     }

    //     results.sort((a, b) => a.distance - b.distance);

    //     return results;
    // }



    // async suggest(options = {}) {

    //     const args = await Promise.all(Array.from(arguments).map(arg => Node.create(arg, this)));
    //     if (args.length === 0) { return [] }

    //     const combined_symbol = args.map(args => args.symbol).join(" and ");
    //     const llmOptions = merge(this.options.llm, options);
    //     const symbols = await suggest(combined_symbol, llmOptions);

    //     const nodes = await Promise.all(symbols.map(symbol => Node.create(symbol, this)));
    //     return nodes.filter(node => {
    //         for (const arg of args) {
    //             if (arg.equal(node)) return false;
    //         }
    //         return true;
    //     });
    // }
}