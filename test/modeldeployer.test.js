import Hypergraph from "../src/hypergraph.js";

import assert from "assert";

describe.skip("Hypergraph Model Deployer", function () {

    it("modeldeployer openai embeddings", async function () {
        this.timeout(10000);
        this.slow(5000);

        const vectordb = {
            dimensions: 1536,
            embeddings: {
                service: "modeldeployer",
                model: "7cd96f49-9653-4d03-b47d-65bcee807e71",
                apikey: process.env.OPENAI_API_KEY
            }
        };

        const graph = await Hypergraph.parse(`Red,Green,Blue,Pink`, { vectordb });

        const pink = graph.get("Pink");

        const nodes = await pink.similar();
        assert(nodes[0].node.symbol == "Red");
        assert(nodes[0].distance > 0);
        assert(nodes[0].distance < 1);
    });

    it("modeldeployer openai chat", async function () {
        this.timeout(14000);
        this.slow(7000);

        const options = {
            vectordb: {
                dimensions: 1536,
                embeddings: {
                    service: "modeldeployer",
                    model: "7cd96f49-9653-4d03-b47d-65bcee807e71",
                    apikey: process.env.OPENAI_API_KEY
                },
            },
            llm: {
                service: "modeldeployer",
                model: "bbf950a2-83c7-47e5-be66-46ca6e43f316",
                apikey: process.env.OPENAI_API_KEY,
                temperature: 0.1,
            }
        };

        const graph = await Hypergraph.parse(`Ted Nelson,invented,HyperText`, options);

        const hyperedge = graph.get(["Ted Nelson", "invented"]);

        const nodes = await hyperedge.suggest();
        const symbols = nodes.map(node => node.symbol.toLowerCase());

        assert(symbols.includes("hypermedia"));
        assert(symbols.includes("project xanadu"));
    });
});