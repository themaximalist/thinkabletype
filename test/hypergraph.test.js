import HyperType from "../src/index.js";
import Hyperedge from "../src/hyperedge.js";

import { expect, test } from "vitest";
import fs from "fs";

// TODO: finish integrating these tests
// TODO: rip out graphData into separate module..then test that
// TODO: then re-add all other tests back

// TODO: edit/remove data. should also update indexes
// TODO: activity parameter..way to expose in UI background sync is happening

test("empty hypertype", () => {
  const hypertype = new HyperType();
  expect(hypertype.hyperedges).toEqual([]);
});

test("create node (but dont add to hypertype)", async function () {
  const hypertype = new HyperType();

  const A = hypertype.create("A");
  expect(A.id).toBe("A");

  expect(hypertype.nodes.length).toBe(0);
  expect(!hypertype.has("A")).toBeTruthy();
  expect(!hypertype.has(A)).toBeTruthy();
});

test("add node", async function () {
  const hypertype = new HyperType();

  const A = hypertype.add("A");
  hypertype.add("A"); // dupe
  expect(hypertype.nodes.length).toBe(1);
  expect(hypertype.has("A")).toBeTruthy();
  expect(hypertype.has(A)).toBeTruthy();

  const B = hypertype.add("B");
  hypertype.add("B"); // dupe
  expect(hypertype.nodes.length).toBe(2);
  expect(hypertype.has("B")).toBeTruthy();
  expect(hypertype.has(B)).toBeTruthy();
});


test("add node object", async function () {
  const hypertype = new HyperType();
  const a = hypertype.add("A", { foo: "bar" });

  expect(a);
  hypertype.add(a); // dupe

  expect(hypertype.nodes.length == 1);
  expect(hypertype.has("A")).toBeTruthy();
  expect(hypertype.has(a)).toBeTruthy();
  expect(hypertype.nodes[0].object.foo).toEqual("bar");
});

test("add hyperedge", async function () {
  const hypertype = new HyperType();
  hypertype.add(["A", "B"]);
  hypertype.add(["A", "B"]);

  expect(hypertype.nodes.length).toBe(2);
  expect(hypertype.has("A")).toBeTruthy();
  expect(hypertype.has("B")).toBeTruthy();

  expect(hypertype.hyperedges.length).toBe(1);
  expect(hypertype.has(["A", "B"])).toBeTruthy();

  const hyperedge = hypertype.get(["A", "B"]);
  expect(hyperedge).toBeInstanceOf(Hyperedge);

  expect(hyperedge.nodes.length).toBe(2);
  expect(hyperedge.nodes[0].symbol).toBe("A");
  expect(hyperedge.nodes[1].symbol).toBe("B");

  const A = hypertype.get("A");
  expect(hyperedge.has("A")).toBeTruthy();
  expect(hyperedge.has(A)).toBeTruthy();
  expect(hyperedge.has("B")).toBeTruthy();
  expect(hyperedge.has("C")).toBeFalsy();

  expect(hyperedge.has(["A"])).toBeTruthy();
  expect(hyperedge.has(["B"])).toBeTruthy();
  expect(hyperedge.has(["A", "B"])).toBeTruthy();
  expect(hyperedge.has(["A", "B", "C"])).toBeFalsy();
});

