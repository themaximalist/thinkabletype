import ForceLink from "./ForceLink.js";
import * as utils from "./utils.js";

export default class ForceGraph {
    constructor(hypergraph) {
        this.hypergraph = hypergraph;
    }

    graphData() {
        const nodes = new Map();
        const links = new Map();

        this.forceLinks = new Map();
        for (const hyperedge of this.hypergraph.hyperedges) {
            const forceLink = new ForceLink(hyperedge, this);
            this.forceLinks.set(hyperedge.id, forceLink);
        }

        this.updateIndexes();

        for (const link of this.forceLinks.values()) {
            link.updateGraphData(nodes, links);
        }

        if (this.hypergraph.isBridge) {
            this.updateBridgeData(nodes, links);
        }

        this.verify(nodes, links);

        return {
            nodes: Array.from(nodes.values()),
            links: Array.from(links.values()),
        };
    }

    verify(nodes, links) {
        const nodeIDs = new Set(nodes.keys());

        for (const link of links.values()) {
            if (!nodeIDs.has(link.source)) {
                console.log("NODES", nodes);
                console.log("LINKS", links);
                console.log("LINK", link);
                throw `Missing source ${link.source}`;
            } else if (!nodeIDs.has(link.target)) {
                console.log("NODES", nodes);
                console.log("LINKS", links);
                console.log("LINK", link);
                throw `Missing target ${link.target}`;
            }
        }
    }

    updateIndexes() {
        this.startSymbolIndex = new Map();
        this.endSymbolIndex = new Map();

        this.fusionIndex = new Map();

        for (const link of this.forceLinks.values()) {
            utils.addIndex(this.startSymbolIndex, link.hyperedge.firstSymbol, link);
            utils.addIndex(this.endSymbolIndex, link.hyperedge.lastSymbol, link);
        }

        if (this.hypergraph.isFusion) {
            this.updateFusionIndexes();
        }
    }

    masqueradeNode(node) {
        let i = 0;
        while (i++ < 10) {
            const masqueradeNode = this.fusionIndex.get(node.id);
            if (!masqueradeNode || masqueradeNode.id === node.id) {
                return node;
            }

            node = masqueradeNode;
        }
    }


    updateFusionIndexes() {
        for (const link of this.forceLinks.values()) {
            let edges;

            // start fusion
            edges = this.endSymbolIndex.get(link.hyperedge.firstSymbol) || [];
            if (edges.length > 0 && edges[0].id !== link.id) {
                this.fusionIndex.set(link.nodeId(0), edges[0].lastNode);
            }

            // end fusion
            edges = this.endSymbolIndex.get(link.hyperedge.lastSymbol) || [];
            if (edges.length > 0 && edges[0].id !== link.id) {
                this.fusionIndex.set(link.lastNodeId, edges[0].lastNode);
            }
        }
    }

    updateBridgeData(nodes, links) {
        const bridgeIndex = new Map();

        for (const link of this.forceLinks.values()) {
            for (const node of link.middleNodes) {
                if (!bridgeIndex.has(node.symbol)) {
                    bridgeIndex.set(node.symbol, []);
                }

                bridgeIndex.get(node.symbol).push(node);
            }
        }

        for (const bridgeNodes of bridgeIndex.values()) {
            if (bridgeNodes.length < 2) continue;

            const bridgeNode = {
                id: `${bridgeNodes[0].symbol}#bridge`,
                bridge: true,
            };

            nodes.set(bridgeNode.id, bridgeNode);

            for (const node of bridgeNodes) {
                const link = {
                    id: `${bridgeNode.id}->${node.id}`,
                    source: bridgeNode.id,
                    target: node.id,
                    color: node.link.color,
                };

                links.set(link.id, link);
            }
        }
    }
}

