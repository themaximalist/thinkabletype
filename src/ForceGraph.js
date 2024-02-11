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