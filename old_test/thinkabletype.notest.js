import ThinkableType from "../src/index.js";

import { expect, test } from "vitest";
/*

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
*/

test("renames nodes by hyperedge ids (isolated)", async () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B"],
            ["A", "B", "C"],
            ["1", "2"],
        ],
    });

    let id;
    expect(thinkabletype.has("A")).toBeTruthy();
    id = thinkabletype.rename("0:A", "A1");
    expect(id).toBe("0:A1")

    expect(thinkabletype.has("A1")).toBeTruthy();

    expect(thinkabletype.has("B")).toBeTruthy();
    id = thinkabletype.rename("0:A1.B", "B1");
    expect(id).toBe("0:A1.B1")
    expect(thinkabletype.has("B1")).toBeTruthy();

    expect(thinkabletype.has("C")).toBeTruthy();
    id = thinkabletype.rename("1:A.B.C", "C1");
    expect(id).toBe("1:A.B.C1")
    expect(thinkabletype.has("C1")).toBeTruthy();
});

test("renames nodes by hyperedge ids (confluence)", async () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B"],
            ["A", "B", "C"],
            ["1", "2"],
        ],
    });

    let id;
    // rename a single edge
    const edge = thinkabletype.get("A", "B");
    id = edge.rename("A", "A1");
    expect(id).toBe("A1")
    expect(thinkabletype.has("A")).toBeTruthy();
    expect(thinkabletype.has("A1")).toBeTruthy();

    // sync
    id = thinkabletype.rename("A", "A1");
    expect(id).toBe("A1")

    // rename all
    id = thinkabletype.rename("A1.B", "B1");
    expect(id).toBe("A1.B1")
    expect(thinkabletype.has("B1")).toBeTruthy();
    expect(thinkabletype.has("B")).toBeFalsy();
});