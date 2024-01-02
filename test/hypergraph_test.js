// give it a uuid
// select the node as an object and perform operations on it (closest neighboors)
// page rank
// embedding
// implicit hyperedges (computational AI graph)

const assert = require("assert");

const Hypergraph = require("../src/hypergraph").default;

describe("Hypergraph", function () {
  it("init empty", function () {
    const graph = new Hypergraph();
    assert(graph);
    assert(graph.nodes.size == 0);
  });

  /*
  it("add node", function () {
    const graph = new Hypergraph();
    graph.add("A");
    graph.add("A"); // dupe
    assert(graph.nodes.size == 1);
    assert(graph.nodes.has("A"));

    graph.add("B");
    graph.add("B"); // dupe
    assert(graph.nodes.size == 2);
    assert(graph.nodes.has("B"));
  });

  it("add hyperedge", function () {
    const graph = new Hypergraph();
    graph.add(["A", "B"]);
    graph.add(["A", "B"]);
    assert(graph.nodes.size == 2);
    assert(graph.nodes.has("A"));
    assert(graph.nodes.has("B"));

    assert(graph.hyperedges.length == 1);
  });

  it("add multiple hyperedge", function () {
    const graph = new Hypergraph();
    graph.add(["A", "B"]);
    graph.add(["A", "B", "C"]);
    assert(graph.nodes.size == 3);
    assert(graph.nodes.has("A"));
    assert(graph.nodes.has("B"));
    assert(graph.nodes.has("C"));

    assert(graph.hyperedges.length == 2);
  });

  it("has hyperedge", function () {
    const graph = new Hypergraph();
    graph.add(["A", "B"]);

    assert(graph.has("A"));
    assert(graph.has("B"));
    assert(graph.has(["A", "B"]));
    assert(!graph.has(["A", "C"]));
  });

  it("load", function () {
    const graph = new Hypergraph([
      ["A", "B"],
      ["A", "B", "C"],
    ]);

    assert(graph.has("A"));
    assert(graph.has("B"));
    assert(graph.has(["A", "B"]));
    assert(!graph.has(["A", "C"]));
  });

  it("get node", function () {
    const graph = new Hypergraph();
    graph.add(["A", "B"]);
    const nodeA = graph.get("A");
    console.log("NODE", nodeA);
  });
  */

  // get hyperedge
  // uuid
});
