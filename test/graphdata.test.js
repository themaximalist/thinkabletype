import HyperType from "../src/index.js";

import { expect, test } from "vitest";
import fs from "fs";

// TODO: fusion A -> B && B -> A (identical nodes)


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

/*
test("bridge", () => {
    const hyperedges = [
        ["A", "vs", "B"],
        ["1", "vs", "2"]
    ];

    const hypertype = new HyperType([], { interwingle: HyperType.INTERWINGLE.BRIDGE });
    hypertype.addHyperedges(hyperedges);

    expect(hypertype.hyperedges.length).toEqual(2);

    const data = hypertype.graphData();
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

    const hypertype = new HyperType([], { interwingle: HyperType.INTERWINGLE.BRIDGE });
    hypertype.addHyperedges(hyperedges);

    expect(hypertype.hyperedges.length).toEqual(2);

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(6); // 5 nodes + 1 bridge node
    expect(data.links.length).toBe(6);
});

*/