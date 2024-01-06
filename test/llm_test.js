// llm.js
// implicit hyperedges (computational AI graph) ..new connections

import Hypergraph from "../src/hypergraph.js";
import Hyperedge from "../src/hyperedge.js";
import Node from "../src/node.js";

import assert from "assert";

describe("Hypergraph LLM", function () {
    this.timeout(10000);
    this.slow(5000);
    it("suggest connection", async function () {
        const graph = new Hypergraph();
        assert(graph);
        assert(graph.nodes.length == 0);

        const A = await graph.create("A");
        assert(A);
        assert(A.symbol === "A");

        const B = await A.suggest();
        assert(B);
        assert(B.symbol === "B");

        assert(!graph.has(B));
        const edge = await graph.add([A, B]);
        assert(edge.has(B));
        assert(graph.has(B));
    });

    it("suggest connection alt1", async function () {
        const graph = new Hypergraph();
        const ted = await graph.add("Ted Nelson");
        assert(ted);

        const tim = await ted.suggest();
        assert(tim);
        assert(tim.symbol === "Tim Berners-Lee");
    });

    // TODO: hyperedge.suggest();
    // TODO: graph.suggest([node, hyperedge, etc...])
});