import csv from "papaparse"
import Hypergraph from "./Hypergraph.js";

import { calculatePageRank, pageRank } from "./pagerank.js";
import { suggest } from "./llm.js";
// import VectorDB from "@themaximalist/vectordb.js"

export default class HyperType extends Hypergraph {

    constructor(options = {}) {
        super(options);

        // this.vectordb = new VectorDB(options.vectordb);

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

        // for (const hyperedge of this.hyperedges) {
        //     for (const symbol of hyperedge.symbols) {
        //         await this.vectordb.add(symbol);
        //     }
        // }

        this._synced.embeddings = true;
        return true;
    }

    pagerank(symbol) {
        return pageRank(this, symbol);
    }


    static parse(input, options = {}) {
        const hypertype = new HyperType(options);
        hypertype.parse(input, options);
        return hypertype;
    }

    parse(input, options = {}) {
        this.reset();
        const hyperedges = csv.parse(input, options.parse || {}).data;
        this.addHyperedges(hyperedges);
    }

    export() {
        const hyperedges = this.hyperedges.map(hyperedge => hyperedge.symbols);
        return csv.unparse(hyperedges, {
            header: false,
        });
    }

    async similar(symbol, num = 3, threshold = 1.0) {
        const similarSymbols = await this.similarSymbols(symbol, num, threshold);
        const hyperedges = new Map();
        for (const hyperedge of this.hyperedges) {
            for (const similarSymbol of similarSymbols) {
                if (hyperedge.has(similarSymbol.symbol)) {
                    if (!hyperedge.distance || hyperedge.distance < similarSymbol.distance) {
                        hyperedge.distance = similarSymbol.distance;
                    }
                    hyperedges.set(hyperedge.id, hyperedge);
                }
            }
        }

        return Array.from(hyperedges.values());
    }

    async similarSymbols(symbol, num = 3, threshold = 1.0) {
        // const matches = await this.vectordb.search(symbol, num, threshold);
        const results = [];

        // for (const { input, distance } of matches) {
        //     if (symbol == input) continue;
        //     results.push({ distance, symbol: input });
        // }

        // results.sort((a, b) => a.distance - b.distance);

        return results;
    }

    async suggest(symbols, options = {}) {
        const llmOptions = Object.assign({}, this.options.llm || {}, options);
        const phrase = symbols.join(" ");
        return await suggest(phrase, llmOptions);
    }

    reset() {
        super.reset();

        // this.vectordb = new VectorDB(this.options.vectordb);

        this.pageranks = {};
        this._synced = {
            pagerank: true,
            embeddings: true,
        };

        if (this.hyperedges.length > 0) {
            this.setUnsynced();
        }
    }
}