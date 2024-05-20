import ThinkableType from "../src/index.js";

import { expect, test } from "vitest";

// TODO: regular colors, light mode / dark mode
test("custom colors", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["L", "M", "N"],
            ["X", "Y", "Z"],
        ],
        colors: ["#000000"],
    });

    const data = thinkabletype.graphData();
    for (const node of data.nodes) {
        expect(node.color).toBe("#000000");
    }
});

test.skip("huge", async () => {
    const fs = require("fs");
    const hyperedges = fs
        .readFileSync("/Users/brad/Projects/loom/data/data.thinkabletype", "utf-8")
        .split("\n")
        // .slice(0, 1800)
        .map((line) => {
            return line.split(" -> ");
        });

    const start = Date.now();
    const thinkabletype = new ThinkableType({ hyperedges, interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    // await thinkabletype.sync();
    const data = thinkabletype.graphData();
    const elapsed = Date.now() - start;
    console.log("elapsed", elapsed);

    // console.log(data);
});