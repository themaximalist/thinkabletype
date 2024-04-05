import csv from "papaparse"
import LLM from "@themaximalist/llm.js"

const TEMPERATURE = 1;

// AI generator for ThinkableType
export default async function* generate(user_prompt, options = {}) {
    if (typeof options.service === "undefined" && typeof options.model === "undefined") {
        options.service = LLM.LLAMAFILE;
        options.model = LLM.modelForService(options.service);
    }

    if (typeof options.temperature === "undefined") { options.temperature = TEMPERATURE }

    const prompt = `
You are a knowledge graph AI.
You take a search term and return a list of high-confidence, distinct, and fact-based terms closely related to the input word or phrase.

You specialize in creating "hyperedges", or relationships between terms.

A hyperedge is represented like a CSV row, with each term separated by a comma. Like this:
term1,term2,term3

Return a list of hyperedges, by separating each hyperedge with a newline.

You can start with the search term you are given, and feel free to create new hyperedges that are different from the search term but related.

Our knowledge graph will reuse common terms, so pick good ones, and reference them in other hyperedges if they're related.

The goal is to return as many hyperedges as you can confidently generate while maintaining high quality. But please don't return more than 20.

We're trying to get a deep understanding of the search term, and the high-level concepts and how they interrelate.

Hyperedges can be as short as a single term, or as long as you want. Typically 3 is the sweet spot. 2 is ok in some cases. 4 is ok in some cases. 5 is probably too many.

You will now start. Here is the search term you should analyze: ${user_prompt}
    `.trim();

    options.stream = true;

    const response = await LLM(prompt, options);

    let buffer = "";
    for await (const message of response) {
        buffer += message;
        if (buffer.indexOf("\n") !== -1) {
            const lines = buffer.split("\n");
            buffer = lines.pop();
            for (const line of lines) {
                yield csv.parse(line).data;
            }
        }
    }
}
