import Hypergraph from "../src/hypergraph.js";
import Hyperedge from "../src/hyperedge.js";

import assert from "assert";

describe("Hypergraph", function () {
  it("init empty", function () {
    const graph = new Hypergraph();
    assert(graph);
    assert(graph.nodes.length == 0);
  });

  it("create node (but dont add to graph)", async function () {
    const graph = new Hypergraph();

    const A = await graph.create("A");
    assert(graph.nodes.length == 0);
    assert(!graph.has("A"));
    assert(!graph.has(A));

    const B = await graph.create("B");
    await graph.create("B"); // dupe
    assert(graph.nodes.length == 0);
    assert(!graph.has("B"));
    assert(!graph.has(B));
  });

  it("add node", async function () {
    const graph = new Hypergraph();

    const A = await graph.add("A");
    await graph.add("A"); // dupe
    assert(graph.nodes.length == 1);
    assert(graph.has("A"));
    assert(graph.has(A));

    const B = await graph.add("B");
    await graph.add("B"); // dupe
    assert(graph.nodes.length == 2);
    assert(graph.has("B"));
    assert(graph.has(B));
  });


  it("add node object", async function () {
    const graph = new Hypergraph();
    const a = await graph.add("A");
    assert(a);
    graph.add(a); // dupe
    assert(graph.nodes.length == 1);
    assert(graph.has("A"));
    assert(graph.has(a));
  });

  it("add hyperedge", async function () {
    const graph = new Hypergraph();
    await graph.add(["A", "B"]);
    await graph.add(["A", "B"]);
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
    const edge = await graph.add(["HELLO", "WORLD"]);

    assert(!graph.has("H"));
    assert(!edge.has("H"));
    assert(!edge.has(["O", "W"])); // regression
  });

  it("add multiple hyperedge", async function () {
    const graph = new Hypergraph();
    await graph.add(["A", "B"]);
    await graph.add(["A", "B", "C"]);
    assert(graph.nodes.length == 3);
    assert(graph.has("A"));
    assert(graph.has("B"));
    assert(graph.has("C"));

    assert(graph.hyperedges.length == 2);
  });

  it("has hyperedge", async function () {
    const graph = new Hypergraph();
    await graph.add(["A", "B"]);

    assert(graph.has("A"));
    assert(graph.has("B"));
    assert(graph.has(["A", "B"]));
    assert(!graph.has(["A", "C"]));
  });

  it("load", async function () {
    const graph = await Hypergraph.load([
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
    await graph.add(["A", "B"]);

    const nodeA = graph.get("A");
    assert(nodeA);
    assert(nodeA.symbol == "A");

    const nodeB = graph.get("B");
    assert(nodeB);
    assert(nodeB.symbol == "B");
  });

  it("compare node", async function () {
    const graph = new Hypergraph();
    await graph.add(["A", "B"]);

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
    const hyperedge1 = await graph.add(["A", "B", "C"]);
    const hyperedge2 = await graph.add(["A", "B", "C"]);
    const hyperedge3 = await graph.add(["A", "B", "C", "D"]);

    assert(hyperedge1.equal(hyperedge2));
    assert(!hyperedge3.equal(hyperedge1));
  });

  it("hyperedge contains node", async function () {
    const graph = new Hypergraph();
    const hyperedge1 = await graph.add(["A", "B", "C"]);
    const hyperedge2 = await graph.add(["A", "B", "C", "D"]);

    assert(hyperedge1.has("A"));
    assert(hyperedge1.has("B"));
    assert(hyperedge1.has("C"));
    assert(!hyperedge1.has("D"));
    assert(hyperedge2.has("D"));
  });

  it("get hyperedges for node", async function () {
    const graph = new Hypergraph();
    graph.add(["A", "B", "C"]);
    const hyperedge = await graph.add(["A", "B", "C", "D"]);

    const hyperedges = graph.get("A").hyperedges();
    assert(hyperedges.length == 2);

    assert(hyperedge.nodes[0].hyperedges().length == 2);
  });

  it("node and edge id", async function () {
    const graph = new Hypergraph();
    const nodeA = await graph.add("A");
    const nodeB = await graph.add("B");
    assert.equal(nodeA.id(), "NODE:A");
    assert.equal(nodeB.id(), "NODE:B");

    const hyperedge = await graph.add(["A", "B", "C"]);
    assert.equal(hyperedge.id(), "NODE:A,NODE:B,NODE:C");

    const hyperedge2 = await Hyperedge.create(["A", "B"], graph);
    assert.equal(hyperedge2.id(), "NODE:A,NODE:B");

    const hyperedge3 = await Hyperedge.create(["B", "C"], graph);
    assert.equal(hyperedge3.id(), "NODE:B,NODE:C");
  });

  it("implicit subgraph", async function () {
    const graph = new Hypergraph();
    const hyperedge = await graph.add(["A", "B", "C"]); // A -> B and B -> C are implicit hyperedges

    assert(hyperedge.has(["A", "B"]));
    assert(hyperedge.has(["B", "C"]));
    assert(hyperedge.has(["A", "B", "C"]));

    assert(!hyperedge.has(["A", "C"]));
    assert(!hyperedge.has(["A", "B", "C", "D"]));
  });

  it("allows complex nodes", async function () {
    const graph = new Hypergraph();
    const node1 = await graph.add(1);
    assert(node1);
    assert(node1.symbol == 1);

    const date = new Date();
    const node2 = await graph.add(date);
    assert(node2);
    assert(node2.symbol == date);
  });

  it("get hyperedges for subgraph", async function () {
    const graph = new Hypergraph();
    await graph.add(["A", "B", "C"]);
    await graph.add(["A", "B", "D"]);
    await graph.add(["A", "1", "D"]);
    await graph.add(["A", "2", "B", "C"]);

    assert(graph.get(["A", "B"]).hyperedges().length == 2);
    assert(graph.get(["A", "B", "C"]).hyperedges().length == 1);
    assert(graph.get(["A", "C", "B"]).hyperedges().length == 0);
    assert(graph.get(["A", "C"]).hyperedges().length == 0);
  });

  it("parses hypertype", async function () {
    const graph = await Hypergraph.parse(`A,B,C
A,B,D`);
    assert(graph);
    assert(graph.nodes.length == 4);
    assert(graph.hyperedges.length == 2);
    assert(graph.has(["A", "B", "C"]));
    assert(graph.has(["A", "B", "D"]));
    assert(graph.has(["A", "B"]));
  });

  it("pagerank", async function () {
    const graph = await Hypergraph.parse(`A,B,C
A,B,D
A,B,E
A,C,Z`);
    assert(graph);

    assert(graph.pageranks);
    assert(graph.pageranks["A"] > 0);
    assert(graph.pageranks["B"] > 0);
    assert(graph.pageranks["C"] > 0);
    assert(graph.pagerank("Z")["C"] > 0);
  });

  it("parses comma in hypertype", async function () {
    const graph = await Hypergraph.parse(`hypertype,tagline,"Turning C,S,V,s into Hypergraphs.`);
    assert(graph);
    assert(graph.nodes.length == 3);
    assert(graph.hyperedges.length == 1);
    assert(graph.has("hypertype"));
    assert(graph.has("tagline"));
    assert(graph.has("Turning C,S,V,s into Hypergraphs."));
  });

  it("skips dupes", async function () {
    const graph = new Hypergraph();
    await graph.add("Red");
    await graph.add("Red");

    assert(graph);
    assert(graph.nodes.length == 1);

    const nodes = await graph.similar("Redish");
    assert(nodes.length == 1);
  });

  it("finds similar nodes in embedding space", async function () {
    this.timeout(2000);
    this.slow(1000);

    const graph = await Hypergraph.parse(`Red,Green,Blue,Pink`);
    assert(graph);
    assert(graph.nodes.length == 4);
    assert(graph.hyperedges.length == 1);
    assert(graph.has("Red"));

    const nodes = await graph.similar("Redish");
    assert(nodes.length == 1);
    assert(nodes[0].node.symbol == "Red");
    assert(nodes[0].distance > 0);
    assert(nodes[0].distance < 0.5);
  });

  it("finds similar nodes in embedding space", async function () {
    this.timeout(2000);
    this.slow(1000);

    const graph = await Hypergraph.parse(`Red,Green,Blue,Pink`);
    assert(graph);
    assert(graph.nodes.length == 4);
    assert(graph.hyperedges.length == 1);
    assert(graph.has("Red"));

    const nodes = await graph.similar("Redish");
    assert(nodes.length == 1);
    assert(nodes[0].node.symbol == "Red");
    assert(nodes[0].distance > 0);
    assert(nodes[0].distance < 0.5);
  });

  it("node similar shorthand", async function () {
    this.timeout(2000);
    this.slow(1000);

    const graph = await Hypergraph.parse(`Red,Green,Blue,Pink`);
    const pink = graph.get("Pink");

    const nodes = await pink.similar();
    assert(nodes[0].node.symbol == "Red");
    assert(nodes[0].distance > 0);
    assert(nodes[0].distance < 1);
  });

  it("hyperedge similar", async function () {
    this.timeout(2000);
    this.slow(1000);

    const graph = new Hypergraph();
    const edge1 = await graph.add(["Red", "Green", "Blue"]);
    const edge2 = await graph.add(["Red", "White", "Blue"]);
    await graph.add(["Bob", "Bill", "Sally"]);

    const nodes = await edge1.similar();
    assert(nodes.length == 1);
    assert(nodes.length == 1);
    assert(nodes[0].hyperedge.equal(edge2));
    assert(nodes[0].distance > 0);
    assert(nodes[0].distance < 0.5);
  });


  // llm given two nodes, find a third node
  // llm given two edges, find a third node/edge

});