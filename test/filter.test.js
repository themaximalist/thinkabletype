import ThinkableType from "../src/index.js";

import { expect, test } from "vitest";

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
    thinkabletype.add(["A", "B", "C"]);
    thinkabletype.add(["C", "D", "E"]);
    thinkabletype.add(["1", "2", "C"]);

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
