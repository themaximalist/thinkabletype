import ThinkableType from "../src/index.js";

import { expect, test } from "vitest";

test("initialize with hyperedge", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    expect(thinkabletype.hyperedges.length).toBe(1);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(thinkabletype.hyperedges[0].nodes.length).toBe(3);
});


test("initialize with hyperedges", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
        ["1", "2", "3"],
    ]);

    expect(thinkabletype.hyperedges.length).toBe(2);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(thinkabletype.hyperedges[0].nodes.length).toBe(3);
    expect(thinkabletype.hyperedges[1].symbols).toEqual(["1", "2", "3"]);
    expect(thinkabletype.hyperedges[1].nodes.length).toBe(3);
});

test("add to hyperdge", () => {
    const thinkabletype = new ThinkableType();
    thinkabletype.add(["A", "B", "C"]);
    expect(thinkabletype.hyperedges.length).toBe(1);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(thinkabletype.hyperedges[0].nodes.length).toBe(3);
});

test("node uuid", () => {
    const thinkabletype = new ThinkableType();
    thinkabletype.add(["A", "B", "C"]);
    const edge = thinkabletype.hyperedges[0];
    const node = edge.nodes[0];
    expect(node.id).toBe("A");
    expect(node.uuid).toMatch(/^[0-9a-f-]{36}$/);
});
