import HyperType from "../src/index.js";
import Hyperedge from "../src/Hyperedge.js";

import { expect, test } from "vitest";

test("simple symbol embeddings search", async () => {
    const hypertype = HyperType.parse("Red,Green,Blue\nWhite,Black,Gray");
    await hypertype.sync();

    const similar = await hypertype.similarSymbols("Redish");
    expect(similar.length).toBe(1);
    expect(similar[0].symbol).toBe("Red");
    expect(similar[0].distance).toBeGreaterThan(0);
});

test("simple edge embeddings search", async () => {
    const hypertype = HyperType.parse("Red,Green,Blue\nWhite,Black,Gray");
    expect(hypertype.synced).toBe(false);
    await hypertype.sync();
    expect(hypertype.synced).toBe(true);

    const similar = await hypertype.similar("Redish");
    expect(similar.length).toBe(1);
    const edge = similar[0];
    expect(edge).toBeInstanceOf(Hyperedge);
    expect(edge.symbols).toEqual(["Red", "Green", "Blue"]);
    expect(edge.distance).toBeGreaterThan(0);
});

test("skips dupes", async () => {
    const hypertype = new HyperType();
    hypertype.add("Red");
    hypertype.add("Red");
    await hypertype.sync();

    const similar = await hypertype.similarSymbols("Redish");

    expect(similar.length).toBe(1);
    expect(similar[0].symbol).toBe("Red");
    expect(similar[0].distance).toBeGreaterThan(0);
});

test("edge similar", async () => {
    const hypertype = new HyperType();
    const edge1 = hypertype.add("Red", "Green", "Blue");
    const edge2 = hypertype.add("Red", "White", "Blue");
    const edge3 = hypertype.add("Bob", "Sally", "Bill");

    await hypertype.sync();

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