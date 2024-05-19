import ThinkableType from "../src/index.js";

import { expect, test } from "vitest";

test("graph data", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("A");
    expect(data.nodes[1].id).toBe("B");
    expect(data.nodes[2].id).toBe("C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("A->B");
    expect(data.links[1].id).toBe("B->C");
});