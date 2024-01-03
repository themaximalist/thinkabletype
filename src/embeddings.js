import embeddings from "@themaximalist/embeddings.js";
import fs from "fs";

const cache = {};

async function loadCache() {
    if (fs.existsSync("hypertype.embeddings.cache.json")) {
        const data = fs.readFileSync("cache.json");
        Object.assign(cache, JSON.parse(data));
    }
}


async function saveCache() {
    fs.writeFileSync("hypertype.embeddings.cache.json", JSON.stringify(cache));
}


export default async function embedding(input) {
    if (cache[input]) {
        return cache[input];
    }

    const embedding = await embeddings(input);

    cache[input] = embedding;

    saveCache();

    return embedding;
}

loadCache();