/*

test("regression hyperedge id() collision", async function () {
  const hypertype = new HyperType();
  const edge = hypertype.add(["HELLO", "WORLD"]);

  expect(!hypertype.has("H"));
  expect(!edge.has("H"));
  expect(!edge.has(["O", "W"])); // regression
});

test("add multiple hyperedge", async function () {
  const hypertype = new HyperType();
  hypertype.add(["A", "B"]);
  hypertype.add(["A", "B", "C"]);
  expect(hypertype.nodes.length == 3);
  expect(hypertype.has("A"));
  expect(hypertype.has("B"));
  expect(hypertype.has("C"));

  expect(hypertype.hyperedges.length == 2);
});

test("has hyperedge", async function () {
  const hypertype = new HyperType();
  hypertype.add(["A", "B"]);

  expect(hypertype.has("A"));
  expect(hypertype.has("B"));
  expect(hypertype.has(["A", "B"]));
  expect(!hypertype.has(["A", "C"]));
});

test("init", async function () {
  const hypertype = new HyperType([
    ["A", "B"],
    ["A", "B", "C"],
  ]);

  expect(hypertype.has("A"));
  expect(hypertype.has("B"));
  expect(hypertype.has(["A", "B"]));
  expect(!hypertype.has(["A", "C"]));
});

test("get node", async function () {
  const hypertype = new HyperType();
  hypertype.add(["A", "B"]);

  const nodeA = hypertype.get("A");
  expect(nodeA);
  expect(nodeA.symbol == "A");

  const nodeB = hypertype.get("B");
  expect(nodeB);
  expect(nodeB.symbol == "B");
});

test("compare node", async function () {
  const hypertype = new HyperType();
  hypertype.add(["A", "B"]);

  const nodeA1 = hypertype.get("A");
  expect(nodeA1);
  expect(nodeA1.symbol == "A");

  const nodeA2 = hypertype.get("A");
  expect(nodeA2);
  expect(nodeA2.symbol == "A");

  expect(nodeA1.equal(nodeA2));

  const nodeB1 = hypertype.get("B");

  expect(!nodeA1.equal(nodeB1));
  expect(!nodeA2.equal(nodeB1));
});

test("compare hyperedge", async function () {
  const hypertype = new HyperType();
  const hyperedge1 = hypertype.add(["A", "B", "C"]);
  const hyperedge2 = hypertype.add(["A", "B", "C"]);
  const hyperedge3 = hypertype.add(["A", "B", "C", "D"]);

  expect(hyperedge1.equal(hyperedge2));
  expect(!hyperedge3.equal(hyperedge1));
});

test("hyperedge contains node", async function () {
  const hypertype = new HyperType();
  const hyperedge1 = hypertype.add(["A", "B", "C"]);
  const hyperedge2 = hypertype.add(["A", "B", "C", "D"]);

  expect(hyperedge1.has("A"));
  expect(hyperedge1.has("B"));
  expect(hyperedge1.has("C"));
  expect(!hyperedge1.has("D"));
  expect(hyperedge2.has("D"));
});

test("get hyperedges for node", async function () {
  const hypertype = new HyperType();
  hypertype.add(["A", "B", "C"]);
  const hyperedge = hypertype.add(["A", "B", "C", "D"]);

  const A = hypertype.get("A");
  expect(A);
  const hyperedges = A.hyperedges();

  expect(hyperedges.length == 2);
  expect(hyperedge.nodes[0].hyperedges().length == 2);
});

test("node and edge id", async function () {
  const hypertype = new HyperType();
  const nodeA = hypertype.add("A");
  const nodeB = hypertype.add("B");
  expect.equal(nodeA.id, "A");
  expect.equal(nodeB.id, "B");

  const hyperedge = hypertype.add(["A", "B", "C"]);
  expect.equal(hyperedge.id, "A->B->C");

  const hyperedge2 = hypertype.create(["A", "B"]);
  expect.equal(hyperedge2.id, "A->B");

  const hyperedge3 = hypertype.create(["B", "C"]);
  expect.equal(hyperedge3.id, "B->C");
});

test("implicit subgraph", async function () {
  const hypertype = new HyperType();
  const hyperedge = hypertype.add(["A", "B", "C"]); // A -> B and B -> C are implicit hyperedges

  expect(hyperedge.has(["A", "B"]));
  expect(hyperedge.has(["B", "C"]));
  expect(hyperedge.has(["A", "B", "C"]));

  expect(!hyperedge.has(["A", "C"]));
  expect(!hyperedge.has(["A", "B", "C", "D"]));
});

test("allows complex nodes", async function () {
  const hypertype = new HyperType();
  const node1 = hypertype.add(1);
  expect(node1);
  expect(node1.symbol == 1);

  const date = new Date();
  const node2 = hypertype.add(date);
  expect(node2);
  expect(node2.symbol == date);
});

test("get hyperedges for subgraph", async function () {
  const hypertype = new HyperType();
  hypertype.add(["A", "B", "C"]);
  hypertype.add(["A", "B", "D"]);
  hypertype.add(["A", "1", "D"]);
  hypertype.add(["A", "2", "B", "C"]);

  expect(hypertype.create(["A", "B"]).hyperedges().length == 2);
  expect(hypertype.create(["A", "B", "C"]).hyperedges().length == 1);
  expect(hypertype.create(["A", "C", "B"]).hyperedges().length == 0);
  expect(hypertype.create(["A", "C"]).hyperedges().length == 0);
});

test("parses hypertype", async function () {
  const hypertype = HyperType.parse(`A,B,C
A,B,D`);
  expect(hypertype);
  expect(hypertype.nodes.length == 4);
  expect(hypertype.hyperedges.length == 2);
  expect(hypertype.has(["A", "B", "C"]));
  expect(hypertype.has(["A", "B", "D"]));
});

test("parses comma in hypertype", async function () {
  const hypertype = HyperType.parse(`hypertype,tagline,"Turning C,S,V,s into Hypergraphs.`);
  expect(hypertype);
  expect(hypertype.nodes.length == 3);
  expect(hypertype.hyperedges.length == 1);
  expect(hypertype.has("hypertype"));
  expect(hypertype.has("tagline"));
  expect(hypertype.has("Turning C,S,V,s into Hypergraphs."));
});

// hyperedge's always have nodes but nodes don't always have hyperedges
// we want to test we can get the full view back, including nodes that don't have hyperedges
test("get entire hypergraph (nodes and hyperedges)", async function () {
  const hypertype = new HyperType();

  const A = hypertype.add("A");
  const B = hypertype.add("B");
  const C = hypertype.add("C");

  const AB = hypertype.add(["A", "B"]);

  expect(hypertype.has("A"));
  expect(hypertype.has("B"));
  expect(hypertype.has("C"));
  expect(hypertype.has(["A", "B"]));

  const all = hypertype.all;
  expect.equal(all.length, 2);
  expect.equal(all[0].length, 2);
  expect.equal(all[0][0], "A");
  expect.equal(all[0][1], "B");

  expect.equal(all[1].length, 1);
  expect.equal(all[1][0], "C");
});

test("all hides free nodes in edges", async function () {
  const hypertype = new HyperType();

  const A = hypertype.add("A");
  const B = hypertype.add("B");
  const C = hypertype.add("C");

  expect.equal(hypertype.nodes.length, 3);
  expect.equal(hypertype.hyperedges.length, 0);
  expect.equal(hypertype.all.length, 3);

  hypertype.add([A, B, C]);

  expect.equal(hypertype.nodes.length, 3);
  expect.equal(hypertype.hyperedges.length, 1);
  expect.equal(hypertype.all.length, 1); // collapses down to one node
});

test("iteratively build edge", async function () {
  const hypertype = new HyperType();

  const edge = hypertype.add(["A"]);

  expect.equal(hypertype.nodes.length, 1);
  expect.equal(hypertype.hyperedges.length, 1);
  expect.equal(hypertype.all.length, 1);

  const edge1 = hypertype.get(["A"]);
  expect(edge1);
  expect.equal(edge.id, edge1.id);

  edge1.add("B");
  expect(edge1.has("B"));
  expect(hypertype.has("B"));

  edge1.add(["C", "D"]);
  expect(edge1.has("C"));
  expect(hypertype.has("D"));
  expect(edge1.has(["A", "B", "C", "D"]));

  expect.equal(hypertype.nodes.length, 4);
  expect.equal(hypertype.hyperedges.length, 1);
  expect.equal(hypertype.all.length, 1); // collapses down to one node
});


test.skip("huge", () => {
  const hyperedges = fs
    .readFileSync("/Users/brad/Projects/loom/data/data", "utf-8")
    .split("\n")
    // .slice(0, 1000)
    .map((line) => {
      return line.split(" -> ");
    });

  // console.log(hyperedges);

  // const hypertype= new HyperType(hyperedges);
  const start = Date.now();
  const hypertype = new HyperType(hyperedges, { interwingle: 3 });
  console.log("GOT HYPERGRAPH");

  const data = hypertype.graphData();
  const elapsed = Date.now() - start;
  console.log("elapsed", elapsed);

  // console.log(data);

  expect(elapsed).toBeLessThan(300);
});
*/
