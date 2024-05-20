import { v4 as uuidv4 } from 'uuid';

export default class Node {
    constructor(symbol, hyperedge) {
        this.symbol = symbol;
        this.hyperedge = hyperedge;
        this.hypergraph = hyperedge.hypergraph;
        this.uuid = uuidv4();
    }

    get id() {
        return this.hyperedge.nodeId(this.index);
    }

    get index() {
        return this.hyperedge.nodes.indexOf(this);
    }

    get isMasqueradeNode() {
        return this.hypergraph.masqueradeNode(this) !== this;
    }

    rename(symbol) {
        this.symbol = symbol;
        return this.id;
    }

    remove() {
        this.hyperedge.nodes.splice(this.index, 1);
    }

    updateGraphData(nodes, links) {
        const node = this.hypergraph.masqueradeNode(this);

        const existing = nodes.get(node.id);
        const ids = existing ? existing.ids : new Set();

        ids.add(this.hyperedge.id);

        nodes.set(node.id, {
            id: node.id,
            uuid: node.uuid,
            name: node.symbol,
            ids,
        });
    }

    _updateGraphData(nodes, links) {
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

