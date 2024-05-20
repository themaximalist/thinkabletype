import ThinkableType from "../src/index.js";

import { expect, test } from "vitest";

test("graph data (interwingle)", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("0:A");
    expect(data.nodes[1].id).toBe("0:A.B");
    expect(data.nodes[2].id).toBe("0:A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("0:A->0:A.B");
    expect(data.links[1].id).toBe("0:A.B->0:A.B.C");
});

test("graph data (confluence)", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], { interwingle: ThinkableType.INTERWINGLE.CONFLUENCE });

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("A");
    expect(data.nodes[1].id).toBe("A.B");
    expect(data.nodes[2].id).toBe("A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
});

test("single hyperedge (isolate)", () => {
    const thinkabletype = new ThinkableType([["A", "B", "C"]]);
    expect(thinkabletype).toBeInstanceOf(ThinkableType);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("0:A");
    expect(data.nodes[1].id).toBe("0:A.B");
    expect(data.nodes[2].id).toBe("0:A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("0:A->0:A.B");
    expect(data.links[0].source).toBe("0:A");
    expect(data.links[0].target).toBe("0:A.B");
    expect(data.links[0].ids).toContain("0:A.B.C");

    expect(data.links[1].id).toBe("0:A.B->0:A.B.C");
    expect(data.links[1].source).toBe("0:A.B");
    expect(data.links[1].target).toBe("0:A.B.C");
    expect(data.links[1].ids).toContain("0:A.B.C");
});

test("single hyperedge (confluence)", () => {
    const thinkabletype = new ThinkableType([["A", "B", "C"]], { interwingle: ThinkableType.INTERWINGLE.CONFLUENCE });
    expect(thinkabletype).toBeInstanceOf(ThinkableType);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("A");
    expect(data.nodes[1].id).toBe("A.B");
    expect(data.nodes[2].id).toBe("A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[0].source).toBe("A");
    expect(data.links[0].target).toBe("A.B");
    expect(data.links[0].ids).toContain("A.B.C");

    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[1].source).toBe("A.B");
    expect(data.links[1].target).toBe("A.B.C");
    expect(data.links[1].ids).toContain("A.B.C");
});

test("multiple hyperedge (confluence)", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
        ["A", "1", "2"],
    ], {
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE
    });

    expect(thinkabletype).toBeInstanceOf(ThinkableType);
    expect(thinkabletype.symbols).toEqual(["A", "B", "C", "1", "2"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);

    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("A->A.1");
    expect(data.links[3].id).toBe("A.1->A.1.2");

    expect(data.links[0].ids).toContain("A.B.C");
    expect(data.links[1].ids).toContain("A.B.C");
    expect(data.links[2].ids).toContain("A.1.2");
    expect(data.links[3].ids).toContain("A.1.2");
});

test("fusion start", () => {
    const hyperedges = [
        // A.B.C.D.E
        ["A", "B", "C"],
        ["C", "D", "E"]
    ];

    const thinkabletype = new ThinkableType(hyperedges, {
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    expect(thinkabletype.hyperedges.length).toEqual(2);

    const data = thinkabletype.graphData();
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

    const thinkabletype = new ThinkableType(hyperedges, {
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    expect(thinkabletype.hyperedges.length).toEqual(2);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5); // C masquerades as A.B.C
    expect(data.links.length).toBe(4);

    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("1->1.2");
    expect(data.links[3].id).toBe("1.2->A.B.C");
});


test("fusion no bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
    thinkabletype.add(["A", "B"]);
    thinkabletype.add(["B", "C"]);
    thinkabletype.add(["1", "B", "2"]);
    thinkabletype.add(["3", "B", "4"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(9);
    expect(data.links.length).toBe(10);
});

test.skip("two-edge start bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
    thinkabletype.add(["1", "B", "2"]);
    thinkabletype.add(["B", "C"]);

    const data = thinkabletype.graphData();
    console.log(data);
    expect(data.nodes.length).toBe(4);
    // expect(data.links.length).toBe(3);
});

/*
test("two-edge start fusion incoming", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
    thinkabletype.add("1", "B", "2");
    thinkabletype.add("A", "B");

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(4);
    expect(data.links.length).toBe(3);
});

*/