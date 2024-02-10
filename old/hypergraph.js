import Hypergraph from "../src/hypergraph.js";
import Hyperedge from "../src/hyperedge.js";

// TODO: migrate Hypergraph from HyperTyper into HyperType
// TODO: create ForceGraph extension for exporting to ForceGraph
// TODO: build indexes into HyperType
// TODO: build searching, filtering, embeddings, LLM, interwingle into HyperType

// TODO: edit/remove data. should also update indexes
// TODO: activity parameter..way to expose in UI background sync is happening

import assert from "assert";

describe("Hypergraph", function () {
  it("init empty", function () {
    const graph = new Hypergraph();
    assert(graph);
    assert(graph.nodes.length == 0);
  });

  it("add node", async function () {
    const graph = new Hypergraph();

    const A = graph.add("A");
    graph.add("A"); // dupe
    assert(graph.nodes.length == 1);
    assert(graph.has("A"));
    assert(graph.has(A));

    const B = graph.add("B");
    graph.add("B"); // dupe
    assert(graph.nodes.length == 2);
    assert(graph.has("B"));
    assert(graph.has(B));
  });


  it("add node object", async function () {
    const graph = new Hypergraph();
    const a = graph.add("A", { foo: "bar" });
    assert(a);
    graph.add(a); // dupe

    assert(graph.nodes.length == 1);
    assert(graph.has("A"));
    assert(graph.has(a));
    assert.equal(graph.nodes[0].object.foo, "bar");
  });

  it("add hyperedge", async function () {
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
    assert(hyperedge instanceof Hyperedge);
    assert(hyperedge.nodes.length == 2);
    assert(hyperedge.nodes[0].symbol == "A");
    assert(hyperedge.nodes[1].symbol == "B");

    const A = graph.get("A");
    assert(hyperedge.has("A"));
    assert(hyperedge.has(A));
    assert(hyperedge.has("B"));
    assert(!hyperedge.has("C"));

    assert(hyperedge.has(["A"]));
    assert(hyperedge.has(["B"]));
    assert(hyperedge.has(["A", "B"]));
    assert(!hyperedge.has(["A", "B", "C"]));
  });

  it("regression hyperedge id() collision", async function () {
    const graph = new Hypergraph();
    const edge = graph.add(["HELLO", "WORLD"]);

    assert(!graph.has("H"));
    assert(!edge.has("H"));
    assert(!edge.has(["O", "W"])); // regression
  });

  it("add multiple hyperedge", async function () {
    const graph = new Hypergraph();
    graph.add(["A", "B"]);
    graph.add(["A", "B", "C"]);
    assert(graph.nodes.length == 3);
    assert(graph.has("A"));
    assert(graph.has("B"));
    assert(graph.has("C"));

    assert(graph.hyperedges.length == 2);
  });

  it("has hyperedge", async function () {
    const graph = new Hypergraph();
    graph.add(["A", "B"]);

    assert(graph.has("A"));
    assert(graph.has("B"));
    assert(graph.has(["A", "B"]));
    assert(!graph.has(["A", "C"]));
  });

  it("init", async function () {
    const graph = new Hypergraph([
      ["A", "B"],
      ["A", "B", "C"],
    ]);

    assert(graph.has("A"));
    assert(graph.has("B"));
    assert(graph.has(["A", "B"]));
    assert(!graph.has(["A", "C"]));
  });

  it("get node", async function () {
    const graph = new Hypergraph();
    graph.add(["A", "B"]);

    const nodeA = graph.get("A");
    assert(nodeA);
    assert(nodeA.symbol == "A");

    const nodeB = graph.get("B");
    assert(nodeB);
    assert(nodeB.symbol == "B");
  });

  it("compare node", async function () {
    const graph = new Hypergraph();
    graph.add(["A", "B"]);

    const nodeA1 = graph.get("A");
    assert(nodeA1);
    assert(nodeA1.symbol == "A");

    const nodeA2 = graph.get("A");
    assert(nodeA2);
    assert(nodeA2.symbol == "A");

    assert(nodeA1.equal(nodeA2));

    const nodeB1 = graph.get("B");

    assert(!nodeA1.equal(nodeB1));
    assert(!nodeA2.equal(nodeB1));
  });

  it("compare hyperedge", async function () {
    const graph = new Hypergraph();
    const hyperedge1 = graph.add(["A", "B", "C"]);
    const hyperedge2 = graph.add(["A", "B", "C"]);
    const hyperedge3 = graph.add(["A", "B", "C", "D"]);

    assert(hyperedge1.equal(hyperedge2));
    assert(!hyperedge3.equal(hyperedge1));
  });

  it("hyperedge contains node", async function () {
    const graph = new Hypergraph();
    const hyperedge1 = graph.add(["A", "B", "C"]);
    const hyperedge2 = graph.add(["A", "B", "C", "D"]);

    assert(hyperedge1.has("A"));
    assert(hyperedge1.has("B"));
    assert(hyperedge1.has("C"));
    assert(!hyperedge1.has("D"));
    assert(hyperedge2.has("D"));
  });

  it("get hyperedges for node", async function () {
    const graph = new Hypergraph();
    graph.add(["A", "B", "C"]);
    const hyperedge = graph.add(["A", "B", "C", "D"]);

    const A = graph.get("A");
    assert(A);
    const hyperedges = A.hyperedges();

    assert(hyperedges.length == 2);
    assert(hyperedge.nodes[0].hyperedges().length == 2);
  });

  it("node and edge id", async function () {
    const graph = new Hypergraph();
    const nodeA = graph.add("A");
    const nodeB = graph.add("B");
    assert.equal(nodeA.id, "A");
    assert.equal(nodeB.id, "B");

    const hyperedge = graph.add(["A", "B", "C"]);
    assert.equal(hyperedge.id, "A->B->C");

    const hyperedge2 = graph.create(["A", "B"]);
    assert.equal(hyperedge2.id, "A->B");

    const hyperedge3 = graph.create(["B", "C"]);
    assert.equal(hyperedge3.id, "B->C");
  });

  it("implicit subgraph", async function () {
    const graph = new Hypergraph();
    const hyperedge = graph.add(["A", "B", "C"]); // A -> B and B -> C are implicit hyperedges

    assert(hyperedge.has(["A", "B"]));
    assert(hyperedge.has(["B", "C"]));
    assert(hyperedge.has(["A", "B", "C"]));

    assert(!hyperedge.has(["A", "C"]));
    assert(!hyperedge.has(["A", "B", "C", "D"]));
  });

  it("allows complex nodes", async function () {
    const graph = new Hypergraph();
    const node1 = graph.add(1);
    assert(node1);
    assert(node1.symbol == 1);

    const date = new Date();
    const node2 = graph.add(date);
    assert(node2);
    assert(node2.symbol == date);
  });

  it("get hyperedges for subgraph", async function () {
    const graph = new Hypergraph();
    graph.add(["A", "B", "C"]);
    graph.add(["A", "B", "D"]);
    graph.add(["A", "1", "D"]);
    graph.add(["A", "2", "B", "C"]);

    assert(graph.create(["A", "B"]).hyperedges().length == 2);
    assert(graph.create(["A", "B", "C"]).hyperedges().length == 1);
    assert(graph.create(["A", "C", "B"]).hyperedges().length == 0);
    assert(graph.create(["A", "C"]).hyperedges().length == 0);
  });

  it("parses hypertype", async function () {
    const graph = Hypergraph.parse(`A,B,C
A,B,D`);
    assert(graph);
    assert(graph.nodes.length == 4);
    assert(graph.hyperedges.length == 2);
    assert(graph.has(["A", "B", "C"]));
    assert(graph.has(["A", "B", "D"]));
  });

  it("parses comma in hypertype", async function () {
    const graph = Hypergraph.parse(`hypertype,tagline,"Turning C,S,V,s into Hypergraphs.`);
    assert(graph);
    assert(graph.nodes.length == 3);
    assert(graph.hyperedges.length == 1);
    assert(graph.has("hypertype"));
    assert(graph.has("tagline"));
    assert(graph.has("Turning C,S,V,s into Hypergraphs."));
  });

  // hyperedge's always have nodes but nodes don't always have hyperedges
  // we want to test we can get the full view back, including nodes that don't have hyperedges
  it("get entire hypergraph (nodes and hyperedges)", async function () {
    const graph = new Hypergraph();

    const A = graph.add("A");
    const B = graph.add("B");
    const C = graph.add("C");

    const AB = graph.add(["A", "B"]);

    assert(graph.has("A"));
    assert(graph.has("B"));
    assert(graph.has("C"));
    assert(graph.has(["A", "B"]));

    const all = graph.all;
    assert.equal(all.length, 2);
    assert.equal(all[0].length, 2);
    assert.equal(all[0][0], "A");
    assert.equal(all[0][1], "B");

    assert.equal(all[1].length, 1);
    assert.equal(all[1][0], "C");
  });

  it("all hides free nodes in edges", async function () {
    const graph = new Hypergraph();

    const A = graph.add("A");
    const B = graph.add("B");
    const C = graph.add("C");

    assert.equal(graph.nodes.length, 3);
    assert.equal(graph.hyperedges.length, 0);
    assert.equal(graph.all.length, 3);

    graph.add([A, B, C]);

    assert.equal(graph.nodes.length, 3);
    assert.equal(graph.hyperedges.length, 1);
    assert.equal(graph.all.length, 1); // collapses down to one node
  });

  it("iteratively build edge", async function () {
    const graph = new Hypergraph();

    const edge = graph.add(["A"]);

    assert.equal(graph.nodes.length, 1);
    assert.equal(graph.hyperedges.length, 1);
    assert.equal(graph.all.length, 1);

    const edge1 = graph.get(["A"]);
    assert(edge1);
    assert.equal(edge.id, edge1.id);

    edge1.add("B");
    assert(edge1.has("B"));
    assert(graph.has("B"));

    edge1.add(["C", "D"]);
    assert(edge1.has("C"));
    assert(graph.has("D"));
    assert(edge1.has(["A", "B", "C", "D"]));

    assert.equal(graph.nodes.length, 4);
    assert.equal(graph.hyperedges.length, 1);
    assert.equal(graph.all.length, 1); // collapses down to one node
  });
});
