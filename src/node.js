export default class Node {
    constructor(symbol, index = null, hyperedge = null, hypergraph = null, object = null) {
        this.symbol = symbol;
        this.index = index;
        this.hyperedge = hyperedge
        this.hypergraph = hypergraph
        this.id = this.symbol;
        this.textHeight = 8;
        this.object = object;

        if (this.hyperedge) {
            this.id = this.hyperedge.nodeId(this.index);
        }
    }

    updateMasqueradeIndex() {
        if (!this.hypergraph.isFusion) return null;
        if (this.isMiddle) return null;

        const nodes = this.hypergraph.endSymbolIndex.get(this.symbol);
        if (!nodes || nodes.length === 0) return null;

        const node = nodes.values().next().value;
        if (node.id === this.id) return null;
        this.hypergraph.masqueradeIndex.set(this.id, node);
    }

    updateBridgeGraphData() {
        if (!this.hypergraph.isBridge) return null;
        if (!this.isMiddle) return;

        const matches = this.hypergraph.symbolIndex.get(this.symbol);
        if (!matches || matches.length < 2) return;

        const bridgeNode = {
            id: `${this.symbol}#bridge`,
            // color: this.hyperedge.color,
            bridge: true
        };

        this.hypergraph._nodes.set(bridgeNode.id, bridgeNode);

        for (const node of matches.values()) {
            const link = Node.linkData(bridgeNode, node.resolvedNode(), this.hypergraph._nodes);
            link.length = 1;
            link.bridge = true;
            this.hypergraph._links.set(link.id, link);
        }
    }

    resolvedNode() {
        let node = this;
        while (true) {
            const nextNode = node.hypergraph.masqueradeIndex.get(node.id);
            if (!nextNode) break;
            if (node.id === nextNode.id) break;
            node = nextNode;
        }

        return node;
    }

    nodeData(node) {
        return {
            id: node.id,
            name: node.symbol,
            // color: node.color,
            textHeight: node.textHeight
        };
    }

    updateGraphData() {
        this.updateMasqueradeIndex();

        const node = this.nodeData(this.resolvedNode());
        this.hypergraph._nodes.set(node.id, node);

        const parentLink = this.linkData(this);
        if (parentLink) {
            this.hypergraph._links.set(parentLink.id, parentLink);
        }

        if (this.isMiddle) {
            this.updateBridgeGraphData();
        }
    }

    linkData(node) {
        if (!node.hyperedge) return null;
        if (node.isStart) return null;

        const parentNode = node.hyperedge.prevNode(node.index).resolvedNode();
        const childNode = node.resolvedNode();

        return Node.linkData(parentNode, childNode, this.hypergraph._nodes);
    }

    static linkData(parentNode, childNode, existingNodes) {
        if (!parentNode) throw new Error("Missing parentNode");
        if (!childNode) throw new Error("Missing childNode");

        if (!existingNodes.has(parentNode.id)) {
            throw new Error(`Missing parent node ${parentNode.id} in link to ${childNode.id}`);
        }

        if (!existingNodes.has(childNode.id)) {
            throw new Error(`Missing child node ${childNode.id} in link from ${parentNode.id}`);
        }

        return {
            id: `${parentNode.id}->${childNode.id}`,
            source: parentNode.id,
            target: childNode.id,
            // color: parentNode.color || parentNode.hyperedge.color || "#000000",
            hyperedgeID: parentNode.bridge ? null : parentNode.hyperedge.id
        };
    }

    get isStart() {
        if (!this.hyperedge) return false;
        return this.index === 0;
    }

    get isEnd() {
        if (!this.hyperedge) return false;
        return this.index === this.hyperedge.nodes.length - 1;
    }

    get isMiddle() {
        if (!this.hyperedge) return false;
        return !this.isStart && !this.isEnd;
    }
}

/*
// import { suggest } from "./llm.js";
// import merge from "lodash/merge.js";

export default class Node {
    constructor(symbol, hypergraph, object = null) {
        this.symbol = symbol;
        this.hypergraph = hypergraph;
        this.object = object;
    }

    get id() {
        return this.symbol;
    }

    equal(node) {
        if (node instanceof Node) {
            return this.id === node.id;
        } else if (typeof node === "string") {
            return this.id === node;
        }

        return false;
    }

    hyperedges() {
        return this.hypergraph.hyperedges.filter(hyperedge => hyperedge.has(this));
    }

    static create(node, hypergraph, object = null) {
        if (node instanceof Node) { return node }
        return new Node(node, hypergraph, object);
    }
}



class Node1 {



    similar(num = 3, threshold = 1.0) {
        return this.hypergraph.similar(this, num, threshold);
    }

    async suggest(options = {}) {
        const llmOptions = merge({}, this.hypergraph.options.llm, options);
        const symbols = await suggest(this.symbol, llmOptions);
        return await Promise.all(symbols.map(symbol => Node.create(symbol, this.hypergraph)));
    }

    static get(symbol, hypergraph) {
        const id = Node.id(symbol);
        return hypergraph._nodes[id];
    }

    static async create(symbol, hypergraph) {
        if (symbol instanceof Node) { return symbol }

        const node = new Node(symbol, hypergraph);
        await hypergraph.vectordb.add(String(node.symbol));
        return node;
    }

    static async add(symbol, hypergraph) {
        const node = await Node.create(symbol, hypergraph);
        hypergraph._nodes[node.id()] = node;
        return node;
    }


}

*/