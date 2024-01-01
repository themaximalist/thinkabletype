// set.has doesn't work for arrays
// set doesn't de-duplicate arrays
// give it a uuid
// select the node as an object and perform operations on it (closest neighboors)
// page rank

const assert = require("assert");

const Hypergraph = require("../src/hypergraph").default;

describe("Hypergraph", function () {
  it("init empty", function () {
    const graph = new Hypergraph();
    assert(graph);
    assert(graph.nodes.size == 0);
  });

  it("add node", function () {
    const graph = new Hypergraph();
    graph.add(1);
    assert(graph.nodes.size == 1);
    assert(graph.nodes.has(1));
  });

  it("add hyperedge", function () {
    const graph = new Hypergraph();
    graph.add([1, 2, 3]);
    assert(graph.nodes.size == 3);
    assert(graph.nodes.has(1));
    assert(graph.nodes.has(2));
    assert(graph.nodes.has(3));
    assert(graph.hyperedges.size == 1);
    console.log(graph.hyperedges);
    assert(graph.hyperedges.has([1, 2, 3]));
  });
});
