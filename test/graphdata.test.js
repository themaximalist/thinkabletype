import HyperType from "../src/index.js";

import { expect, test } from "vitest";

test("single hyperedge (isolate)", () => {
    const hypertype = new HyperType({
        hyperedges: [["A", "B", "C"]]
    });
    expect(hypertype).toBeInstanceOf(HyperType);
    expect(hypertype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("0:A");
    expect(data.nodes[1].id).toBe("0:A.B");
    expect(data.nodes[2].id).toBe("0:A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("0:A->0:A.B");
    expect(data.links[0].source).toBe("0:A");
    expect(data.links[0].target).toBe("0:A.B");
    expect(data.links[0]._meta.hyperedgeID).toBe("0:A->B->C");

    expect(data.links[1].id).toBe("0:A.B->0:A.B.C");
    expect(data.links[1].source).toBe("0:A.B");
    expect(data.links[1].target).toBe("0:A.B.C");
    expect(data.links[1]._meta.hyperedgeID).toBe("0:A->B->C");
});

test("single hyperedge (confluence)", () => {
    const hypertype = new HyperType({
        hyperedges: [["A", "B", "C"]],
        interwingle: HyperType.INTERWINGLE.CONFLUENCE
    });
    expect(hypertype).toBeInstanceOf(HyperType);
    expect(hypertype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("A");
    expect(data.nodes[1].id).toBe("A.B");
    expect(data.nodes[2].id).toBe("A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[0].source).toBe("A");
    expect(data.links[0].target).toBe("A.B");
    expect(data.links[0]._meta.hyperedgeID).toBe("A->B->C");

    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[1].source).toBe("A.B");
    expect(data.links[1].target).toBe("A.B.C");
    expect(data.links[1]._meta.hyperedgeID).toBe("A->B->C");
});

test("multiple hyperedge (confluence)", () => {
    const hypertype = new HyperType({
        hyperedges: [
            ["A", "B", "C"],
            ["A", "1", "2"],
        ],
        interwingle: HyperType.INTERWINGLE.CONFLUENCE
    });

    expect(hypertype).toBeInstanceOf(HyperType);
    expect(hypertype.symbols).toEqual(["A", "B", "C", "1", "2"]);

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);

    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("A->A.1");
    expect(data.links[3].id).toBe("A.1->A.1.2");

    expect(data.links[0]._meta.hyperedgeID).toBe("A->B->C");
    expect(data.links[1]._meta.hyperedgeID).toBe("A->B->C");
    expect(data.links[2]._meta.hyperedgeID).toBe("A->1->2");
    expect(data.links[3]._meta.hyperedgeID).toBe("A->1->2");
});

test("fusion start", () => {
    const hyperedges = [
        // A.B.C.D.E
        ["A", "B", "C"],
        ["C", "D", "E"]
    ];

    const hypertype = new HyperType({
        hyperedges,
        interwingle: HyperType.INTERWINGLE.FUSION
    });

    expect(hypertype.hyperedges.length).toEqual(2);

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(5); // C masquerades as A.B.C
    expect(data.links.length).toBe(4);

    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("A.B.C->C.D");
    expect(data.links[3].id).toBe("C.D->C.D.E");
});

test("fusion end", () => {
    const hyperedges = [
        // A.B.C && 1.2.C with C as fusion node
        ["A", "B", "C"],
        ["1", "2", "C"],
    ];

    const hypertype = new HyperType({
        hyperedges,
        interwingle: HyperType.INTERWINGLE.FUSION
    });

    expect(hypertype.hyperedges.length).toEqual(2);

    const data = hypertype.graphData();
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
        ["1", "vs", "2"],
    ];

    const hypertype = new HyperType({
        hyperedges,
        interwingle: HyperType.INTERWINGLE.BRIDGE
    });

    expect(hypertype.hyperedges.length).toEqual(2);

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(7);
    expect(data.links.length).toBe(6);

    expect(data.links[0].id).toBe("A->A.vs");
    expect(data.links[1].id).toBe("A.vs->A.vs.B");
    expect(data.links[2].id).toBe("1->1.vs");
    expect(data.links[3].id).toBe("1.vs->1.vs.2");
    expect(data.links[4].id).toBe("vs#bridge->A.vs");
    expect(data.links[5].id).toBe("vs#bridge->1.vs");
});

test("single node edge", () => {
    const hypertype = new HyperType({ interwingle: HyperType.INTERWINGLE.BRIDGE });
    hypertype.add("A");
    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(1);
});

test("fusion no bridge", () => {
    const hypertype = new HyperType({ interwingle: HyperType.INTERWINGLE.FUSION });
    hypertype.add("A", "B");
    hypertype.add("B", "C");
    hypertype.add("1", "B", "2");
    hypertype.add("3", "B", "4");

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(9);
    expect(data.links.length).toBe(6);
});

test("fusion bridge", () => {
    const hypertype = new HyperType({ interwingle: HyperType.INTERWINGLE.BRIDGE });
    hypertype.add("B", "C");
    hypertype.add("1", "B", "2");

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(6);
    expect(data.links.length).toBe(5);
});

// TODO:
// hypertype.add("A", "B");
// hypertype.add("1", "B", "2");

// TODO:
// hypertype.add("A", "B");
// hypertype.add("B", "C");
// hypertype.add("1", "B", "2");
// hypertype.add("3", "B", "4");

test.skip("huge", () => {
    const fs = require("fs");
    const hyperedges = fs
        .readFileSync("/Users/brad/Projects/loom/data/data", "utf-8")
        .split("\n")
        // .slice(0, 1800)
        .map((line) => {
            return line.split(" -> ");
        });

    // const hypertype = new HyperType(hyperedges);
    const start = Date.now();
    const hypertype = new HyperType({ hyperedges, interwingle: HyperType.INTERWINGLE.BRIDGE });
    const data = hypertype.graphData();
    const elapsed = Date.now() - start;
    console.log("elapsed", elapsed);

    // console.log(data);

    expect(elapsed).toBeLessThan(300);
});