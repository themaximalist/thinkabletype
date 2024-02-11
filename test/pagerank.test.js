import HyperType from "../src/index.js";

import { expect, test } from "vitest";

test("pagerank", async function () {
    const hypertype = HyperType.parse(`A,B,C
A,B,D
A,B,E
A,C,Z`);

    expect(hypertype).toBeInstanceOf(HyperType);
    expect(hypertype.synced).toBe(false);

    expect(await hypertype.sync()).toBe(true);
    expect(hypertype.synced).toBe(true);

    expect(Object.keys(hypertype.pageranks).length).toBe(6);

    expect(hypertype.pageranks["A"]).toBeGreaterThan(0);
    expect(hypertype.pageranks["B"]).toBeGreaterThan(0);
    expect(hypertype.pageranks["C"]).toBeGreaterThan(0);
    expect(hypertype.pagerank("D")["C"]).toBe(0);
    expect(hypertype.pagerank("Z")["C"]).toBeGreaterThan(0);
    expect(hypertype.pagerank("Z")["B"]).toBe(0);
});