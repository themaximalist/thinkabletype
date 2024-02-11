import HyperType from "../src/index.js";
import Hyperedge from "../src/Hyperedge.js";

import { expect, test } from "vitest";

// TODO: finish integrating these tests
// TODO: rip out graphData into separate module..then test that
// TODO: then re-add all other tests back
// TODO: editing...adding nodes dynamically on an edge...renaming parts of an edge

// TODO: edit/remove data. should also update indexes
// TODO: activity parameter..way to expose in UI background sync is happening

// TODO: should dynamic ID generation happen in graphData?

// Hyperedge index cannot depend on hypergraph because it may not be on hypergraph

test("empty hypertype", () => {
  const hypertype = new HyperType();
  expect(hypertype.hyperedges).toEqual([]);
});

test("build edge", () => {
  const hypertype = new HyperType();
  const edge = hypertype.add("A", "B");
  expect(edge).instanceOf(Hyperedge);
  expect(edge.symbols).toEqual(["A", "B"]);
  expect(edge.id).toEqual("A->B");
  expect(hypertype.symbols).toEqual(["A", "B"]);

  edge.add("C");
  expect(edge.symbols).toEqual(["A", "B", "C"]);
  expect(edge.id).toEqual("A->B->C");
  expect(hypertype.symbols).toEqual(["A", "B", "C"]);

  const edge2 = hypertype.get("A", "B", "C");
  expect(edge2).instanceOf(Hyperedge);

  edge2.remove("C");
  expect(edge.symbols).toEqual(["A", "B"]);
  expect(edge.id).toEqual("A->B");
  expect(hypertype.symbols).toEqual(["A", "B"]);

  edge2.remove(0)
  expect(edge.symbols).toEqual(["B"]);
  expect(edge.id).toEqual("B");
  expect(hypertype.symbols).toEqual(["B"]);
});

test("edge dupes", () => {
  const hypertype = new HyperType();
  const edge1 = hypertype.add("A", "B");
  const edge2 = hypertype.add("A", "B");
  expect(edge1.id).toBe(edge2.id);
});

test("init with edges", () => {
  const hyperedges = [
    ["A", "B"],
  ];

  const hypertype = new HyperType({ hyperedges });
  expect(hypertype.hyperedges.length).toBe(1);
});

test("has node", () => {
  const hypertype = new HyperType({
    hyperedges: [
      ["A", "B"],
    ]
  });

  expect(hypertype.has("A")).toBeTruthy();
  expect(hypertype.has("B")).toBeTruthy();
  expect(hypertype.has("C")).toBeFalsy();
});

test("has partial edge", () => {
  const hypertype = new HyperType({
    hyperedges: [
      ["A", "B", "C"],
    ]
  });

  expect(hypertype.has("A", "B")).toBeTruthy();
  expect(hypertype.has("B", "C")).toBeTruthy();
  expect(hypertype.has("A", "B", "C")).toBeTruthy();
  expect(hypertype.has("A", "C")).toBeFalsy();
  expect(hypertype.has("A", "B", "C", "D")).toBeFalsy();
});

test("regression hyperedge id() collision", async function () {
  const hypertype = new HyperType();
  const edge = hypertype.add("HELLO", "WORLD");

  expect(hypertype.has("H")).toBeFalsy();
  expect(edge.has("H")).toBeFalsy();
  expect(edge.has("O", "W")).toBeFalsy(); // regression
});

test("filter on symbol", () => {
  const hypertype = new HyperType({
    hyperedges: [
      ["A", "B", "C"],
      ["1", "2", "C"],
    ]
  });

  expect(hypertype.filter("A").length).toBe(1);
  expect(hypertype.filter("B").length).toBe(1);
  expect(hypertype.filter("1").length).toBe(1);
  expect(hypertype.filter("2").length).toBe(1);
  expect(hypertype.filter("C").length).toBe(2);
});

test("filter on partial edge", () => {
  const hypertype = new HyperType({
    hyperedges: [
      ["A", "B", "C"],
      ["A", "B", "D"],
    ]
  });

  expect(hypertype.filter("A", "B").length).toBe(2);
  expect(hypertype.filter("A", "B", "C").length).toBe(1);
  expect(hypertype.filter("A", "B", "D").length).toBe(1);
});

test("compare hyperedge", async function () {
  const hypertype = new HyperType();
  const hyperedge1 = hypertype.add("A", "B", "C");
  const hyperedge2 = hypertype.add("A", "B", "C");
  const hyperedge3 = hypertype.add("A", "B", "C", "D");

  expect(hyperedge1.equal(hyperedge2)).toBeTruthy();
  expect(hyperedge3.equal(hyperedge1)).toBeFalsy();
});

test("parses hypertype", async function () {
  const hypertype = HyperType.parse(`A,B,C
A,B,D`);
  expect(hypertype);
  expect(hypertype.symbols.length == 4);
  expect(hypertype.hyperedges.length == 2);
  expect(hypertype.has("A", "B", "C"));
  expect(hypertype.has("A", "B", "D"));
});

test("parses comma in hypertype", async function () {
  const hypertype = HyperType.parse(`hypertype,tagline,"Turning C,S,V,s into Hypergraphs.`);
  expect(hypertype);
  expect(hypertype.symbols.length == 3);
  expect(hypertype.hyperedges.length == 1);
  expect(hypertype.has("hypertype"));
  expect(hypertype.has("tagline"));
  expect(hypertype.has("Turning C,S,V,s into Hypergraphs."));
});

test.skip("huge", () => {
  const fs = require("fs");
  const hyperedges = fs
    .readFileSync("/Users/brad/Projects/loom/data/data", "utf-8")
    .split("\n")
    .slice(0, 1000)
    .map((line) => {
      return line.split(" -> ");
    });

  // const hypertype = new HyperType(hyperedges);
  const start = Date.now();
  const hypertype = new HyperType({ hyperedges });
  const data = hypertype.graphData();
  const elapsed = Date.now() - start;
  console.log("elapsed", elapsed);

  console.log(data);

  expect(elapsed).toBeLessThan(300);
});
