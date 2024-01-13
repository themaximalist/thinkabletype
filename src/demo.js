import "dotenv-extended/config.js"
import Hypergraph from "./hypergraph.js";

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
        temperature: 0.5,
    }
};

const graph = await Hypergraph.parse(`Ted Nelson, invented, hypertext
Ted Nelson, invented, hypermedia
Ted Nelson, invented, Xanadu`, options);

const nelson = await graph.create(["Ted Nelson", "invented"]);
console.log(nelson);
const similar = await nelson.similar();
console.log("SIMILAR", similar)

const suggested = await nelson.suggest();
console.log("SUGGESTED", suggested);