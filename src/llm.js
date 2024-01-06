import LLM from "@themaximalist/llm.js"

export async function suggest(symbol) {
    const llm = new LLM([], { temperature: 0 });
    llm.system(`
You are a brainstorming bot.
I will send you a word.
Reply back with a similar but different Person, Place, Thing, Adjective, etc...
Make sure the word is sufficiently different.
`.trim());
    const response = await llm.chat(symbol);
    return response.trim();
}

export async function connect() {
}