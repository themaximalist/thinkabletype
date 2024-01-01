const Hypergraph = require("./hypergraph").default;

// node/vertex/item
// edge - connection between nodes
// hyperedge - connection between edges


// page rank

async function main() {
    const graph = new Hypergraph();

    graph.add([1, 2, 3]); // 1 -> 2 -> 3
}

main();