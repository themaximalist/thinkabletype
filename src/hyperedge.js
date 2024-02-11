// import Node from "./Node";
import * as utils from "./utils.js";

export default class Hyperedge {
    constructor(symbols = []) {
        this.symbols = symbols;
    }

    get id() {
        return this.symbols.join("->");
    }

    add() {
        const symbols = Array.from(arguments);
        this.symbols.push(...symbols);
    }

    remove(symbol_or_index) {
        if (typeof symbol_or_index === "number") {
            this.symbols.splice(symbol_or_index, 1);
        } else if (typeof symbol_or_index === "string") {
            const index = this.symbols.indexOf(symbol_or_index);
            if (index !== -1) {
                this.symbols.splice(index, 1);
            }
        }
    }

    has() {
        return utils.arrayContains(this.symbols, arguments);
    }

    equal(hyperedge) {
        return this.id === hyperedge.id;
    }
}

/*
import { arrayContains } from "./utils.js";

export default class Hyperedge {
    constructor(symbols = [], options = {}) {
        this.symbols = symbols.map(symbol => symbol instanceof Node ? symbol.symbol : symbol);
        this.index = options.index;
        if (!options.hypergraph) {
            throw new Error("Hyperedge requires a hypergraph");
        }

        this.hypergraph = options.hypergraph;
    }

    get id() {
        if (this.hypergraph.isIsolated) {
            return `${this.index}:${this.symbols.join("->")}`;
        }
        return this.symbols.join("->");
    }


    constructor(symbols = [], hypergraph) {

        this.index = hypergraph._hyperedges.size;
        this.hypergraph = hypergraph;
        this.nodes = symbols.map(this.createNode.bind(this));
        this.id = this.nodes.map((node) => node.symbol).join("->");

        if (this.hypergraph.isIsolated) {
            this.id = `${this.index}:${this.id}`;
        }
    }

    createNode(symbol, index) {
        return new Node(symbol, index, this, this.hypergraph);
    }

    nodeId(index) {
        const id = this.symbols.slice(0, index + 1).join(".");
        if (this.hypergraph.isIsolated) {
            return `${this.index}:${id}`;
        }

        return id;
    }

    prevNode(index) {
        if (index === 0) {
            return null;
        }

        return this.nodes[index - 1];
    }

    nextNode(index) {
        if (index === this.length - 1) {
            return null;
        }

        return this.nodes[index + 1];
    }

    has(input) {
        if (input instanceof Node) {
            return this.symbols.includes(input.symbol);
        } else if (typeof input === "string") {
            return this.symbols.includes(input);
        } else if (input instanceof Hyperedge) {
            return arrayContains(this.symbols, input.symbols);
        } else if (Array.isArray(input)) {
            return arrayContains(this.symbols, input);
        }

        return false;
    }

    static id(symbols) {
        return symbols.join("->");
    }
}
*/

