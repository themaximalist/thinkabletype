class ForceNode {
    constructor(symbol, index, link) {
        this.symbol = symbol;
        this.index = index;
        this.link = link;
    }

    get id() {
        return this.link.nodeId(this.index);
    }

    updateGraphData(nodes, links) {
        nodes.set(this.id, {
            id: this.id,
            name: this.symbol,
        });
    }
}

class ForceLink {
    constructor(hyperedge, forceGraph) {
        this.forcegraph = forceGraph;
        this.hypergraph = forceGraph.hypergraph;

        this.hyperedge = hyperedge;
        this.index = this.hypergraph.hyperedges.indexOf(this.hyperedge);

        this.symbols = hyperedge.symbols;
        this.nodes = this.symbols.map((symbol, index) => new ForceNode(symbol, index, this));
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
            _meta: {
                hyperedgeID: parentNode.link.id,
            }
        };
    }
}

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
/*
function ForceHyperedge(hyperedge, nodes, links) {
    for (const node of hyperedge.nodes) {
        console.log(node);
    }
}
*/

/*
export default function ForceGraphData(hypergraph) {
    const nodes = new Map();
    const links = new Map();

    return {
        nodes: Array.from(nodes.values()),
        links: Array.from(links.values()),
    };
}
*/

/*
function ForceNode(node) {
    return {
        id: node.symbol,
        name: node.symbol,
        textHeight: 8,
    }
}

function ForceLink(hyperedge) {
    return {
        id: hyperedge.id,
        // source: hyperedge.nodes[0].symbol,
        // target: hyperedge.nodes[hyperedge.nodes.length - 1].symbol,
    }
}


export default class ForceGraph {
    constructor(hypergraph) {
        this.nodes = new Map();
        this.links = new Map();

        this.hypergraph = hypergraph;
    }

    graphData() {
        this.update();

        return {
            nodes: Array.from(this.nodes.values()),
            links: Array.from(this.links.values()),
        }
    }

    update() {
        // TODO: cheaper way to do this? handle events from hypergraph onAdd, onEdit, onDelete
        this.nodes = new Map();
        this.links = new Map();

        // for (const link of this.hypergraph.links) {
        //     console.log("LINK", link);
        //     // this.links.set(link.id, ExportNode(node));
        // }

        for (const node of this.hypergraph.nodes) {
            this.nodes.set(node.id, ForceNode(node));
        }
    }
}
*/