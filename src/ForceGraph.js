import ForceLink from "./ForceLink.js";

function setIndex(index, key, val) {
    if (!index.has(key)) {
        index.set(key, []);
    }

    index.get(key).push(val);
}

export default class ForceGraph {
    constructor(hypergraph) {
        this.hypergraph = hypergraph;
    }

    // TODO: should updateIndexes be on forceLinks? Probably because that's what we want to update and re-arrange

    updateIndexes() {
        this.startSymbolIndex = new Map();
        this.endSymbolIndex = new Map();

        this.fusionIndex = new Map();

        for (const link of this.forceLinks.values()) {
            setIndex(this.startSymbolIndex, link.hyperedge.firstSymbol, link);
            setIndex(this.endSymbolIndex, link.hyperedge.lastSymbol, link);
        }

        if (this.hypergraph.isFusion) {
            this.updateFusionIndexes();
        }
    }

    updateFusionIndexes() {
        for (const link of this.forceLinks.values()) {
            let edges;

            // start fusion
            edges = this.endSymbolIndex.get(link.hyperedge.firstSymbol) || [];
            if (edges.length > 0) {
                const edge = edges[0];
                this.fusionIndex.set(link.nodeId(0), edge.lastNode);
            }

            // end fusion
            edges = this.endSymbolIndex.get(link.hyperedge.lastSymbol) || [];
            if (edges.length > 0 && edges[0].id !== link.id) {
                this.fusionIndex.set(link.lastNodeId, edges[0].lastNode);
            }
        }
    }

    masqueradeNode(node) {
        while (true) {
            const masqueradeNode = this.fusionIndex.get(node.id);
            if (!masqueradeNode) {
                return node;
            }

            node = masqueradeNode;
        }
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

        return {
            nodes: Array.from(nodes.values()),
            links: Array.from(links.values()),
        };
    }
}