/*
import Node from "./node.js";
// import merge from "lodash/merge.js";

// import { suggest } from "./llm.js";

// import { mergeGraphs, stringToColor } from "./utils";
// import Node from "./Node";

export default class Hyperedge {
    constructor(nodes, hypergraph) {
        this.index = hypergraph._hyperedges.size; // TODO: hacky
        this.nodes = nodes.map(node => Node.create(node, hypergraph));
        this.hypergraph = hypergraph;
    }

    get id() {
        const id = Hyperedge.id(this.nodes.map(node => node.id))
        if (this.hypergraph.isIsolated) {
            return `${this.index}:${id}`;
        }

        return id;
    }

    get symbols() {
        return this.nodes.map(node => node.symbol);
    }

    equal(hyperedge) {
        if (hyperedge instanceof Hyperedge) {
            return this.id === hyperedge.id;
        } else if (Array.isArray(hyperedge)) {
            return this.id === Hyperedge.id(hyperedge);
        }

        return false;
    }

    get(input) {
        for (const node of this.nodes) {
            if (node.equal(input)) {
                return node;
            }
        }

        return null;
    }

    has(input) {
        if (input instanceof Node) {
            return this.symbols.includes(input.symbol);
        } else if (typeof input === "string") {
            return this.symbols.includes(input);
        } else if (input instanceof Hyperedge) {
            return arrayContains(this.symbols, input.symbols);
        } else if (Array.isArray(input)) {
            return arrayContains(this.symbols, input);
        }

        return false;
    }

    hyperedges() {
        return this.hypergraph.hyperedges.filter(hyperedge => hyperedge.has(this));
    }

    add(input) {
        if (input instanceof Node) {
            this.nodes.push(input);
            this.hypergraph._nodes.set(input.id, input);
        } else if (typeof input === "string") {
            const node = Node.create(input, this.hypergraph);
            this.nodes.push(node);
            this.hypergraph._nodes.set(node.id, node);
        } else if (input instanceof Hyperedge) {
            for (const node of input.nodes) {
                this.add(node);
            }
        } else if (Array.isArray(input)) {
            for (const symbol of input) {
                this.add(symbol);
            }
        }

    }

    static create(hyperedge, hypergraph) {
        if (hyperedge instanceof Hyperedge) { return hyperedge }
        return new Hyperedge(hyperedge, hypergraph);
    }

    static id(symbols) {
        return symbols.join("->");
    }

}



class Hyperedge1 {



    async suggest(options = {}) {
        const llmOptions = merge({}, this.hypergraph.options.llm, options);
        const symbols = await suggest(this.symbol, llmOptions);
        const nodes = await Promise.all(symbols.map(symbol => Node.create(symbol, this.hypergraph)));
        return nodes.filter(node => {
            if (this.has(node)) return false;
            if (node.symbol === this.symbol) return false;
            return true;
        });
    }

    async similar(num = 3, threshold = 1.0) {
        const matches = await this.hypergraph.vectordb.search(this.symbol, num, threshold);

        const results = [];
        for (const match of matches) {
            if (match.input == this.symbol) continue;
            for (const hyperedge of this.hypergraph.hyperedges) {
                if (hyperedge.symbol == match.input) {
                    results.push({ distance: match.distance, hyperedge });
                }
            }
        }

        results.sort((a, b) => a.distance - b.distance);

        return results;
    }

    static id(nodes) {
        return nodes.map(node => Node.id(node)).join(",");
    }

    static symbol(nodes) {
        return nodes.map(node => (node instanceof Node ? node.symbol : symbol)).join(" ");
    }

    static has(nodes, hypergraph) {
        const id = Hyperedge.id(nodes);
        const hyperedge_ids = Object.keys(hypergraph._hyperedges);
        for (const hyperedge_id of hyperedge_ids) {
            if (hyperedge_id.indexOf(id) !== -1) {
                return true;
            }
        }

        return false;
    }

    static get(nodes, hypergraph) {
        const id = Hyperedge.id(nodes);
        let hyperedge = hypergraph._hyperedges[id];

        // full match
        if (hyperedge) {
            return hyperedge;
        }

        // partial match
        hyperedge = [];
        for (const n of nodes) {
            const node = Node.get(n, hypergraph);
            if (!node) { return null }
            hyperedge.push(node);
        }

        return new Hyperedge(hyperedge, hypergraph);
    }

    static async add(nodes, hypergraph) {
        const hyperedge = await Hyperedge.create(nodes, hypergraph);
        for (const node of hyperedge.nodes) {
            await Node.add(node, hypergraph);
        }

        hypergraph._hyperedges[hyperedge.id()] = hyperedge;

        return hyperedge;
    }

    static async create(nodes, hypergraph) {
        if (nodes instanceof Hyperedge) { return hyperedge }

        const edge = await Promise.all(nodes.map(node => Node.create(node, hypergraph)));
        const hyperedge = new Hyperedge(edge, hypergraph);

        await hypergraph.vectordb.add(hyperedge.symbol);
        return hyperedge;
    }
}
*/
