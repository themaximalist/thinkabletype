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
You are given two pieces of information: a knowledge graph and a term related to it.

Your job is to create a short, concise, accurate summary of the term using the knowledge graph.
If relevant, use other terms from the knowledge graph.
Whenever you use a term in the knowledge graph—link it using Markdown.
For the "URL", create a clean slug from the symbol. Just the symbol, no other URL stuff.

Here is the knowledge graph. It's based on a hypergraph, that is a graph with hyperedges, which are relationships between terms.
The hyperedges are represented as CSV rows, where each row is a hyperedge, and each cell is a term in the hyperedge.

\`\`\`csv
${hyperedges.map(edge => edge.join(",")).join("\n")}
\`\`\`

Here is the search term you should analyze: "${user_prompt}"

It's ok if the term does not appear in the knowledge graph. You can still provide a summary based on the context.
If there's not much information you can provide, you can always default to talking about the connections to other nodes in the hypergraph.
Please return your short summary as a single sentence or a few sentences.
You don't need to return a greeting or any other text.
Be direct—the user knows what they're looking at. You're not chatting—you're labeling.
You don't to say anything like "in the context of" or "in the knowledge graph" or "without further context provided"
Just label the thing directly.
    `.trim();

    options.stream = true;
    return await LLM(prompt, options);
}
