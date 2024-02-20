import ForceLink from "./ForceLink.js";
import * as utils from "./utils.js";


export default class ForceGraph {
    constructor(hypergraph) {
        this.hypergraph = hypergraph;
    }

    graphData(hyperedges = []) {
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

        if (hyperedges.length > 0) {
            return this.filterGraphData(hyperedges, { nodes, links });
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
                throw `Missing source ${link.source}`;
            } else if (!nodeIDs.has(link.target)) {
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
        while (true) {
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
            //if (edges.length > 0 && edges[0].id !== link.id) { // TODO: add if we won't want self-linking on fusion nodes
            if (edges.length > 0) {
                this.fusionIndex.set(link.nodeId(0), edges[0].lastNode);
            }

            // end fusion
            edges = this.endSymbolIndex.get(link.hyperedge.lastSymbol) || [];
            //if (edges.length > 0 && edges[0].id !== link.id) { // TODO: add if we won't want self-linking on fusion nodes
            if (edges.length > 0) {
                this.fusionIndex.set(link.lastNodeId, edges[0].lastNode);
            }
        }
    }

    updateBridgeData(nodes, links) {
        const bridgeIndex = new Map();

        for (const link of this.forceLinks.values()) {
            for (let node of link.nodes) {
                node = this.masqueradeNode(node);
                utils.setIndex(bridgeIndex, node.symbol, node);
            }
        }


        for (const bridgeNodes of bridgeIndex.values()) {
            if (bridgeNodes.size < 2) continue;

            const hyperedgeIDs = Array.from(bridgeNodes.values()).map(node => node.link.id);

            const bridgeNode = {
                id: `${bridgeNodes.values().next().value.symbol}#bridge`,
                bridge: true,
                _meta: {
                    hyperedgeIDs: hyperedgeIDs
                }
            };

            nodes.set(bridgeNode.id, bridgeNode);


            for (const node of bridgeNodes.values()) {
                const link = {
                    id: `${bridgeNode.id}->${node.id}`,
                    source: bridgeNode.id,
                    target: node.id,
                    color: node.link.color,
                    _meta: {
                        hyperedgeIDs: hyperedgeIDs
                    },
                };

                links.set(link.id, link);
            }
        }
    }

    // hacky...but it works
    // filter hyperedges, and then expand out based on interwingle connections
    filterGraphData(hyperedges, graphData) {
        const hyperedgeIDs = new Set(hyperedges.map(hyperedge => hyperedge.id));
        const nodeIDs = new Set();

        const nodes = new Map();
        const links = new Map();

        function updateNodesAndLinks() {
            for (const node of graphData.nodes.values()) {
                const ids = node._meta.hyperedgeIDs;
                if (ids.some(id => hyperedgeIDs.has(id))) {
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
                for (const id of node._meta.hyperedgeIDs) {
                    hyperedgeIDs.add(id);
                }
            }

            for (const link of links.values()) {
                for (const id of link._meta.hyperedgeIDs) {
                    hyperedgeIDs.add(id);
                }
            }
        }

        updateNodesAndLinks();

        for (let i = 0; i < this.hypergraph.depth; i++) {
            const existingNodeSize = nodes.size;
            const existingLinkSize = links.size;

            updateHyperedges();
            updateNodesAndLinks();

            if (existingNodeSize === nodes.size && existingLinkSize === links.size) {
                break;
            }
        }

        this.verify(nodes, links);

        return {
            nodes: Array.from(nodes.values()),
            links: Array.from(links.values())
        };
    }
}

