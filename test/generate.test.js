import "dotenv-extended/config.js"

import HyperType from "../src/index.js";

import { expect, test } from "vitest";

const options = {
    llm: {
        service: "openai",
        model: "gpt-4-turbo-preview",
        apikey: process.env.OPENAI_API_KEY
    }
};

// TODO: autogen prompt
// TODO: autogen prompt

test.only("generate", async () => {

    const hypertype = new HyperType(options);
    const prompt = `Ancient Sumerians`;
    const hyperedges = await hypertype.generate(prompt);
    console.log(hyperedges)
}, 20000);