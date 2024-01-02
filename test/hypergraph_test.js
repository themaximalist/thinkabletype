// select the node as an object and perform operations on it (closest neighboors)
// embedding
// implicit hyperedges (computational AI graph)

const assert = require("assert");

const { Hypergraph, Node, Hyperedge } = require("../src/hypergraph");

describe("Hypergraph", function () {
  it("init empty", function () {
    const graph = new Hypergraph();
    assert(graph);
    assert(graph.nodes.length == 0);
  });

  it("add node", function () {
    const graph = new Hypergraph();
    graph.add("A");
    graph.add("A"); // dupe
    assert(graph.nodes.length == 1);
    assert(graph.has("A"));

    graph.add("B");
    graph.add("B"); // dupe
    assert(graph.nodes.length == 2);
    assert(graph.has("B"));
  });

  it("add node object", function () {
    const graph = new Hypergraph();
    const a = graph.add("A");
    assert(a);
    graph.add(a); // dupe
    assert(graph.nodes.length == 1);
    assert(graph.has("A"));
    assert(graph.has(a));
  });

  it("add hyperedge", function () {
    const graph = new Hypergraph();
    graph.add(["A", "B"]);
    graph.add(["A", "B"]);
    assert(graph.nodes.length == 2);
    assert(graph.has("A"));
    assert(graph.has("B"));

    assert(graph.hyperedges.length == 1);
    assert(graph.has(["A", "B"]));

    const hyperedge = graph.get(["A", "B"]);
    assert(hyperedge);
    assert(hyperedge.nodes.length == 2);
    assert(hyperedge.nodes[0].node == "A");
    assert(hyperedge.nodes[1].node == "B");
  });

  it("add multiple hyperedge", function () {
    const graph = new Hypergraph();
    graph.add(["A", "B"]);
    graph.add(["A", "B", "C"]);
    assert(graph.nodes.length == 3);
    assert(graph.has("A"));
    assert(graph.has("B"));
    assert(graph.has("C"));

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
    assert(nodeA);
    assert(nodeA.node == "A");

    const nodeB = graph.get("B");
    assert(nodeB);
    assert(nodeB.node == "B");
  });

  it("compare node", function () {
    const graph = new Hypergraph();
    graph.add(["A", "B"]);

    const nodeA1 = graph.get("A");
    assert(nodeA1);
    assert(nodeA1.node == "A");

    const nodeA2 = graph.get("A");
    assert(nodeA2);
    assert(nodeA2.node == "A");

    assert(nodeA1.equal(nodeA2));

    const nodeB1 = graph.get("B");

    assert(!nodeA1.equal(nodeB1));
    assert(!nodeA2.equal(nodeB1));
  });

  it("compare hyperedge", function () {
    const graph = new Hypergraph();
    const hyperedge1 = graph.add(["A", "B", "C"]);
    const hyperedge2 = graph.add(["A", "B", "C"]);
    const hyperedge3 = graph.add(["A", "B", "C", "D"]);

    assert(hyperedge1.equal(hyperedge2));
    assert(!hyperedge3.equal(hyperedge1));
  });

  it("hyperedge contains node", function () {
    const graph = new Hypergraph();
    const hyperedge1 = graph.add(["A", "B", "C"]);
    const hyperedge2 = graph.add(["A", "B", "C", "D"]);

    assert(hyperedge1.has("A"));
    assert(hyperedge1.has("B"));
    assert(hyperedge1.has("C"));
    assert(!hyperedge1.has("D"));
    assert(hyperedge2.has("D"));
  });

  it("get hyperedges for node", function () {
    const graph = new Hypergraph();
    graph.add(["A", "B", "C"]);
    const hyperedge = graph.add(["A", "B", "C", "D"]);

    const hyperedges = graph.get("A").hyperedges();
    assert(hyperedges.length == 2);

    assert(hyperedge.nodes[0].hyperedges().length == 2);
  });

  it("node and edge id", function () {
    const graph = new Hypergraph();
    const nodeA = graph.add("A");
    const nodeB = graph.add("B");
    assert.equal(nodeA.id(), "A");
    assert.equal(nodeB.id(), "B");

    const hyperedge = graph.add(["A", "B", "C"]);
    assert.equal(hyperedge.id(), "A -> B -> C");

    const hyperedge2 = Hyperedge.create(["A", "B"], graph);
    assert.equal(hyperedge2.id(), "A -> B");

    const hyperedge3 = Hyperedge.create(["B", "C"], graph);
    assert.equal(hyperedge3.id(), "B -> C");
  });

  it("implicit subgraph", function () {
    const graph = new Hypergraph();
    const hyperedge = graph.add(["A", "B", "C"]); // A -> B and B -> C are implicit hyperedges

    assert(hyperedge.has(["A", "B"]));
    assert(hyperedge.has(["B", "C"]));
    assert(hyperedge.has(["A", "B", "C"]));

    assert(!hyperedge.has(["A", "C"]));
    assert(!hyperedge.has(["A", "B", "C", "D"]));
  });

  it("allows complex nodes", function () {
    const graph = new Hypergraph();
    const node1 = graph.add(1);
    assert(node1);
    assert(node1.node == 1);

    const date = new Date();
    const node2 = graph.add(date);
    assert(node2);
    assert(node2.node == date);
  });

  it("get hyperedges for subgraph", function () {
    const graph = new Hypergraph();
    graph.add(["A", "B", "C"]);
    graph.add(["A", "B", "D"]);
    graph.add(["A", "1", "D"]);
    graph.add(["A", "2", "B", "C"]);

    assert(graph.get(["A", "B"]).hyperedges().length == 2);
    assert(graph.get(["A", "B", "C"]).hyperedges().length == 1);
  });

  it("parses hypertype", function () {
    const graph = Hypergraph.parse(`A -> B -> C
A -> B -> D`);
    assert(graph);
    assert(graph.nodes.length == 4);
    assert(graph.hyperedges.length == 2);
    assert(graph.has(["A", "B", "C"]));
    assert(graph.has(["A", "B", "D"]));
    assert(graph.has(["A", "B"]));
  });

  it("pagerank", function () {
    const graph = Hypergraph.parse(`A -> B -> C
A -> B -> D
A -> B -> E
A -> C -> Z`);
    assert(graph);

    assert(graph.pageranks);
    assert(graph.pageranks["A"] > 0);
    assert(graph.pageranks["B"] > 0);
    assert(graph.pageranks["Z"] > 0);

    assert(graph.pagerank("Z")["C"] > 0);
  });

});
