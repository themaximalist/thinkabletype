import ThinkableType from "../src/index.js";
import Hyperedge from "../src/Hyperedge.js";

import { expect, test } from "vitest";

test("simple symbol embeddings search", async () => {
    const thinkabletype = ThinkableType.parse("Red,Green,Blue\nWhite,Black,Gray");
    await thinkabletype.sync();

    const similar = await thinkabletype.similarSymbols("Redish");
    expect(similar.length).toBe(1);
    expect(similar[0].symbol).toBe("Red");
    expect(similar[0].distance).toBeGreaterThan(0);
});

test("simple edge embeddings search", async () => {
    const thinkabletype = ThinkableType.parse("Red,Green,Blue\nWhite,Black,Gray");
    expect(thinkabletype.synced).toBe(false);
    await thinkabletype.sync();
    expect(thinkabletype.synced).toBe(true);

    const similar = await thinkabletype.similar("Redish");
    expect(similar.length).toBe(1);
    const edge = similar[0];
    expect(edge).toBeInstanceOf(Hyperedge);
    expect(edge.symbols).toEqual(["Red", "Green", "Blue"]);
    expect(edge.distance).toBeGreaterThan(0);
});

test("skips dupes", async () => {
    const thinkabletype = new ThinkableType();
    thinkabletype.add("Red");
    thinkabletype.add("Red");
    await thinkabletype.sync();

    const similar = await thinkabletype.similarSymbols("Redish");

    expect(similar.length).toBe(1);
    expect(similar[0].symbol).toBe("Red");
    expect(similar[0].distance).toBeGreaterThan(0);
});

test("edge similar", async () => {
    const thinkabletype = new ThinkableType();
    const edge1 = thinkabletype.add("Red", "Green", "Blue");
    const edge2 = thinkabletype.add("Red", "White", "Blue");
    const edge3 = thinkabletype.add("Bob", "Sally", "Bill");

    await thinkabletype.sync();

    const similar1 = await edge1.similar();
    expect(similar1.length).toBe(1);
    expect(similar1[0].equal(edge2)).toBe(true);
    expect(similar1[0].distance).toBeGreaterThan(0);

    const similar2 = await edge2.similar();
    expect(similar2.length).toBe(1);
    expect(similar2[0].equal(edge1)).toBe(true);
    expect(similar2[0].distance).toBeGreaterThan(0);

    const similar3 = await edge3.similar();
    expect(similar3.length).toBe(0);
});