import * as utils from "./utils.js";
import ForceNode from "./ForceNode.js";

export default class ForceLink {
    constructor(hyperedge, forceGraph) {
        this.forcegraph = forceGraph;
        this.hypergraph = forceGraph.hypergraph;

        this.hyperedge = hyperedge;
        this.index = this.hypergraph.hyperedges.indexOf(this.hyperedge);

        this.symbols = hyperedge.symbols;
        this.nodes = this.symbols.map((symbol, index) => new ForceNode(symbol, index, this));

        this.color = utils.stringToColor(this.symbols[0]);
    }

    get id() {
        const id = this.hyperedge.id;
        if (this.hypergraph.isIsolated) {
            return `${this.index}:${id}`;
        }

        return id;
    }

    nodeId(index) {
        const id = this.symbols.slice(0, index + 1).join(".");
        if (this.hypergraph.isIsolated) {
            return `${this.index}:${id}`;
        }

        return id;
    }

    updateGraphData(nodes, links) {
        let parent = null;
        for (const node of this.nodes) {
            node.updateGraphData(nodes, links);

            if (parent) {
                const link = this.linkData(parent, node);
                links.set(link.id, link);
            }

            parent = node;
        }
    }

    linkData(parentNode, childNode) {
        return {
            id: `${parentNode.id}->${childNode.id}`,
            source: parentNode.id,
            target: childNode.id,
            color: this.color,
            _meta: {
                hyperedgeID: parentNode.link.id,
            }
        };
    }
}