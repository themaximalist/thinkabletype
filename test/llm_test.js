import debug from "debug";
const log = debug("hypertype:test:llm");

// llm.js
// implicit hyperedges (computational AI graph) ..new connections

import Hypergraph from "../src/hypergraph.js";
import Hyperedge from "../src/hyperedge.js";
import Node from "../src/node.js";

import assert from "assert";

describe("Hypergraph LLM", function () {
    this.timeout(10000);
    this.slow(5000);

    it("node suggest", async function () {
        this.timeout(30000);
        this.slow(15000);

        const data = {
            "Steve Jobs": ["Apple Inc.", "NeXT", "Pixar", "Macintosh", "iPhone"],
            "Ted Nelson": ["hypertext", "World Wide Web", "HTML", "Tim Berners-Lee", "Robert Cailliau", "Vannevar Bush", "As We May Think", "Memex", "DARPA", "Information Age", "cyberspace"]
        };

        for (const symbol in data) {
            const graph = new Hypergraph();

            log(`finding similar for ${symbol}`);
            const node = await graph.add(symbol);
            const nodes = await node.suggest();

            let expected = data[symbol];
            assert(expected.length > 0);
            for (const node of nodes) {
                expected = expected.filter(symbol => symbol.indexOf(node.symbol) !== -1);
            }
            assert(expected.length === 0, expected);
        }
    });

    it("hyperedge suggest", async function () {
        this.timeout(30000);
        this.slow(15000);

        const graph = new Hypergraph();
        const hyperedge = await graph.add(["Ted Nelson", "inventor"]);
        const nodes = await hyperedge.suggest();

        const symbols = nodes.map(node => node.symbol.toLowerCase());
        assert(!symbols.includes("ted nelson"));
        assert(!symbols.includes("inventor"));
        assert(!symbols.includes("ted nelson inventor"));
        assert(symbols.includes("hypertext"));
        assert(symbols.includes("xanadu"));
        assert(symbols.includes("hypermedia"));
    });



    // TODO: graph.suggest([node, hyperedge, etc...])
});