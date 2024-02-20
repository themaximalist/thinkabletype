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
    expect(data.links[0]._meta.hyperedgeIDs).toContain("0:A->B->C");

    expect(data.links[1].id).toBe("0:A.B->0:A.B.C");
    expect(data.links[1].source).toBe("0:A.B");
    expect(data.links[1].target).toBe("0:A.B.C");
    expect(data.links[1]._meta.hyperedgeIDs).toContain("0:A->B->C");
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
    expect(data.links[0]._meta.hyperedgeIDs).toContain("A->B->C");

    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[1].source).toBe("A.B");
    expect(data.links[1].target).toBe("A.B.C");
    expect(data.links[1]._meta.hyperedgeIDs).toContain("A->B->C");
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

    expect(data.links[0]._meta.hyperedgeIDs).toContain("A->B->C");
    expect(data.links[1]._meta.hyperedgeIDs).toContain("A->B->C");
    expect(data.links[2]._meta.hyperedgeIDs).toContain("A->1->2");
    expect(data.links[3]._meta.hyperedgeIDs).toContain("A->1->2");
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

test("two-edge start bridge", () => {
    const hypertype = new HyperType({ interwingle: HyperType.INTERWINGLE.BRIDGE });
    hypertype.add("B", "C");
    hypertype.add("1", "B", "2");

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(6);
    expect(data.links.length).toBe(5);
});

test("two-edge end bridge", () => {
    const hypertype = new HyperType({ interwingle: HyperType.INTERWINGLE.BRIDGE });
    hypertype.add("A", "B");
    hypertype.add("1", "B", "2");

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(6);
    expect(data.links.length).toBe(5);
});

test("continuous fusion", () => {
    const hypertype = new HyperType({ interwingle: HyperType.INTERWINGLE.BRIDGE });
    hypertype.add("A", "B");
    hypertype.add("B", "C");
    hypertype.add("C", "D");
    hypertype.add("D", "E");

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);
});

test("two-edge fusion skip bridge", () => {
    const hypertype = new HyperType({ interwingle: HyperType.INTERWINGLE.BRIDGE });
    hypertype.add("A", "B");
    hypertype.add("B", "C");

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.links.length).toBe(2);
});

test("two-edge confluence skip fusion and bridge", () => {
    const hypertype = new HyperType({ interwingle: HyperType.INTERWINGLE.BRIDGE });
    hypertype.add("A", "B");
    hypertype.add("B", "C");
    hypertype.add("B", "1", "2");

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);
});

test("two-edge fusion bridge", () => {
    const hypertype = new HyperType({ interwingle: HyperType.INTERWINGLE.BRIDGE });
    hypertype.add("A", "B");
    hypertype.add("B", "C");
    hypertype.add("1", "B", "2");
    hypertype.add("3", "B", "4");

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(10);
    expect(data.links.length).toBe(9);
});

test("closed fusion loop", () => {
    const hypertype = new HyperType({ interwingle: HyperType.INTERWINGLE.FUSION });
    hypertype.add("A", "B", "C", "A");

    const data = hypertype.graphData();

    expect(data.nodes.length).toBe(3);
    expect(data.links.length).toBe(3);
});

