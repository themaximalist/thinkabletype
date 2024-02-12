import "dotenv-extended/config.js"

import HyperType from "../src/index.js";

import { expect, test } from "vitest";

const options = {
    llm: {
        service: "openai",
        model: "gpt-4-0125-preview",
        apikey: process.env.OPENAI_API_KEY
    }
};

test("hypertype suggest", async () => {
    const hypertype = new HyperType(options);
    const suggestions = await hypertype.suggest(["Steve Jobs", "inventor"]);
    expect(suggestions.includes("iPhone")).toBe(true);
    expect(suggestions.includes("Macintosh")).toBe(true);
}, 10000);


test("hyperedge suggest", async () => {
    const hypertype = new HyperType(options);
    const hyperedge = hypertype.add("Steve Jobs", "inventor");
    const suggestions = await hyperedge.suggest();
    expect(suggestions.includes("iPhone")).toBe(true);
    expect(suggestions.includes("Macintosh")).toBe(true);
}, 10000);
