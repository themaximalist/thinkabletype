import "dotenv-extended/config.js"

import ThinkableType from "../src/index.js";

import { expect, test } from "vitest";

const options = {
    llm: {
        service: "openai",
        model: "gpt-4-turbo-preview",
        apikey: process.env.OPENAI_API_KEY
    }
};

// TODO: autogen prompt

test.skip("generate", async () => {
    const thinkabletype = new ThinkableType(options);
    const prompt = `Ancient Sumerians`;
    const response = await thinkabletype.generate(prompt);
    let found = false;
    for await (const data of response) {
        expect(data.length).toBeGreaterThan(0)
        found = true;
        break;
    }

    expect(found).toBe(true);
}, 20000);