import Hyperedge from './hyperedge.js';
import Node from './node.js';
import * as utils from "./utils.js";

export default class Hypergraph {
    static INTERWINGLE = {
        ISOLATED: 0,        // only explicit connections you've added
        CONFLUENCE: 1,      // shared parents
        FUSION: 2,          // shared children
        BRIDGE: 3           // shared symbols
    };

    static DEPTH = {
        SHALLOW: 0,         // don't connect
        // any number between 1 and Infinity is valid, up to maxDepth
        DEEP: Infinity,     // infinitely connect
    };

    constructor(input, options = {}) {
        let hyperedges;

        if (Array.isArray(input)) {
            hyperedges = input;
        } else if (typeof input === "object") {
            hyperedges = input.hyperedges || [];
            delete input.hyperedges;
            options = input;
        } else {
            hyperedges = [];
        }

        options.interwingle = options.interwingle || Hypergraph.INTERWINGLE.ISOLATED;
        this.options = options;

        this.hyperedges = [];
        this.add(hyperedges);
    }

    get interwingle() { return this.options.interwingle }
    set interwingle(value) { this.options.interwingle = value }
    get isIsolated() { return this.interwingle === Hypergraph.INTERWINGLE.ISOLATED }
    get isConfluence() { return this.interwingle >= Hypergraph.INTERWINGLE.CONFLUENCE }
    get isFusion() { return this.interwingle >= Hypergraph.INTERWINGLE.FUSION }
    get isBridge() { return this.interwingle >= Hypergraph.INTERWINGLE.BRIDGE }
    get symbols() {
        const symbols = new Set();
        for (const hyperedge of this.hyperedges) {
            for (const symbol of hyperedge.symbols) {
                symbols.add(symbol);
            }
        }
        return Array.from(symbols);
    }

    add(symbols) {
        if (!Array.isArray(symbols)) throw new Error("Expected an array of symbols");
        if (symbols.length === 0) return;
        if (Array.isArray(symbols[0])) {
            for (const hyperedge of symbols) {
                this.add(hyperedge);
            }
            return;
        }

        this.hyperedges.push(new Hyperedge(symbols, this));
    }

    nodeByUUID(uuid) {
        for (const hyperedge of this.hyperedges) {
            for (const node of hyperedge.nodes) {
                if (node.uuid === uuid) return node;
            }
        }
    }

    edgeByUUID(uuid) {
        for (const hyperedge of this.hyperedges) {
            if (hyperedge.uuid === uuid) return hyperedge;
        }
    }

    masqueradeNode(node, max = 1000) {
        let i = 0;

        while (true) {
            if (i++ > max) {
                console.log("Infinite loop for", node.id)
                throw new Error("Infinite loop");
            }

            const masqueradeNode = this.fusionIndex.get(node.uuid);
            if (!masqueradeNode || masqueradeNode.uuid === node.uuid) {
                return node;
            }

            node = masqueradeNode;
        }
    }


    graphData() {
        const nodes = new Map();
        const links = new Map();

        this.updateIndexes();

        for (const hyperedge of this.hyperedges) {
            // if (link.nodes.length === 2) continue; // ??
            hyperedge.graphData(nodes, links);
        }

        this.updateFusionGraphData(nodes, links);

        utils.verifyGraphData(nodes, links);

        return {
            nodes: Array.from(nodes.values()),
            links: Array.from(links.values()),
        };
    }

    updateIndexes() {
        this.symbolIndex = new Map();
        this.startSymbolIndex = new Map();
        this.endSymbolIndex = new Map();

        this.fusionIndex = new Map();

        for (const edge of this.hyperedges) {
            for (const node of edge.nodes) {
                utils.addIndex(this.symbolIndex, node.symbol, node);
            }

            utils.addIndex(this.startSymbolIndex, edge.firstNode.symbol, edge.firstNode);
            utils.addIndex(this.endSymbolIndex, edge.lastNode.symbol, edge.lastNode);
        }

        if (this.isFusion) {
            for (const edge of this.hyperedges) {
                let nodes;

                // start fusion
                nodes = this.endSymbolIndex.get(edge.firstNode.symbol) || [];
                if (nodes.length > 0) {
                    this.fusionIndex.set(edge.firstNode.uuid, nodes[0]); // should this crawl to edge and lastNode?
                }

                // end fusion
                nodes = this.endSymbolIndex.get(edge.lastNode.symbol) || [];
                if (nodes.length > 0) {
                    this.fusionIndex.set(edge.lastNode.uuid, nodes[0]);
                }

            }
        }
    }

    fusionLinks(node) {
        const nodes = this.symbolIndex.get(node.symbol) || [];
        return nodes.filter(n => { return n.hyperedge.uuid !== node.hyperedge.uuid });
    }

    fusionNodes(node) {
        return this.symbolIndex.get(node.symbol) || [];
    }

    updateFusionGraphData(nodes, links) {
        const seenIndex = new Map();

        for (const hyperedge of this.hyperedges) {

            if (hyperedge.nodes.length !== 2) {
                for (const node of hyperedge.nodes) {
                    seenIndex.set(node.symbol, true);
                }
                continue;
            }

            if (this.isFusion) {
                let fromNodes = this.fusionNodes(hyperedge.firstNode);
                let toNodes = this.fusionNodes(hyperedge.lastNode);


                const firstSeen = seenIndex.get(hyperedge.firstNode.symbol);
                const lastSeen = seenIndex.get(hyperedge.lastNode.symbol);
                const seen = firstSeen || lastSeen;
                if (!seen) {
                    hyperedge.graphData(nodes, links);
                }

                if (fromNodes.length === 0) {
                    for (const node of hyperedge.firstNodes) { node.graphData(nodes, links) }
                    fromNodes.push(hyperedge.firstNode);
                }

                if (toNodes.length === 0) {
                    for (const node of hyperedge.lastNodes) { node.graphData(nodes, links) }
                    toNodes.push(hyperedge.lastNode);
                }

                for (let fromNode of fromNodes) {
                    fromNode = this.masqueradeNode(fromNode);

                    for (let toNode of toNodes) {
                        toNode = this.masqueradeNode(toNode);

                        if (!nodes.has(fromNode.id)) { fromNode.graphData(nodes, links) }
                        if (!nodes.has(toNode.id)) { toNode.graphData(nodes, links) }

                        const linkData = hyperedge.linkData(fromNode, toNode);
                        links.set(linkData.id, linkData);
                    }
                }

            } else {
                link.updateGraphData(nodes, links);
            }

            for (const node of hyperedge.nodes) {
                seenIndex.set(node.symbol, true);
            }
        }
    }
}