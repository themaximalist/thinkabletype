import ForceLink from "./ForceLink.js";

export default class ForceGraph {
    constructor(hypergraph) {
        this.hypergraph = hypergraph;
    }

    graphData() {
        const nodes = new Map();
        const links = new Map();

        const forceLinks = this.hypergraph.hyperedges.map(hyperedge => new ForceLink(hyperedge, this));
        for (const link of forceLinks) {
            link.updateGraphData(nodes, links);
        }

        return {
            nodes: Array.from(nodes.values()),
            links: Array.from(links.values()),
        };
    }
}

