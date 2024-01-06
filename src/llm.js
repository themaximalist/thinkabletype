import LLM from "@themaximalist/llm.js"

const SCHEMA = {
    "type": "object",
    "properties": {
        "words": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    },
    "required": ["words"]
}

const PROMPT = `
As an advanced semantic analysis tool, you are tasked with generating a list of up to 10 high-confidence, distinct, and fact-based terms closely related to any word or phrase I provide.
When the input includes specific relationships or attributes, concentrate on providing direct and factual answers relevant to these aspects, such as names of people, titles of inventions, or names of organizations directly associated.
For general single-word inputs, offer a broad array of relevant entities.
Ensure all outputs are concrete, excluding subjective descriptions and avoiding repetition of the input words.
Present the results in order of relevance with the most direct and accurate associations listed first.
`.trim();

const TEMPERATURE = 0;

const MODEL = "llamafile";

export async function suggest(symbol, options = {}) {
    const llm = new LLM([], {
        temperature: options.temperature || TEMPERATURE,
        schema: options.schema || SCHEMA,
        model: options.model || MODEL,
    });
    llm.system(options.prompt || PROMPT);
    const { words } = await llm.chat(symbol);
    return words.filter(word => word !== symbol);
}

export async function connect() {
}