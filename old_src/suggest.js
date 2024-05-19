import LLM from "@themaximalist/llm.js"

const TEMPERATURE = 0;
const SCHEMA = {
    "type": "object",
    "properties": {
        "items": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    },
    "required": ["items"]
}

const PROMPT = `
I am a semantic analysis tool that can generate a list of high-confidence, distinct, and fact-based terms closely related to any word or phrase you provide.
I return short single word or multi-word phrases that are closely related to the input word or phrase.
I always return a list of up to 10 terms, unless there are fewer than 10 terms that meet the criteria.
I always return in JSON format like this { items: ["words", "go", "here"]}
I will now start, please let me know which word or words you'd like me to analyze.
`.trim();

export default async function suggest(symbol, options = {}) {
    if (typeof options.service === "undefined" && typeof options.model === "undefined") {
        options.service = LLM.LLAMAFILE;
        options.model = LLM.modelForService(options.service);
    }

    if (typeof options.temperature === "undefined") { options.temperature = TEMPERATURE }

    let prompt = options.prompt || PROMPT;
    delete options.prompt;

    if (options.service === LLM.OPENAI) {
        options.response_format = { "type": "json_object" };
    } else if (options.service == LLM.ANTHROPIC) {
        throw new Error("anthropic needs custom JSON handling");
    } else {
        if (typeof options.schema === "undefined") { options.schema = SCHEMA }
    }

    const llm = new LLM([], options);
    llm.system(prompt);

    const response = await llm.chat(symbol);
    if (!response) { throw new Error("No response from LLM") }
    if (!response.items) { throw new Error("No items in response from LLM") }
    return response.items.filter(item => item !== symbol);
}
