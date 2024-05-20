import ThinkableType from "../src/index.js";

import { expect, test } from "vitest";

test("single node edge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add("A");
    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(1);
});



test("two-edge end bridge incoming", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add("1", "B", "2");
    thinkabletype.add("A", "B");

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(4);
    expect(data.links.length).toBe(3);
});

test("two-edge end bridge reverse order", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add("A", "B");
    thinkabletype.add("1", "B", "2");

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(4);
    expect(data.links.length).toBe(3);
});


test("two-edge fusion skip bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add("A", "B");
    thinkabletype.add("B", "C");

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.links.length).toBe(2);
});


test("two-edge confluence skip fusion and bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add("A", "B");
    thinkabletype.add("B", "C");
    thinkabletype.add("B", "1", "2");

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);
});

test("two-edge fusion bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add("A", "B");
    thinkabletype.add("B", "C");
    thinkabletype.add("1", "B", "2");
    thinkabletype.add("3", "B", "4");

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(10);
    expect(data.links.length).toBe(12);
});


/// FILTER

test("filter on isolated", () => {
    const thinkabletype = new ThinkableType({
        interwingling: ThinkableType.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});

test("filter on multiple edges isolated", () => {
    const thinkabletype = new ThinkableType({
        interwingling: ThinkableType.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const graphData = thinkabletype.graphData([["A"], ["1"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(4);
});

test("filter on multiple overlapping edges isolated", () => {
    const thinkabletype = new ThinkableType({
        interwingling: ThinkableType.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });
    const graphData = thinkabletype.graphData([["C"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(4);
});

test("filter edge fusion", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        interwingle: ThinkableType.INTERWINGLE.FUSION,
        hyperedges: [
            ["A", "B", "C"],
            ["C", "D", "E"],
        ]
    });

    const graphData = thinkabletype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(5); // fusion grabs connected C->D->E node
    expect(graphData.links.length).toBe(4);
});

test("filter edge confluence", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "B", "1"],
        ]
    });

    const graphData = thinkabletype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(4); // confluence grabs connected A->B->1 edge
    expect(graphData.links.length).toBe(3);
});


test("filter edge bridge", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        interwingle: ThinkableType.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["1", "vs", "2"],
            ["A", "vs", "B"],
        ]
    });

    const graphData = thinkabletype.graphData([["1"]]);
    expect(graphData.nodes.length).toBe(7); // bridge graphs connected A vs B edge
    expect(graphData.links.length).toBe(6);
});

test("filter edge confluence shallow", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.SHALLOW,
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "2", "1"],
        ]
    });

    const graphData = thinkabletype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});

test("filter edge confluence deep", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "2", "1"],
        ]
    });

    const graphData = thinkabletype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(5); // confluence grabs connected A->B->1 edge
    expect(graphData.links.length).toBe(4);
});

test("filter interwingle progression", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        hyperedges: [
            ["A", "B", "2", "C"],
            ["C", "B", "1"],
            ["A", "Y", "Z"],
        ]
    });

    let graphData;

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.ISOLATED;
    graphData = thinkabletype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.CONFLUENCE;
    graphData = thinkabletype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(5);

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.FUSION;
    graphData = thinkabletype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(8);
    expect(graphData.links.length).toBe(7);

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.BRIDGE;
    graphData = thinkabletype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(9);
});


test("fusion meta hyperedge ids regression", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.FUSION,
        depth: ThinkableType.DEPTH.DEEP
    });
    thinkabletype.add("A", "B", "C");
    thinkabletype.add("C", "D", "E");
    thinkabletype.add("1", "2", "C");

    const graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);
});

test("find no edges", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.SHALLOW,
        interwingle: ThinkableType.INTERWINGLE.FUSION,
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

    graphData = thinkabletype.graphData([["A", "C"]]);
    expect(graphData.nodes.length).toBe(0);
    expect(graphData.links.length).toBe(0);
});

test("custom colors", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["L", "M", "N"],
            ["X", "Y", "Z"],
        ],
        colors: ["#000000"],
    });

    const data = thinkabletype.graphData();
    for (const node of data.nodes) {
        expect(node.color).toBe("#000000");
    }
});

test.skip("huge", async () => {
    const fs = require("fs");
    const hyperedges = fs
        .readFileSync("/Users/brad/Projects/loom/data/data.thinkabletype", "utf-8")
        .split("\n")
        // .slice(0, 1800)
        .map((line) => {
            return line.split(" -> ");
        });

    const start = Date.now();
    const thinkabletype = new ThinkableType({ hyperedges, interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    // await thinkabletype.sync();
    const data = thinkabletype.graphData();
    const elapsed = Date.now() - start;
    console.log("elapsed", elapsed);

    // console.log(data);
});