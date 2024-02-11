import HyperType from "../src/index.js";

import { expect, test } from "vitest";

test("synced true on start", () => {
    const hypertype = new HyperType();
    expect(hypertype.synced).toBe(true);
});

test("synced false on start with data", () => {
    const hypertype = new HyperType({
        hyperedges: [["A", "B"]],
    });
    expect(hypertype.synced).toBe(false);
});

test("syncs", async () => {
    const hypertype = new HyperType({
        hyperedges: [["A", "B"]],
    });
    expect(hypertype.synced).toBe(false);
    await hypertype.sync();
    expect(hypertype.synced).toBe(true);
});

test("unsyncs with add data", async () => {
    const hypertype = new HyperType();
    expect(hypertype.synced).toBe(true);

    hypertype.add("A", "B");
    expect(hypertype.synced).toBe(false);

    await hypertype.sync();
    expect(hypertype.synced).toBe(true);
});

test("unsyncs with add data on edge", async () => {
    const hypertype = new HyperType();
    expect(hypertype.synced).toBe(true);

    const edge = hypertype.add("A", "B");
    expect(hypertype.synced).toBe(false);

    await hypertype.sync();
    expect(hypertype.synced).toBe(true);

    edge.add("C", "D");
    expect(hypertype.synced).toBe(false);

    await hypertype.sync();
    expect(hypertype.synced).toBe(true);
});