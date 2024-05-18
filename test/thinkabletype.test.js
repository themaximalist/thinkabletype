import ThinkableType from "../src/index.js";

import { expect, test } from "vitest";

test("synced true on start", () => {
    const thinkabletype = new ThinkableType();
    expect(thinkabletype.synced).toBe(true);
});

test("synced false on start with data", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [["A", "B"]],
    });
    expect(thinkabletype.synced).toBe(false);
});

test("syncs", async () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [["A", "B"]],
    });
    expect(thinkabletype.synced).toBe(false);
    await thinkabletype.sync();
    expect(thinkabletype.synced).toBe(true);
});

test("unsyncs with add data", async () => {
    const thinkabletype = new ThinkableType();
    expect(thinkabletype.synced).toBe(true);

    thinkabletype.add("A", "B");
    expect(thinkabletype.synced).toBe(false);

    await thinkabletype.sync();
    expect(thinkabletype.synced).toBe(true);
});

test("unsyncs with add data on edge", async () => {
    const thinkabletype = new ThinkableType();
    expect(thinkabletype.synced).toBe(true);

    const edge = thinkabletype.add("A", "B");
    expect(thinkabletype.synced).toBe(false);

    await thinkabletype.sync();
    expect(thinkabletype.synced).toBe(true);

    edge.add("C", "D");
    expect(thinkabletype.synced).toBe(false);

    await thinkabletype.sync();
    expect(thinkabletype.synced).toBe(true);
});

test("renames", async () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B"],
            ["1", "2"],
        ],
    });

    expect(thinkabletype.has("A")).toBeTruthy();
    expect(thinkabletype.has("A1")).toBeFalsy();
    thinkabletype.rename("A", "A1");
    expect(thinkabletype.has("A")).toBeFalsy();
    expect(thinkabletype.has("A1")).toBeTruthy();
});

test("renames hyperedge", async () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "D"],
            ["A", "B", "C"],
            ["1", "2"],
        ],
    });

    const edge = thinkabletype.get("A", "B", "D");
    edge.rename("A", "A1");

    expect(thinkabletype.has("A", "B", "D")).toBeFalsy();
    expect(thinkabletype.has("A1", "B", "D")).toBeTruthy();
    expect(thinkabletype.has("A", "B", "C")).toBeTruthy();
});

test("renames all", async () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "D"],
            ["A", "B", "C"],
            ["1", "2"],
        ],
    });

    thinkabletype.rename("A", "A1");

    expect(thinkabletype.has("A", "B", "D")).toBeFalsy();
    expect(thinkabletype.has("A", "B", "C")).toBeFalsy();
    expect(thinkabletype.has("A1", "B", "D")).toBeTruthy();
    expect(thinkabletype.has("A1", "B", "C")).toBeTruthy();
});
