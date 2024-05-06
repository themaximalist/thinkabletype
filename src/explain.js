import LLM from "@themaximalist/llm.js"

const TEMPERATURE = 1;

// AI generator for ThinkableType
export default async function explain(user_prompt, hyperedges, options = {}) {
    if (typeof options.service === "undefined" && typeof options.model === "undefined") {
        options.service = LLM.LLAMAFILE;
        options.model = LLM.modelForService(options.service);
    }

    if (typeof options.temperature === "undefined") { options.temperature = TEMPERATURE }

    const prompt = `
You are a knowledge graph AI summarizer.
You are given two pieces of information: the entire context of a knowledge graph, and a term related to it.

Your job is to create a short, concise, accurate summary of the term using the context of the knowledge graph.
Be direct—the user knows what they're looking at. You're not chatting—you're labeling.
If relevant, use other terms from the knowledge graph to provide context.

Here is the knowledge graph. It's based on a hypergraph, that is a graph with hyperedges, which are relationships between terms.

\`\`\`csv
${hyperedges.map(edge => edge.join(",")).join("\n")}
\`\`\`

Here is the search term you should analyze: ${user_prompt}

Please return your short summary as a single sentence or a few sentences.
You don't need to return a greeting or any other text.
You don't to say anything like "in the context of"
    `.trim();

    options.stream = true;
    return await LLM(prompt, options);
}
