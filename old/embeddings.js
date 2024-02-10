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