import assert from "assert";

import Hypergraph from "../src/hypergraph.js";

describe("Force graph", function () {

  it.skip("interwingle isolated", () => {
    const hyperedges = [
      ["A", "B", "C"],
      ["A", "1", "2"]
    ];

    const hypergraph = new Hypergraph(hyperedges, {
      interwingle: Hypergraph.INTERWINGLE.ISOLATED
    });

    assert(hypergraph);
    assert(hypergraph.nodes.length === 5);
    assert(hypergraph.hyperedges.length === 2);

    assert(hypergraph.hyperedges[0].symbols.length === 3);

    // expect(hypergraph.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    // expect(hypergraph.hyperedges[0].nodes[0].id).toEqual("0:A");
    // expect(hypergraph.hyperedges[0].nodes[1].id).toEqual("0:A.B");
    // expect(hypergraph.hyperedges[1].symbols).toEqual(["A", "1", "2"]);
    // expect(hypergraph.hyperedges[1].nodes[0].id).toEqual("1:A");
    // expect(hypergraph.hyperedges[1].nodes[1].id).toEqual("1:A.1");
  });
});

/*
    */

/*
const data = hypergraph.graphData();
expect(data.links.length).toBe(4);
expect(data.links[0].id).toBe("0:A->0:A.B");
expect(data.links[0].source).toBe("0:A");
expect(data.links[0].target).toBe("0:A.B");
expect(data.links[1].id).toBe("0:A.B->0:A.B.C");
expect(data.links[1].source).toBe("0:A.B");
expect(data.links[1].target).toBe("0:A.B.C");

expect(data.links[2].id).toBe("1:A->1:A.1");
expect(data.links[2].source).toBe("1:A");
expect(data.links[2].target).toBe("1:A.1");

expect(data.links[3].id).toBe("1:A.1->1:A.1.2");
expect(data.links[3].source).toBe("1:A.1");
expect(data.links[3].target).toBe("1:A.1.2");
});
});

/*


test("confluence", () => {
const hyperedges = [
// A.B.C && A.1.2 with A as confluence node
["A", "B", "C"],
["A", "1", "2"]
];
const hypergraph = new Hypergraph({
interwingle: Hypergraph.INTERWINGLE.CONFLUENCE
});

hypergraph.addHyperedges(hyperedges);
expect(hypergraph.hyperedges.length).toEqual(2);

expect(hypergraph.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
expect(hypergraph.hyperedges[0].nodes[0].id).toEqual("A");
expect(hypergraph.hyperedges[0].nodes[1].id).toEqual("A.B");
expect(hypergraph.hyperedges[1].symbols).toEqual(["A", "1", "2"]);
expect(hypergraph.hyperedges[1].nodes[0].id).toEqual("A");
expect(hypergraph.hyperedges[1].nodes[1].id).toEqual("A.1");

const data = hypergraph.graphData();
expect(data.links.length).toBe(4);
expect(data.links[0].id).toBe("A->A.B");
expect(data.links[1].id).toBe("A.B->A.B.C");
expect(data.links[2].id).toBe("A->A.1");
expect(data.links[3].id).toBe("A.1->A.1.2");
});

test("fusion start", () => {
const hyperedges = [
// A.B.C.D.E
["A", "B", "C"],
["C", "D", "E"]
];

const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.FUSION });
hypergraph.addHyperedges(hyperedges);
expect(hypergraph.hyperedges.length).toEqual(2);

expect(hypergraph.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
expect(hypergraph.hyperedges[0].nodes[0].id).toEqual("A");
expect(hypergraph.hyperedges[0].nodes[1].id).toEqual("A.B");
expect(hypergraph.hyperedges[1].symbols).toEqual(["C", "D", "E"]);
expect(hypergraph.hyperedges[1].nodes[0].id).toEqual("C");
expect(hypergraph.hyperedges[1].nodes[1].id).toEqual("C.D");

const data = hypergraph.graphData();
expect(data.nodes.length).toBe(5); // C masquerades as A.B.C
expect(data.links.length).toBe(4);
expect(data.links[0].id).toBe("A->A.B");
expect(data.links[1].id).toBe("A.B->A.B.C");
expect(data.links[2].id).toBe("A.B.C->C.D");
expect(data.links[3].id).toBe("C.D->C.D.E");

expect(hypergraph.masqueradeIndex.size).toBe(1);
// console.log(hypergraph.masqueradeIndex);
});

test("fusion end", () => {
const hyperedges = [
// A.B.C 1.2.C with C as fusion node
["A", "B", "C"],
["1", "2", "C"]
];

const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.FUSION });
hypergraph.addHyperedges(hyperedges);
expect(hypergraph.hyperedges.length).toEqual(2);

const data = hypergraph.graphData();

expect(data.nodes.length).toBe(5); // C masquerades as A.B.C
expect(data.links.length).toBe(4);

expect(data.links[0].id).toBe("A->A.B");
expect(data.links[1].id).toBe("A.B->A.B.C");
expect(data.links[2].id).toBe("1->1.2");
expect(data.links[3].id).toBe("1.2->A.B.C");
});

test("bridge", () => {
const hyperedges = [
["A", "vs", "B"],
["1", "vs", "2"]
];

const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.BRIDGE });
hypergraph.addHyperedges(hyperedges);

expect(hypergraph.hyperedges.length).toEqual(2);

const data = hypergraph.graphData();
expect(data.nodes.length).toBe(7); // vs creates connection node

const nodeIds = data.nodes.map((node) => node.id);
expect(nodeIds).toContain("A");
expect(nodeIds).toContain("A.vs");
expect(nodeIds).toContain("A.vs.B");
expect(nodeIds).toContain("1");
expect(nodeIds).toContain("1.vs");
expect(nodeIds).toContain("1.vs.2");
expect(nodeIds).toContain("vs#bridge");

expect(data.links.length).toBe(6);

const linkIds = data.links.map((link) => link.id);
expect(linkIds).toContain("A->A.vs");
expect(linkIds).toContain("A.vs->A.vs.B");
expect(linkIds).toContain("1->1.vs");
expect(linkIds).toContain("1.vs->1.vs.2");

expect(linkIds).toContain("vs#bridge->A.vs");
expect(linkIds).toContain("vs#bridge->1.vs");
});

test("bridge and fusion", () => {
const hyperedges = [
["A", "B", "C"],
["1", "B", "C"]
];

const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.BRIDGE });
hypergraph.addHyperedges(hyperedges);

expect(hypergraph.hyperedges.length).toEqual(2);

const data = hypergraph.graphData();
expect(data.nodes.length).toBe(6); // 5 nodes + 1 bridge node
expect(data.links.length).toBe(6);
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

// const hypergraph = new Hypergraph(hyperedges);
const start = Date.now();
const hypergraph = new Hypergraph({ interwingle: 3 });
hypergraph.addHyperedges(hyperedges);
console.log("GOT HYPERGRAPH");

const data = hypergraph.graphData();
const elapsed = Date.now() - start;
console.log("elapsed", elapsed);

// console.log(data);

expect(elapsed).toBeLessThan(300);
*/