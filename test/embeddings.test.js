
import HyperType from "../src/index.js";

import { expect, test } from "vitest";

test.skip("simple embeddings search", async () => {
    const hypertype = HyperType.parse("Red,Green,Blue\nWhite,Black,Gray");
    await hypertype.sync();

    console.log(hypertype.embeddings);

    // const similar = await hypertype.similar("Redish");
    // console.log(similar);

    // console.log(hypertype);

    /*
    expect(hypertype).toBeInstanceOf(HyperType);
    expect(hypertype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);

    const data = hypertype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("0:A");
    expect(data.nodes[1].id).toBe("0:A.B");
    expect(data.nodes[2].id).toBe("0:A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("0:A->0:A.B");
    expect(data.links[0].source).toBe("0:A");
    expect(data.links[0].target).toBe("0:A.B");
    expect(data.links[0]._meta.hyperedgeID).toBe("0:A->B->C");

    expect(data.links[1].id).toBe("0:A.B->0:A.B.C");
    expect(data.links[1].source).toBe("0:A.B");
    expect(data.links[1].target).toBe("0:A.B.C");
    expect(data.links[1]._meta.hyperedgeID).toBe("0:A->B->C");
    */
});
/*
import Hypergraph from "../src/hypergraph.js";

import assert from "assert";


describe.skip("Hypergraph embeddings", function () {
    it("skips dupes on vectordb", async function () {
        const graph = new Hypergraph();
        graph.add("Red");
        graph.add("Red");

        assert(graph);
        assert(graph.nodes.length == 1);

        const nodes = await graph.similar("Redish");
        assert(nodes.length == 1);
    });

    it("finds similar nodes in embedding space", async function () {
        this.timeout(2000);
        this.slow(1000);

        const graph = await Hypergraph.parse(`Red,Green,Blue,Pink`);
        assert(graph);
        assert(graph.nodes.length == 4);
        assert(graph.hyperedges.length == 1);
        assert(graph.has("Red"));

        const nodes = await graph.similar("Redish");
        assert(nodes.length == 1);
        assert(nodes[0].node.symbol == "Red");
        assert(nodes[0].distance > 0);
        assert(nodes[0].distance < 0.5);
    });

    it("finds similar nodes in embedding space", async function () {
        this.timeout(2000);
        this.slow(1000);

        const graph = await Hypergraph.parse(`Red,Green,Blue,Pink`);
        assert(graph);
        assert(graph.nodes.length == 4);
        assert(graph.hyperedges.length == 1);
        assert(graph.has("Red"));

        const nodes = await graph.similar("Redish");
        assert(nodes.length == 1);
        assert(nodes[0].node.symbol == "Red");
        assert(nodes[0].distance > 0);
        assert(nodes[0].distance < 0.5);
    });

    it("node similar shorthand", async function () {
        this.timeout(2000);
        this.slow(1000);

        const graph = await Hypergraph.parse(`Red,Green,Blue,Pink`);
        const pink = graph.get("Pink");

        const nodes = await pink.similar();
        assert(nodes[0].node.symbol == "Red");
        assert(nodes[0].distance > 0);
        assert(nodes[0].distance < 1);
    });

    it("hyperedge similar", async function () {
        this.timeout(2000);
        this.slow(1000);

        const graph = new Hypergraph();
        const edge1 = await graph.add(["Red", "Green", "Blue"]);
        const edge2 = await graph.add(["Red", "White", "Blue"]);
        await graph.add(["Bob", "Bill", "Sally"]);

        const nodes = await edge1.similar();
        assert(nodes.length == 1);
        assert(nodes.length == 1);
        assert(nodes[0].hyperedge.equal(edge2));
        assert(nodes[0].distance > 0);
        assert(nodes[0].distance < 0.5);
    });
});
*/