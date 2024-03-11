#!/usr/bin/env node
import dotenv from "dotenv-extended";
dotenv.load();

import HyperType from "./index.js";

const search = process.argv.slice(2).join(" ");
if (!search || search.trim().length === 0) {
    console.error("Please provide a search term");
    process.exit(1);
}

const hypertype = new HyperType({
    llm: {
        service: "openai",
        model: "gpt-4-turbo-preview",
        apikey: process.env.OPENAI_API_KEY
    }
});

const hyperedges = await hypertype.generate(search);
for await (const hyperedge of hyperedges) {
    console.log(hyperedge[0].join(","));
}
