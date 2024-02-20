export default class ForceNode {

    constructor(symbol, index, link) {
        this.symbol = symbol;
        this.index = index;
        this.link = link;
        this.forcegraph = link.forcegraph;
    }

    get id() {
        return this.link.nodeId(this.index);
    }

    updateGraphData(nodes, links) {
        const node = this.forcegraph.masqueradeNode(this);
        const hypergraphIDs = new Set();
        const existingNode = nodes.get(node.id);
        if (existingNode) {
            for (const id of existingNode._meta.hyperedgeIDs) {
                hypergraphIDs.add(id);
            }
        }

        hypergraphIDs.add(this.link.id);

        nodes.set(node.id, {
            id: node.id,
            name: node.symbol,
            color: node.link.color,
            textHeight: 8,
            _meta: {
                hyperedgeIDs: Array.from(hypergraphIDs)
            }
        });
    }
}
