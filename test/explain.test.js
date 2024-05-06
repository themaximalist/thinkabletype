import "dotenv-extended/config.js"

import ThinkableType from "../src/index.js";

import { expect, test } from "vitest";

const options = {
    llm: {
        // service: "openai",
        // model: "gpt-4-turbo-preview",
        // apikey: process.env.OPENAI_API_KEY

        service: "groq",
        model: "llama3-8b-8192",
        apikey: process.env.GROQ_API_KEY

        // service: "together",
        // model: "meta-llama/Llama-3-8b-chat-hf",
        // apikey: process.env.TOGETHER_API_KEY
    }
};

// TODO: autogen prompt

test.only("explain", async () => {
    const content = `ancient sumerians,cuneiform writing,clay tablets
ancient sumerians,ziggurats,religious temples
ancient sumerians,Iraq,Mesopotamia
Mesopotamia,Tigris River,Euphrates River
ancient sumerians,agriculture,wheel
agriculture,irrigation systems,city-states
ancient sumerians,bronze metallurgy,weapons
cuneiform writing,education,scribes
ancient sumerians,mathematics,geometry
mathematics,60-base numeral system,time measurement
ancient sumerians,astronomy,calendar
ancient sumerians,mythology,gods
ziggurats,Ur,Uruk
ancient sumerians,economy,trade networks
trade networks,Lapis lazuli,Indus Valley
ancient sumerians,law code,Code of Ur-Nammu
ancient sumerians,social structure,priests
social structure,slaves,farmers
ancient sumerians,Epic of Gilgamesh,literature`;

    const thinkabletype = ThinkableType.parse(content, options);
    const prompt = `gods`;
    const response = await thinkabletype.explain(prompt);

    let buffer = "";
    for await (const message of response) {
        buffer += message;
    }

    expect(buffer.length).toBeGreaterThan(0);
}, 20000);