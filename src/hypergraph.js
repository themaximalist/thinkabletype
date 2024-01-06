import csv from "papaparse"
import VectorDB from "@themaximalist/vectordb.js"

import Node from "./node.js";
import Hyperedge from "./hyperedge.js";


export default class Hypergraph {
    constructor() {
        this.vectordb = new VectorDB();
        this._nodes = {};
        this._hyperedges = {};
        this.pageranks = {};
    }

    static async load(hyperedges = []) {

    }

    get(input) {
        if (Array.isArray(input)) { return Hyperedge.get(input, this) }
        return Node.get(input, this);
    }

    has(input) {
        if (Array.isArray(input)) { return Hyperedge.has(input, this) }
        return Node.has(input, this);
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
}

class HypergraphBak {




    async hasNode(input) {
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

    async similar(input) {
        if (typeof input === "string") {
            input = Node.create(input, this);
        }

        if (!input instanceof Node) {
            return [];
        }

        await this.waitForLoaded();

        const embeddings = await this.vectordb.search(input.node, 5, 1);
        const results = [];
        for (const embedding of embeddings) {
            if (embedding.input == input.node) continue;

            const node = this.getNode(embedding.input);
            await node.waitForLoaded();
            results.push({ distance: embedding.distance, node });
        }


        results.sort((a, b) => a.distance - b.distance);

        return results;
    }

    load(hyperedges = []) {
        this.reset();
        for (const hyperedge of hyperedges) {
            this.add(hyperedge);
        }
    }

    static parse(input) {
        const hyperedges = csv.parse(input).data;
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


// TODO: move pagerank to library
// TODO: try to find a way around waitForLoaded() ...super annoying