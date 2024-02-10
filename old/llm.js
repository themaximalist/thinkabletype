/*
import "dotenv-extended/config.js"
import debug from "debug"
const log = debug("hypertype:test:llm");

import Hypergraph from "../src/hypergraph.js"

import assert from "assert"

describe.skip("Hypergraph LLM", function () {
    this.timeout(10000);
    this.slow(5000);

    describe("llamafile", function () {
        it("node suggest", async function () {
            this.timeout(30000);
            this.slow(15000);

            // not great results but we simplify tests with temperature=0 to be more stable
            const data = {
                "Steve Jobs": ["Apple", "iPhone"],
                "Ted Nelson": ["hypertext"]
            };

            for (const symbol in data) {
                const graph = new Hypergraph();

                log(`finding similar for ${symbol}`);
                const node = await graph.add(symbol);
                const nodes = await node.suggest();

                let expected = data[symbol];
                assert(expected.length > 0);
                for (const node of nodes) {
                    // filter out any expected symbols
                    expected = expected.filter(symbol => symbol.indexOf(node.symbol) === -1);
                }
                assert(expected.length === 0, `expected ${data[symbol]} but got ${nodes.map(node => node.symbol)}`);
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
        });

        it("graph suggest", async function () {
            this.timeout(30000);
            this.slow(15000);

            const graph = new Hypergraph();
            const node1 = await graph.add("Steve Jobs");
            const node2 = await graph.add("Walt Disney");

            const nodes = await graph.suggest(node1, node2);

            const symbols = nodes.map(node => node.symbol.toLowerCase());
            let found = false;
            for (const symbol of symbols) {
                if (symbol.includes("pixar")) {
                    found = true;
                    break;
                }
            }

            assert(found);
        });
    });

    describe("openai", function () {
        it("node suggest", async function () {
            this.timeout(30000);
            this.slow(15000);

            const data = {
                "Steve Jobs": ["Apple Inc.", "NeXT Computer", "Pixar", "iPhone"],
                "Ted Nelson": ["Project Xanadu", "Hypertext", "Hypermedia"],
            };

            for (const symbol in data) {
                const graph = new Hypergraph({
                    llm: {
                        service: "openai",
                        model: "gpt-4-1106-preview",
                    }
                });

                log(`finding similar for ${symbol}`);
                const node = await graph.add(symbol);
                const nodes = await node.suggest();

                let expected = data[symbol];
                assert(expected.length > 0);
                for (const node of nodes) {
                    expected = expected.filter(symbol => symbol.indexOf(node.symbol) === -1);
                }
                assert(expected.length === 0, `expected ${data[symbol]} but got ${nodes.map(node => node.symbol)}`);
            }
        });

    });

    // TODO: claude
    // TODO: modeldeployer

});

// TODO: hyperedge connect
// TODO: graph.suggest hyperedge
*/