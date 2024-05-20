import Hyperedge from './hyperedge.js';
import Node from './node.js';
import BridgeNode from './bridgenode.js';
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
        options.depth = options.depth || Hypergraph.DEPTH.SHALLOW;
        this.options = options;

        this.hyperedges = [];
        this.add(hyperedges);
    }

    get interwingle() { return this.options.interwingle }
    set interwingle(value) { this.options.interwingle = value }
    get depth() { return this.options.depth }
    set depth(value) { this.options.depth = value }
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

            const masqueradeNode = this.fusionIndex.get(node.id);
            if (!masqueradeNode || masqueradeNode.uuid === node.uuid) {
                return node;
            }

            node = masqueradeNode;
        }
    }


    graphData(filter) {
        const nodes = new Map();
        const links = new Map();

        this.updateIndexes();

        for (const hyperedge of this.hyperedges) {
            if (this.isFusion && hyperedge.isFusionBridge) continue;
            hyperedge.updateGraphData(nodes, links);
        }

        if (this.isFusion) {
            this.updateFusionData(nodes, links);
        }

        if (this.isBridge) {
            this.updateBridgeData(nodes, links);
        }

        utils.verifyGraphData(nodes, links);

        if (Array.isArray(filter)) {
            return this.filterGraphData(this.edgesForFilter(filter), { nodes, links });
        }

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
                    this.fusionIndex.set(edge.firstNode.id, nodes[0]); // should this crawl to edge and lastNode?
                }

                // end fusion
                nodes = this.endSymbolIndex.get(edge.lastNode.symbol) || [];
                if (nodes.length > 0) {
                    this.fusionIndex.set(edge.lastNode.id, nodes[0]);
                }
            }
        }
    }

    fusionBridgeNodes(node) {
        const nodes = this.symbolIndex.get(node.symbol) || [];
        return nodes.filter(n => { return n.hyperedge.uuid !== node.hyperedge.uuid });
    }

    updateFusionData(nodes, links) {

        for (const hyperedge of this.hyperedges) {
            if (!hyperedge.isFusionBridge) continue;

            const fromNodes = this.fusionBridgeNodes(hyperedge.firstNode);
            const toNodes = this.fusionBridgeNodes(hyperedge.lastNode);

            if (fromNodes.length === 0 && toNodes.length === 0) {
                continue;
            }

            // if one side of the connection doesn't exist, create it
            if (fromNodes.length === 0 && toNodes.length > 0) {
                hyperedge.firstNode.updateGraphData(nodes, links);
                fromNodes.push(hyperedge.firstNode);
            }

            if (fromNodes.length > 0 && toNodes.length === 0) {
                hyperedge.lastNode.updateGraphData(nodes, links);
                toNodes.push(hyperedge.lastNode);
            }

            for (let fromNode of fromNodes) {
                fromNode = this.masqueradeNode(fromNode);

                for (let toNode of toNodes) {
                    toNode = this.masqueradeNode(toNode);

                    if (!nodes.has(fromNode.id)) { fromNode.updateGraphData(nodes, links) }
                    if (!nodes.has(toNode.id)) { toNode.updateGraphData(nodes, links) }

                    const linkData = hyperedge.linkData(fromNode, toNode);
                    links.set(linkData.id, linkData);
                }
            }
        }
    }

    updateBridgeData(nodes, links) {
        const bridgeIndex = new Map();

        for (const hyperedge of this.hyperedges) {
            if (hyperedge.isFusionBridge) continue;
            for (let node of hyperedge.nodes) {
                node = this.masqueradeNode(node);
                utils.setIndex(bridgeIndex, node.symbol, node);
            }
        }

        for (let bridgeNodes of bridgeIndex.values()) {
            if (bridgeNodes.size < 2) continue;
            const bridgeNode = new BridgeNode(Array.from(bridgeNodes.values()));
            bridgeNode.updateGraphData(nodes, links);
        }

    }

    edgesForFilter(filter) {
        return this.hyperedges.filter(hyperedge => {
            for (const f of filter) {
                if (utils.arrayContains(hyperedge.symbols, f)) return true;
            }
            return false;
        });
    }

    filterGraphData(hyperedges, graphData) {
        const hyperedgeIDs = new Set(hyperedges.map(hyperedge => hyperedge.id));
        const nodeIDs = new Set();

        const nodes = new Map();
        const links = new Map();

        let depth = this.depth;

        const updateNodesAndLinks = () => {
            for (const node of graphData.nodes.values()) {
                if (Array.from(node.ids).some(id => hyperedgeIDs.has(id))) {
                    nodes.set(node.id, node);
                    nodeIDs.add(node.id);
                }
            }

            for (const link of graphData.links.values()) {
                if (nodeIDs.has(link.source) && nodeIDs.has(link.target)) {
                    links.set(link.id, link);
                }
            }

        }

        function updateHyperedges() {
            for (const node of nodes.values()) {
                for (const id of node.ids) {
                    hyperedgeIDs.add(id);
                }
            }

            for (const link of links.values()) {
                for (const id of link.ids) {
                    hyperedgeIDs.add(id);
                }
            }
        }

        updateNodesAndLinks();

        let finalNodes = new Map(nodes);
        let finalLinks = new Map(links);
        let maxDepth = 0;

        while (true) {
            const existingNodeSize = nodes.size;
            const existingLinkSize = links.size;

            updateHyperedges();
            updateNodesAndLinks();

            if (maxDepth < depth) {
                finalNodes = new Map(nodes);
                finalLinks = new Map(links);
            }

            if (existingNodeSize === nodes.size && existingLinkSize === links.size) {
                break;
            }

            maxDepth++;
        }

        utils.verifyGraphData(finalNodes, finalLinks);

        if (maxDepth < 0) { maxDepth = 0 }
        if (depth > maxDepth) { depth = maxDepth }

        return {
            nodes: Array.from(finalNodes.values()),
            links: Array.from(finalLinks.values()),
            depth,
            maxDepth,
        };
    }
}