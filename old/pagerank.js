/*

import Hypergraph from "../src/hypergraph.js";

import assert from "assert";

describe("Hypergraph pagerank", function () {
    it("pagerank", async function () {
        const graph = await Hypergraph.parse(`A,B,C
A,B,D
A,B,E
A,C,Z`);
        assert(graph);
        assert(graph.needsSyncPagerank);

        graph.syncPagerank();
        assert(!graph.needsSyncPagerank);
        assert(graph.pageranks);

        assert(graph.pageranks["A"] > 0);
        assert(graph.pageranks["B"] > 0);
        assert(graph.pageranks["C"] > 0);
        assert(graph.pagerank("Z")["C"] > 0);
    });
});
*/