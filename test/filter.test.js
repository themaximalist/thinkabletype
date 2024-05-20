import ThinkableType from "../src/index.js";

import { expect, test } from "vitest";

test.only("filter on isolated", () => {
    const thinkabletype = new ThinkableType({
        interwingling: ThinkableType.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});

