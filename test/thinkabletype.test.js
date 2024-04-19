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