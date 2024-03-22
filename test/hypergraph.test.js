import ThinkableType from "../src/index.js";
import Hyperedge from "../src/Hyperedge.js";

import { expect, test } from "vitest";

test("empty thinkabletype", () => {
  const thinkabletype = new ThinkableType();
  expect(thinkabletype.hyperedges).toEqual([]);
});

test("build edge (isolated)", () => {
  const thinkabletype = new ThinkableType();
  const edge = thinkabletype.add("A", "B");
  expect(edge).instanceOf(Hyperedge);
  expect(edge.symbols).toEqual(["A", "B"]);
  expect(edge.id).toEqual("0:A->B");
  expect(thinkabletype.symbols).toEqual(["A", "B"]);

  edge.add("C");
  expect(edge.symbols).toEqual(["A", "B", "C"]);
  expect(edge.id).toEqual("0:A->B->C");
  expect(thinkabletype.symbols).toEqual(["A", "B", "C"]);

  const edge2 = thinkabletype.get("A", "B", "C");
  expect(edge2).instanceOf(Hyperedge);

  edge2.remove("C");
  expect(edge.symbols).toEqual(["A", "B"]);
  expect(edge.id).toEqual("0:A->B");
  expect(thinkabletype.symbols).toEqual(["A", "B"]);

  edge2.remove(0)
  expect(edge.symbols).toEqual(["B"]);
  expect(edge.id).toEqual("0:B");
  expect(thinkabletype.symbols).toEqual(["B"]);
});

test("build edge (confluence)", () => {
  const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.CONFLUENCE });
  const edge = thinkabletype.add("A", "B");
  expect(edge).instanceOf(Hyperedge);
  expect(edge.symbols).toEqual(["A", "B"]);
  expect(edge.id).toEqual("A->B");
  expect(thinkabletype.symbols).toEqual(["A", "B"]);

  edge.add("C");
  expect(edge.symbols).toEqual(["A", "B", "C"]);
  expect(edge.id).toEqual("A->B->C");
  expect(thinkabletype.symbols).toEqual(["A", "B", "C"]);

  const edge2 = thinkabletype.get("A", "B", "C");
  expect(edge2).instanceOf(Hyperedge);

  edge2.remove("C");
  expect(edge.symbols).toEqual(["A", "B"]);
  expect(edge.id).toEqual("A->B");
  expect(thinkabletype.symbols).toEqual(["A", "B"]);

  edge2.remove(0)
  expect(edge.symbols).toEqual(["B"]);
  expect(edge.id).toEqual("B");
  expect(thinkabletype.symbols).toEqual(["B"]);
});

test("edge dupes (fusion)", () => {
  const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
  const edge1 = thinkabletype.add("A", "B");
  const edge2 = thinkabletype.add("A", "B");
  expect(edge1.id).toBe(edge2.id);
});

test("init with edges", () => {
  const hyperedges = [
    ["A", "B"],
  ];

  const thinkabletype = new ThinkableType({ hyperedges });
  expect(thinkabletype.hyperedges.length).toBe(1);
});

test("has node", () => {
  const thinkabletype = new ThinkableType({
    hyperedges: [
      ["A", "B"],
    ]
  });

  expect(thinkabletype.has("A")).toBeTruthy();
  expect(thinkabletype.has("B")).toBeTruthy();
  expect(thinkabletype.has("C")).toBeFalsy();
});

test("has partial edge", () => {
  const thinkabletype = new ThinkableType({
    hyperedges: [
      ["A", "B", "C"],
    ]
  });

  expect(thinkabletype.has("A", "B")).toBeTruthy();
  expect(thinkabletype.has("B", "C")).toBeTruthy();
  expect(thinkabletype.has("A", "B", "C")).toBeTruthy();
  expect(thinkabletype.has("A", "C")).toBeFalsy();
  expect(thinkabletype.has("A", "B", "C", "D")).toBeFalsy();
});

test("regression hyperedge id() collision", async function () {
  const thinkabletype = new ThinkableType();
  const edge = thinkabletype.add("HELLO", "WORLD");

  expect(thinkabletype.has("H")).toBeFalsy();
  expect(edge.has("H")).toBeFalsy();
  expect(edge.has("O", "W")).toBeFalsy(); // regression
});

test("filter on symbol", () => {
  const thinkabletype = new ThinkableType({
    hyperedges: [
      ["A", "B", "C"],
      ["1", "2", "C"],
    ]
  });

  expect(thinkabletype.filter("A").length).toBe(1);
  expect(thinkabletype.filter("B").length).toBe(1);
  expect(thinkabletype.filter("1").length).toBe(1);
  expect(thinkabletype.filter("2").length).toBe(1);
  expect(thinkabletype.filter("C").length).toBe(2);
});

test("filter on partial edge", () => {
  const thinkabletype = new ThinkableType({
    hyperedges: [
      ["A", "B", "C"],
      ["A", "B", "D"],
    ]
  });

  expect(thinkabletype.filter("A", "B").length).toBe(2);
  expect(thinkabletype.filter("A", "B", "C").length).toBe(1);
  expect(thinkabletype.filter("A", "B", "D").length).toBe(1);
});

