import * as utils from "./utils.js";
import ForceNode from "./ForceNode.js";

export default class ForceLink {
    constructor(hyperedge, forceGraph) {
        this.forcegraph = forceGraph;
        this.hypergraph = forceGraph.hypergraph;

        this.hyperedge = hyperedge;

        this.symbols = hyperedge.symbols;
        this.nodes = this.symbols.map((symbol, index) => new ForceNode(symbol, index, this));

        this.color = utils.stringToColor(this.symbols[0], this.hypergraph.colors);
    }

    get id() {
        return this.hyperedge.id;
    }

    get index() {
        return this.hyperedge.index;
    }

    get firstNode() {
        return this.nodes[0];
    }

    get lastNode() {
        return this.nodes[this.nodes.length - 1];
    }

    get middleNodes() {
        if (this.nodes.length < 3) {
            return [];
        }

        return this.nodes.slice(1, this.nodes.length - 1);
    }

    get lastNodes() {
        return this.nodes.slice(1);
    }

    nodeId(index) {
        const id = this.symbols.slice(0, index + 1).join(".");
        if (this.hypergraph.isIsolated) {
            return `${this.index}:${id}`;
        }

        return id;
    }

    get lastNodeId() {
        return this.lastNode.id;
    }

    updateGraphData(nodes, links) {
        let parent = null;
        for (const node of this.nodes) {
            node.updateGraphData(nodes, links);

            if (parent) {
                const link = this.linkData(parent, node);

                // a little hacky, but ensures masqurade nodes are properly linked to their hyperedges
                const existingLink = links.get(link.id);
                if (existingLink) {
                    link._meta.hyperedgeIDs = link._meta.hyperedgeIDs.concat(existingLink._meta.hyperedgeIDs);
                }

                links.set(link.id, link);
            }

            parent = node;
        }
    }

    linkData(parentNode, childNode) {
        const hyperedgeIDs = new Set();
        hyperedgeIDs.add(parentNode.link.id);
        hyperedgeIDs.add(childNode.link.id);

        parentNode = this.forcegraph.masqueradeNode(parentNode);
        childNode = this.forcegraph.masqueradeNode(childNode);
        hyperedgeIDs.add(parentNode.link.id);
        hyperedgeIDs.add(childNode.link.id);

        return {
            id: `${parentNode.id}->${childNode.id}`,
            source: parentNode.id,
            target: childNode.id,
            color: this.color,
            _meta: {
                hyperedgeIDs: Array.from(hyperedgeIDs)
            }
        };
    }
}