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

    rename(symbol) {
        this.symbol = symbol;
        return this.id;
    }

    remove() {
        this.hyperedge.nodes.splice(this.index, 1);
    }

    graphData(nodes, links) {
        if (nodes.has(this.id)) return;

        nodes.set(this.id, {
            id: this.id,
            name: this.symbol,
        });
    }
}

