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

    graphData(nodes, links) {
        if (nodes.has(this.id)) return;

        nodes.set(this.id, {
            id: this.id,
            name: this.symbol,
        });
    }
}

// local storage -> settings
// node -> uuid (stack them)
// objects in app.state
// model deployer for frontend
