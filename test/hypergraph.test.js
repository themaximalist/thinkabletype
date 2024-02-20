import HyperType from "../src/index.js";
import Hyperedge from "../src/Hyperedge.js";

import { expect, test } from "vitest";

test("empty hypertype", () => {
  const hypertype = new HyperType();
  expect(hypertype.hyperedges).toEqual([]);
});

test("build edge (isolated)", () => {
  const hypertype = new HyperType();
  const edge = hypertype.add("A", "B");
  expect(edge).instanceOf(Hyperedge);
  expect(edge.symbols).toEqual(["A", "B"]);
  expect(edge.id).toEqual("0:A->B");
  expect(hypertype.symbols).toEqual(["A", "B"]);

  edge.add("C");
  expect(edge.symbols).toEqual(["A", "B", "C"]);
  expect(edge.id).toEqual("0:A->B->C");
  expect(hypertype.symbols).toEqual(["A", "B", "C"]);

  const edge2 = hypertype.get("A", "B", "C");
  expect(edge2).instanceOf(Hyperedge);

  edge2.remove("C");
  expect(edge.symbols).toEqual(["A", "B"]);
  expect(edge.id).toEqual("0:A->B");
  expect(hypertype.symbols).toEqual(["A", "B"]);

  edge2.remove(0)
  expect(edge.symbols).toEqual(["B"]);
  expect(edge.id).toEqual("0:B");
  expect(hypertype.symbols).toEqual(["B"]);
});

test("build edge (confluence)", () => {
  const hypertype = new HyperType({ interwingle: HyperType.INTERWINGLE.CONFLUENCE });
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

test("edge dupes (fusion)", () => {
  const hypertype = new HyperType({ interwingle: HyperType.INTERWINGLE.FUSION });
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

test("filter on multiple edges", () => {
  const hypertype = new HyperType({
    hyperedges: [
      ["A", "B", "1"],
      ["A", "B", "2"],
    ]
  });

  expect(hypertype.filter([["A", "B", "1"]]).length).toBe(1);
  expect(hypertype.filter("A", "B").length).toBe(2);
  expect(hypertype.filter("A", "B", "1").length).toBe(1);
  expect(hypertype.filter([["A", "B", "1"], ["A", "B", "2"]]).length).toBe(2);
});

test("compare hyperedge (isolated)", async function () {
  const hypertype = new HyperType();
  const hyperedge1 = hypertype.add("A", "B", "C");
  const hyperedge2 = hypertype.add("A", "B", "C");
  const hyperedge3 = hypertype.add("A", "B", "C", "D");

  expect(hyperedge1.equal(hyperedge2)).toBeFalsy();
  expect(hyperedge3.equal(hyperedge1)).toBeFalsy();
});

test("compare hyperedge (confluence)", async function () {
  const hypertype = new HyperType({ interwingle: HyperType.INTERWINGLE.CONFLUENCE });
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
  expect(hypertype.has("A", "B", "C")).toBeTruthy();
  expect(hypertype.has("A", "B", "D")).toBeTruthy();
});

test("parses comma in hypertype", async function () {
  const hypertype = HyperType.parse(`hypertype,tagline,"Turning C,S,V,s into Hypergraphs."`);
  expect(hypertype);
  expect(hypertype.symbols.length == 3);
  expect(hypertype.hyperedges.length == 1);
  expect(hypertype.has("hypertype")).toBeTruthy();
  expect(hypertype.has("tagline")).toBeTruthy();
  expect(hypertype.has("Turning C,S,V,s into Hypergraphs.")).toBeTruthy();
});

test("reset", async function () {
  const hypertype = HyperType.parse(`hypertype,tagline,"Turning C,S,V,s into Hypergraphs."`);
  expect(hypertype);
  hypertype.reset();
  expect(hypertype.symbols.length).toBe(0);
  expect(hypertype.hyperedges.length).toBe(0);
  expect(hypertype.has("hypertype")).toBeFalsy();
  expect(hypertype.has("tagline")).toBeFalsy();
  expect(hypertype.has("Turning C,S,V,s into Hypergraphs.")).toBeFalsy();
  expect(hypertype.synced).toBeTruthy();
});

test("remove hyperedge", async function () {
  const hypertype = HyperType.parse(`A,B,C\r\n1,2,3`);
  expect(hypertype);
  expect(hypertype.symbols.length).toBe(6);
  expect(hypertype.hyperedges.length).toBe(2);
  expect(hypertype.has("A", "B", "C")).toBeTruthy();
  expect(hypertype.remove("A", "B", "C")).toBeTruthy();
  expect(hypertype.has("A", "B", "C")).toBeFalsy();
  expect(hypertype.symbols.length).toBe(3);
  expect(hypertype.hyperedges.length).toBe(1);
});

test("export", async function () {
  const input = `hypertype,tagline,"Turning C,S,V,s into Hypergraphs."\r\nA,B,C,D,E,F,G`;
  const hypertype = HyperType.parse(input);

  const output = hypertype.export();
  expect(input).toBe(output);
});


test("parse on existing hypergraph", async function () {
  const input = `hypertype,tagline,"Turning C,S,V,s into Hypergraphs."\r\nA,B,C,D,E,F,G`;
  const hypertype = new HyperType();
  hypertype.parse(input);

  expect(hypertype.symbols.length).toBe(10);
  expect(hypertype.hyperedges.length).toBe(2);
  expect(hypertype.has("hypertype")).toBeTruthy();
  expect(hypertype.has("tagline")).toBeTruthy();
  expect(hypertype.has("Turning C,S,V,s into Hypergraphs.")).toBeTruthy();

  hypertype.parse(`A,B,C\r\n1,2,3`);
  expect(hypertype.symbols.length).toBe(6);
  expect(hypertype.hyperedges.length).toBe(2);
  expect(hypertype.has("hypertype")).toBeFalsy();
  expect(hypertype.has("1")).toBeTruthy();
});

test("hyperedge has", () => {
  const hypertype = new HyperType();
  const edge = hypertype.add("A", "B", "C");
  expect(edge.has("A")).toBeTruthy();
  expect(edge.has(["A"])).toBeTruthy();

  expect(edge.has("B")).toBeTruthy();
  expect(edge.has(["B"])).toBeTruthy();

  expect(edge.has("C")).toBeTruthy();
  expect(edge.has(["C"])).toBeTruthy();

  expect(edge.has("A", "B")).toBeTruthy();
  expect(edge.has(["A", "B"])).toBeTruthy();

  expect(edge.has("B", "C")).toBeTruthy();
  expect(edge.has(["B", "C"])).toBeTruthy();

  expect(edge.has("A", "C")).toBeTruthy();
  expect(edge.has(["A", "C"])).toBeFalsy();
});