test("filter on isolated", () => {
    const hypertype = new HyperType({
        interwingling: HyperType.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const graphData = hypertype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});

test("filter on multiple edges isolated", () => {
    const hypertype = new HyperType({
        interwingling: HyperType.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const graphData = hypertype.graphData([["A"], ["1"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(4);
});

test("filter on multiple overlapping edges isolated", () => {
    const hypertype = new HyperType({
        interwingling: HyperType.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const graphData = hypertype.graphData([["C"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(4);
});

test("filter edge fusion", () => {
    const hypertype = new HyperType({
        depth: HyperType.DEPTH.DEEP,
        interwingle: HyperType.INTERWINGLE.FUSION,
        hyperedges: [
            ["A", "B", "C"],
            ["C", "D", "E"],
        ]
    });

    const graphData = hypertype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(5); // fusion grabs connected C->D->E node
    expect(graphData.links.length).toBe(4);
});

test("filter edge confluence", () => {
    const hypertype = new HyperType({
        depth: HyperType.DEPTH.DEEP,
        interwingle: HyperType.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "B", "1"],
        ]
    });

    const graphData = hypertype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(4); // confluence grabs connected A->B->1 edge
    expect(graphData.links.length).toBe(3);
});


test("filter edge bridge", () => {
    const hypertype = new HyperType({
        depth: HyperType.DEPTH.DEEP,
        interwingle: HyperType.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["1", "vs", "2"],
            ["A", "vs", "B"],
        ]
    });

    const graphData = hypertype.graphData([["1"]]);
    expect(graphData.nodes.length).toBe(7); // bridge graphs connected A vs B edge
    expect(graphData.links.length).toBe(6);
});

test("filter edge confluence shallow", () => {
    const hypertype = new HyperType({
        depth: HyperType.DEPTH.SHALLOW,
        interwingle: HyperType.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "2", "1"],
        ]
    });

    const graphData = hypertype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});

test("filter edge confluence deep", () => {
    const hypertype = new HyperType({
        depth: HyperType.DEPTH.DEEP,
        interwingle: HyperType.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "2", "1"],
        ]
    });

    const graphData = hypertype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(5); // confluence grabs connected A->B->1 edge
    expect(graphData.links.length).toBe(4);
});

test("filter interwingle progression", () => {
    const hypertype = new HyperType({
        depth: HyperType.DEPTH.DEEP,
        hyperedges: [
            ["A", "B", "2", "C"],
            ["C", "B", "1"],
            ["A", "Y", "Z"],
        ]
    });

    let graphData;

    hypertype.interwingle = HyperType.INTERWINGLE.ISOLATED;
    graphData = hypertype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);

    hypertype.interwingle = HyperType.INTERWINGLE.CONFLUENCE;
    graphData = hypertype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(5);

    hypertype.interwingle = HyperType.INTERWINGLE.FUSION;
    graphData = hypertype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(8);
    expect(graphData.links.length).toBe(7);

    hypertype.interwingle = HyperType.INTERWINGLE.BRIDGE;
    graphData = hypertype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(9);
});

test("filter fusion depth", () => {
    const hypertype = new HyperType({
        interwingle: HyperType.INTERWINGLE.FUSION,
        hyperedges: [
            ["A", "B", "C"],
            ["C", "D", "E"],
            ["E", "F", "G"],
            ["G", "H", "I"],
            ["I", "J", "K"],
            ["K", "L", "M"],
            ["M", "N", "O"],
            ["O", "P", "Q"],
        ]
    });

    let graphData;

    hypertype.depth = HyperType.DEPTH.SHALLOW;
    graphData = hypertype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);

    hypertype.depth = 1;
    graphData = hypertype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);

    hypertype.depth = 2;
    graphData = hypertype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);

    hypertype.depth = 3;
    graphData = hypertype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);

    hypertype.depth = 4;
    graphData = hypertype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(11);
    expect(graphData.links.length).toBe(10);

    hypertype.depth = 5;
    graphData = hypertype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(13);
    expect(graphData.links.length).toBe(12);

    hypertype.depth = 6;
    graphData = hypertype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(15);
    expect(graphData.links.length).toBe(14);

    hypertype.depth = 7;
    graphData = hypertype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(17);
    expect(graphData.links.length).toBe(16);

    hypertype.depth = HyperType.DEPTH.DEEP;
    graphData = hypertype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(17);
    expect(graphData.links.length).toBe(16);
});

test("filter bridge depth", () => {
    const hypertype = new HyperType({
        interwingle: HyperType.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["A", "vs", "B"],
            ["C", "vs", "D"],
            ["E", "vs", "G"],
        ]
    });

    let graphData;

    hypertype.depth = HyperType.DEPTH.SHALLOW;
    graphData = hypertype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);

    hypertype.depth = HyperType.DEPTH.DEEP;
    graphData = hypertype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(10);
    expect(graphData.links.length).toBe(9)
});


test.skip("huge", async () => {
    const fs = require("fs");
    const hyperedges = fs
        .readFileSync("/Users/brad/Projects/loom/data/data.hypertype", "utf-8")
        .split("\n")
        // .slice(0, 1800)
        .map((line) => {
            return line.split(" -> ");
        });

    const start = Date.now();
    const hypertype = new HyperType({ hyperedges, interwingle: HyperType.INTERWINGLE.BRIDGE });
    // await hypertype.sync();
    const data = hypertype.graphData();
    const elapsed = Date.now() - start;
    console.log("elapsed", elapsed);

    // console.log(data);
});


// TODO: filter + depth on a specific node