test("filter on multiple edges", () => {
  const thinkabletype = new ThinkableType({
    hyperedges: [
      ["A", "B", "1"],
      ["A", "B", "2"],
    ]
  });

  expect(thinkabletype.filter([["A", "B", "1"]]).length).toBe(1);
  expect(thinkabletype.filter("A", "B").length).toBe(2);
  expect(thinkabletype.filter("A", "B", "1").length).toBe(1);
  expect(thinkabletype.filter([["A", "B", "1"], ["A", "B", "2"]]).length).toBe(2);
});

test("compare hyperedge (isolated)", async function () {
  const thinkabletype = new ThinkableType();
  const hyperedge1 = thinkabletype.add("A", "B", "C");
  const hyperedge2 = thinkabletype.add("A", "B", "C");
  const hyperedge3 = thinkabletype.add("A", "B", "C", "D");

  expect(hyperedge1.equal(hyperedge2)).toBeFalsy();
  expect(hyperedge3.equal(hyperedge1)).toBeFalsy();
});

test("compare hyperedge (confluence)", async function () {
  const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.CONFLUENCE });
  const hyperedge1 = thinkabletype.add("A", "B", "C");
  const hyperedge2 = thinkabletype.add("A", "B", "C");
  const hyperedge3 = thinkabletype.add("A", "B", "C", "D");

  expect(hyperedge1.equal(hyperedge2)).toBeTruthy();
  expect(hyperedge3.equal(hyperedge1)).toBeFalsy();
});

test("parses thinkabletype", async function () {
  const thinkabletype = ThinkableType.parse(`A,B,C
A,B,D`);
  expect(thinkabletype);
  expect(thinkabletype.symbols.length == 4);
  expect(thinkabletype.hyperedges.length == 2);
  expect(thinkabletype.has("A", "B", "C")).toBeTruthy();
  expect(thinkabletype.has("A", "B", "D")).toBeTruthy();
});

test("parses comma in thinkabletype", async function () {
  const thinkabletype = ThinkableType.parse(`thinkabletype,tagline,"Turning C,S,V,s into Hypergraphs."`);
  expect(thinkabletype);
  expect(thinkabletype.symbols.length == 3);
  expect(thinkabletype.hyperedges.length == 1);
  expect(thinkabletype.has("thinkabletype")).toBeTruthy();
  expect(thinkabletype.has("tagline")).toBeTruthy();
  expect(thinkabletype.has("Turning C,S,V,s into Hypergraphs.")).toBeTruthy();
});

test("reset", async function () {
  const thinkabletype = ThinkableType.parse(`thinkabletype,tagline,"Turning C,S,V,s into Hypergraphs."`);
  expect(thinkabletype);
  thinkabletype.reset();
  expect(thinkabletype.symbols.length).toBe(0);
  expect(thinkabletype.hyperedges.length).toBe(0);
  expect(thinkabletype.has("thinkabletype")).toBeFalsy();
  expect(thinkabletype.has("tagline")).toBeFalsy();
  expect(thinkabletype.has("Turning C,S,V,s into Hypergraphs.")).toBeFalsy();
  expect(thinkabletype.synced).toBeTruthy();
});

test("remove hyperedge", async function () {
  const thinkabletype = ThinkableType.parse(`A,B,C\r\n1,2,3`);
  expect(thinkabletype);
  expect(thinkabletype.symbols.length).toBe(6);
  expect(thinkabletype.hyperedges.length).toBe(2);
  expect(thinkabletype.has("A", "B", "C")).toBeTruthy();
  expect(thinkabletype.remove("A", "B", "C")).toBeTruthy();
  expect(thinkabletype.has("A", "B", "C")).toBeFalsy();
  expect(thinkabletype.symbols.length).toBe(3);
  expect(thinkabletype.hyperedges.length).toBe(1);
});

test("export", async function () {
  const input = `thinkabletype,tagline,"Turning C,S,V,s into Hypergraphs."\r\nA,B,C,D,E,F,G`;
  const thinkabletype = ThinkableType.parse(input);

  const output = thinkabletype.export();
  expect(input).toBe(output);
});


test("parse on existing hypergraph", async function () {
  const input = `thinkabletype,tagline,"Turning C,S,V,s into Hypergraphs."\r\nA,B,C,D,E,F,G`;
  const thinkabletype = new ThinkableType();
  thinkabletype.parse(input);

  expect(thinkabletype.symbols.length).toBe(10);
  expect(thinkabletype.hyperedges.length).toBe(2);
  expect(thinkabletype.has("thinkabletype")).toBeTruthy();
  expect(thinkabletype.has("tagline")).toBeTruthy();
  expect(thinkabletype.has("Turning C,S,V,s into Hypergraphs.")).toBeTruthy();

  thinkabletype.parse(`A,B,C\r\n1,2,3`);
  expect(thinkabletype.symbols.length).toBe(6);
  expect(thinkabletype.hyperedges.length).toBe(2);
  expect(thinkabletype.has("thinkabletype")).toBeFalsy();
  expect(thinkabletype.has("1")).toBeTruthy();
});

test("hyperedge has", () => {
  const thinkabletype = new ThinkableType();
  const edge = thinkabletype.add("A", "B", "C");
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
