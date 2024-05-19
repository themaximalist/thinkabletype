import ThinkableType from "../src/index.js";

import { expect, test } from "vitest";

test("pagerank", async function () {
    const thinkabletype = ThinkableType.parse(`A,B,C
A,B,D
A,B,E
A,C,Z`);

    expect(thinkabletype).toBeInstanceOf(ThinkableType);
    expect(thinkabletype.synced).toBe(false);

    expect(await thinkabletype.sync()).toBe(true);
    expect(thinkabletype.synced).toBe(true);

    expect(Object.keys(thinkabletype.pageranks).length).toBe(6);

    expect(thinkabletype.pageranks["A"]).toBeGreaterThan(0);
    expect(thinkabletype.pageranks["B"]).toBeGreaterThan(0);
    expect(thinkabletype.pageranks["C"]).toBeGreaterThan(0);
    expect(thinkabletype.pagerank("D")["C"]).toBe(0);
    expect(thinkabletype.pagerank("Z")["C"]).toBeGreaterThan(0);
    expect(thinkabletype.pagerank("Z")["B"]).toBe(0);
});