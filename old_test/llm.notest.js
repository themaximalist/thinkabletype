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

test("thinkabletype suggest", async () => {
    const thinkabletype = new ThinkableType(options);
    const suggestions = await thinkabletype.suggest(["Steve Jobs", "inventor"]);

    expect(suggestions.includes("iPhone")).toBe(true);
    expect(suggestions.includes("Macintosh")).toBe(true);
}, 10000);


test("hyperedge suggest", async () => {
    const thinkabletype = new ThinkableType(options);
    const hyperedge = thinkabletype.add("Steve Jobs", "inventor");
    const suggestions = await hyperedge.suggest();
    expect(suggestions.includes("iPhone")).toBe(true);
    expect(suggestions.includes("Macintosh")).toBe(true);
}, 10000);
