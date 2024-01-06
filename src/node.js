export default class Node {

    constructor(symbol, hypergraph) {
        this.symbol = symbol;
        this.hypergraph = hypergraph;
    }

    id() {
        const symbol = String(this.symbol);
        if (symbol.indexOf(",") !== -1) { return `"${symbol}"` }
        return symbol;
    }

    static async create(symbol, hypergraph) {
        const node = new Node(symbol, hypergraph);
        await hypergraph.vectordb.add(node.symbol);
        hypergraph._nodes[node.id()] = node;
        return node;
    }

    static has(symbol, hypergraph) {
        if (typeof symbol === "string") {
            for (const node of hypergraph.nodes) {
                if (node.symbol === symbol) {
                    return true;
                }
            }
        } else if (symbol instanceof Node) {
            for (const node of hypergraph.nodes) {
                if (node.symbol === symbol.symbol) {
                    return true;
                }
            }
        }

        return false;
    }
}

class NodeBak {
    constructor(node, hypergraph) {

    }


    equal(node_or_str) {
        if (node_or_str instanceof Node) {
            return this.id() === node_or_str.id();
        } else if (typeof node_or_str === "string") {
            return this.id() === node_or_str;
        }

        return false;
    }

    hyperedges() {
        return this.hypergraph.hyperedges.filter(hyperedge => hyperedge.has(this));
    }

    static create(input, hypergraph) {
        if (input instanceof Node) {
            return input;
        }

        input = String(input);

        return new Node(input, hypergraph);
    }

}
