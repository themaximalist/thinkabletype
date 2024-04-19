import ThinkableType from "../src/index.js";

import { expect, test } from "vitest";

test("single hyperedge (isolate)", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [["A", "B", "C"]]
    });
    expect(thinkabletype).toBeInstanceOf(ThinkableType);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("0:A");
    expect(data.nodes[1].id).toBe("0:A.B");
    expect(data.nodes[2].id).toBe("0:A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("0:A->0:A.B");
    expect(data.links[0].source).toBe("0:A");
    expect(data.links[0].target).toBe("0:A.B");
    expect(data.links[0]._meta.hyperedgeIDs).toContain("0:A->B->C");

    expect(data.links[1].id).toBe("0:A.B->0:A.B.C");
    expect(data.links[1].source).toBe("0:A.B");
    expect(data.links[1].target).toBe("0:A.B.C");
    expect(data.links[1]._meta.hyperedgeIDs).toContain("0:A->B->C");
});

test("single hyperedge (confluence)", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [["A", "B", "C"]],
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE
    });
    expect(thinkabletype).toBeInstanceOf(ThinkableType);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("A");
    expect(data.nodes[1].id).toBe("A.B");
    expect(data.nodes[2].id).toBe("A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[0].source).toBe("A");
    expect(data.links[0].target).toBe("A.B");
    expect(data.links[0]._meta.hyperedgeIDs).toContain("A->B->C");

    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[1].source).toBe("A.B");
    expect(data.links[1].target).toBe("A.B.C");
    expect(data.links[1]._meta.hyperedgeIDs).toContain("A->B->C");
});

test("multiple hyperedge (confluence)", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["A", "1", "2"],
        ],
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE
    });

    expect(thinkabletype).toBeInstanceOf(ThinkableType);
    expect(thinkabletype.symbols).toEqual(["A", "B", "C", "1", "2"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);

    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("A->A.1");
    expect(data.links[3].id).toBe("A.1->A.1.2");

    expect(data.links[0]._meta.hyperedgeIDs).toContain("A->B->C");
    expect(data.links[1]._meta.hyperedgeIDs).toContain("A->B->C");
    expect(data.links[2]._meta.hyperedgeIDs).toContain("A->1->2");
    expect(data.links[3]._meta.hyperedgeIDs).toContain("A->1->2");
});

test("fusion start", () => {
    const hyperedges = [
        // A.B.C.D.E
        ["A", "B", "C"],
        ["C", "D", "E"]
    ];

    const thinkabletype = new ThinkableType({
        hyperedges,
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    expect(thinkabletype.hyperedges.length).toEqual(2);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5); // C masquerades as A.B.C
    expect(data.links.length).toBe(4);

    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("A.B.C->C.D");
    expect(data.links[3].id).toBe("C.D->C.D.E");
});

test("fusion end", () => {
    const hyperedges = [
        // A.B.C && 1.2.C with C as fusion node
        ["A", "B", "C"],
        ["1", "2", "C"],
    ];

    const thinkabletype = new ThinkableType({
        hyperedges,
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    expect(thinkabletype.hyperedges.length).toEqual(2);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5); // C masquerades as A.B.C
    expect(data.links.length).toBe(4);

    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("1->1.2");
    expect(data.links[3].id).toBe("1.2->A.B.C");
});

test("bridge", () => {
    const hyperedges = [
        ["A", "vs", "B"],
        ["1", "vs", "2"],
    ];

    const thinkabletype = new ThinkableType({
        hyperedges,
        interwingle: ThinkableType.INTERWINGLE.BRIDGE
    });

    expect(thinkabletype.hyperedges.length).toEqual(2);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(7);
    expect(data.links.length).toBe(6);

    expect(data.links[0].id).toBe("A->A.vs");
    expect(data.links[1].id).toBe("A.vs->A.vs.B");
    expect(data.links[2].id).toBe("1->1.vs");
    expect(data.links[3].id).toBe("1.vs->1.vs.2");
    expect(data.links[4].id).toBe("vs#bridge->A.vs");
    expect(data.links[5].id).toBe("vs#bridge->1.vs");
});

test("single node edge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add("A");
    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(1);
});

test("fusion no bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
    thinkabletype.add("A", "B");
    thinkabletype.add("B", "C");
    thinkabletype.add("1", "B", "2");
    thinkabletype.add("3", "B", "4");

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(9);
    expect(data.links.length).toBe(6);
});

test("two-edge start bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add("B", "C");
    thinkabletype.add("1", "B", "2");

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(6);
    expect(data.links.length).toBe(5);
});

test("two-edge end bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add("A", "B");
    thinkabletype.add("1", "B", "2");

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(6);
    expect(data.links.length).toBe(5);
});

test("continuous fusion", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
    thinkabletype.add("A", "B");
    thinkabletype.add("B", "C");
    thinkabletype.add("C", "D");
    thinkabletype.add("D", "E");

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);
});

// allow 
// they can't be bridge nodes, because we don't want to have to delete them after
// they have to be a fusion node
test("direct connect fusion", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "3"],
            ["B", "2"],
        ],
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const graphData = thinkabletype.graphData();
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(5);
});

test.only("direct connect bridge", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "3"],
            ["B", "2"],
        ],
        interwingle: ThinkableType.INTERWINGLE.BRIDGE
    });

    const graphData = thinkabletype.graphData();
    console.log(graphData);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(5);
});

// TODO: a,b,c
// TODO: c,a
// TODO: Should we think about 2-way fusion connections as just links?
//         not do masquerade...just add extra links everywhere at the end?



test.skip("direct connect multiple fusion", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["X", "B", "Z"],
            ["1", "2", "3"],
            ["B", "2"],
        ],
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const graphData = thinkabletype.graphData();
    console.log(graphData);
    expect(graphData.nodes.length).toBe(9);
    // expect(graphData.links.length).toBe(8);
});



// TODO: what happens in bridge mode? with lots of connections? do we lose fusion?


test("two-edge fusion skip bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add("A", "B");
    thinkabletype.add("B", "C");

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.links.length).toBe(2);
});

test("two-edge confluence skip fusion and bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add("A", "B");
    thinkabletype.add("B", "C");
    thinkabletype.add("B", "1", "2");

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);
});

test("two-edge fusion bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add("A", "B");
    thinkabletype.add("B", "C");
    thinkabletype.add("1", "B", "2");
    thinkabletype.add("3", "B", "4");

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(10);
    expect(data.links.length).toBe(9);
});

test("closed fusion loop", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
    thinkabletype.add("A", "B", "C", "A");

    const data = thinkabletype.graphData();

    expect(data.nodes.length).toBe(3);
    expect(data.links.length).toBe(3);
});

test("filter on isolated", () => {
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

test("filter on multiple edges isolated", () => {
    const thinkabletype = new ThinkableType({
        interwingling: ThinkableType.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const graphData = thinkabletype.graphData([["A"], ["1"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(4);
});

test("filter on multiple overlapping edges isolated", () => {
    const thinkabletype = new ThinkableType({
        interwingling: ThinkableType.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const graphData = thinkabletype.graphData([["C"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(4);
});

test("filter edge fusion", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        interwingle: ThinkableType.INTERWINGLE.FUSION,
        hyperedges: [
            ["A", "B", "C"],
            ["C", "D", "E"],
        ]
    });

    const graphData = thinkabletype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(5); // fusion grabs connected C->D->E node
    expect(graphData.links.length).toBe(4);
});

test("filter edge confluence", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "B", "1"],
        ]
    });

    const graphData = thinkabletype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(4); // confluence grabs connected A->B->1 edge
    expect(graphData.links.length).toBe(3);
});


test("filter edge bridge", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        interwingle: ThinkableType.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["1", "vs", "2"],
            ["A", "vs", "B"],
        ]
    });

    const graphData = thinkabletype.graphData([["1"]]);
    expect(graphData.nodes.length).toBe(7); // bridge graphs connected A vs B edge
    expect(graphData.links.length).toBe(6);
});

test("filter edge confluence shallow", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.SHALLOW,
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "2", "1"],
        ]
    });

    const graphData = thinkabletype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});

test("filter edge confluence deep", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "2", "1"],
        ]
    });

    const graphData = thinkabletype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(5); // confluence grabs connected A->B->1 edge
    expect(graphData.links.length).toBe(4);
});

test("filter interwingle progression", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        hyperedges: [
            ["A", "B", "2", "C"],
            ["C", "B", "1"],
            ["A", "Y", "Z"],
        ]
    });

    let graphData;

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.ISOLATED;
    graphData = thinkabletype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.CONFLUENCE;
    graphData = thinkabletype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(5);

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.FUSION;
    graphData = thinkabletype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(8);
    expect(graphData.links.length).toBe(7);

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.BRIDGE;
    graphData = thinkabletype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(9);
});

test("filter fusion depth", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.FUSION,
        hyperedges: [
            ["A", "B", "C"],
            ["C", "D", "E"],
            ["E", "F", "G"],
            ["G", "H", "I"],
            ["I", "J", "K"],
            ["K", "L", "M"],
            ["M", "N", "O"],
            ["O", "P", "Q"],
        ]
    });

    let graphData;

    thinkabletype.depth = ThinkableType.DEPTH.SHALLOW;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);

    thinkabletype.depth = 2;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);

    thinkabletype.depth = 3;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);

    thinkabletype.depth = 4;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(11);
    expect(graphData.links.length).toBe(10);

    thinkabletype.depth = 5;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(13);
    expect(graphData.links.length).toBe(12);

    thinkabletype.depth = 6;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(15);
    expect(graphData.links.length).toBe(14);

    thinkabletype.depth = 7;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(17);
    expect(graphData.links.length).toBe(16);

    thinkabletype.depth = ThinkableType.DEPTH.DEEP;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(17);
    expect(graphData.links.length).toBe(16);
});


test("fusion meta hyperedge ids regression", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.FUSION,
        depth: ThinkableType.DEPTH.DEEP
    });
    thinkabletype.add("A", "B", "C");
    thinkabletype.add("C", "D", "E");
    thinkabletype.add("1", "2", "C");

    const graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);
});

test("filter fusion depth regression", () => {
    const content = `
Ted Nelson,invented,HyperText
Tim Berners-Lee,invented,WWW
HyperText,influenced,WWW
Vannevar Bush,author,As We May Think
As We May Think,influenced,HyperText
Ted Nelson,author,Computer Lib/Dream Machines
Tim Berners-Lee,author,Weaving the Web
    `.trim();

    const thinkabletype = ThinkableType.parse(content, { interwingle: ThinkableType.INTERWINGLE.FUSION });

    let graphData, symbols;
    thinkabletype.depth = ThinkableType.DEPTH.SHALLOW;
    graphData = thinkabletype.graphData([["Ted Nelson"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    symbols = graphData.nodes.map(node => node.name);
    expect(symbols).toContain("Ted Nelson");
    expect(symbols).toContain("invented");
    expect(symbols).toContain("HyperText");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Computer Lib/Dream Machines");

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["Ted Nelson"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);
    symbols = graphData.nodes.map(node => node.name);
    expect(symbols).toContain("Ted Nelson");
    expect(symbols).toContain("invented");
    expect(symbols).toContain("HyperText");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Computer Lib/Dream Machines");
    expect(symbols).toContain("WWW");
    expect(symbols).toContain("influenced");
    expect(symbols).toContain("As We May Think");

    thinkabletype.depth = 2;
    graphData = thinkabletype.graphData([["Ted Nelson"]]);
    expect(graphData.nodes.length).toBe(13);
    expect(graphData.links.length).toBe(12);
    symbols = graphData.nodes.map(node => node.name);
    expect(symbols).toContain("Ted Nelson");
    expect(symbols).toContain("invented");
    expect(symbols).toContain("HyperText");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Computer Lib/Dream Machines");
    expect(symbols).toContain("WWW");
    expect(symbols).toContain("influenced");
    expect(symbols).toContain("As We May Think");
    expect(symbols).toContain("Vannevar Bush");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Tim Berners-Lee");
});

test("filter fusion multiple edge depth regression", () => {
    const content = `
Ted Nelson,invented,HyperText
Tim Berners-Lee,invented,WWW
HyperText,influenced,WWW
Vannevar Bush,author,As We May Think
As We May Think,influenced,HyperText
Ted Nelson,author,Computer Lib/Dream Machines
Tim Berners-Lee,author,Weaving the Web
    `.trim();

    const thinkabletype = ThinkableType.parse(content, { interwingle: ThinkableType.INTERWINGLE.FUSION });

    let graphData, symbols;
    thinkabletype.depth = ThinkableType.DEPTH.SHALLOW;
    graphData = thinkabletype.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);
    symbols = graphData.nodes.map(node => node.name);
    expect(symbols).toContain("Ted Nelson");
    expect(symbols).toContain("invented");
    expect(symbols).toContain("HyperText");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Computer Lib/Dream Machines");
    expect(symbols).toContain("influenced");
    expect(symbols).toContain("WWW");
    expect(symbols).toContain("Tim Berners-Lee");

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.nodes.length).toBe(13);
    expect(graphData.links.length).toBe(12);
    symbols = graphData.nodes.map(node => node.name);
    expect(symbols).toContain("Ted Nelson");
    expect(symbols).toContain("invented");
    expect(symbols).toContain("HyperText");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Computer Lib/Dream Machines");
    expect(symbols).toContain("WWW");
    expect(symbols).toContain("influenced");
    expect(symbols).toContain("As We May Think");
    expect(symbols).toContain("Weaving the Web");

    thinkabletype.depth = 2;
    graphData = thinkabletype.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.nodes.length).toBe(15);
    expect(graphData.links.length).toBe(14);
    symbols = graphData.nodes.map(node => node.name);
    expect(symbols).toContain("Ted Nelson");
    expect(symbols).toContain("invented");
    expect(symbols).toContain("HyperText");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Computer Lib/Dream Machines");
    expect(symbols).toContain("WWW");
    expect(symbols).toContain("influenced");
    expect(symbols).toContain("As We May Think");
    expect(symbols).toContain("Weaving the Web");
    expect(symbols).toContain("Vannevar Bush");
});

test("filter bridge depth", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["A", "vs", "B"],
            ["C", "vs", "D"],
            ["E", "vs", "G"],
        ]
    });

    let graphData;

    thinkabletype.depth = ThinkableType.DEPTH.SHALLOW;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);

    thinkabletype.depth = ThinkableType.DEPTH.DEEP;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(10);
    expect(graphData.links.length).toBe(9)
});

test("get max depth", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.SHALLOW,
        interwingle: ThinkableType.INTERWINGLE.FUSION,
        hyperedges: [
            ["A", "B", "C"],
            ["C", "D", "E"],
            ["E", "F", "G"],
            ["G", "H", "I"],
            ["I", "J", "K"],
            ["K", "L", "M"],
            ["M", "N", "O"],
            ["O", "P", "Q"],
        ]
    });

    let graphData;

    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
    expect(graphData.depth).toBe(0);
    expect(graphData.maxDepth).toBe(7);

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(7);
});

test("filter bridge depth missing node regression", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.SHALLOW,
        interwingle: ThinkableType.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["A", "vs", "B"],
            ["1", "vs", "2"],
        ]
    });

    let graphData;

    thinkabletype.depth = ThinkableType.DEPTH.SHALLOW;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);
});

test("max depth bridge regression", () => {
    const content = `
Ted Nelson,invented,HyperText
Tim Berners-Lee,invented,WWW
HyperText,influenced,WWW
Vannevar Bush,author,As We May Think
As We May Think,influenced,HyperText
Ted Nelson,author,Computer Lib/Dream Machines
Tim Berners-Lee,author,Weaving the Web
    `.trim();

    const thinkabletype = ThinkableType.parse(content, { interwingle: ThinkableType.INTERWINGLE.BRIDGE });

    let graphData;
    thinkabletype.depth = 0;
    graphData = thinkabletype.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.depth).toBe(0);
    expect(graphData.maxDepth).toBe(2);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.maxDepth).toBe(1);
    expect(graphData.nodes.length).toBe(18);
    expect(graphData.links.length).toBe(21);

    thinkabletype.depth = 2;
    graphData = thinkabletype.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.maxDepth).toBe(1);
    expect(graphData.nodes.length).toBe(18);
    expect(graphData.links.length).toBe(21);
});

test("find no edges", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.SHALLOW,
        interwingle: ThinkableType.INTERWINGLE.FUSION,
        hyperedges: [
            ["A", "B", "C"],
            ["C", "D", "E"],
            ["E", "F", "G"],
            ["G", "H", "I"],
            ["I", "J", "K"],
            ["K", "L", "M"],
            ["M", "N", "O"],
            ["O", "P", "Q"],
        ]
    });

    let graphData;

    graphData = thinkabletype.graphData([["A", "C"]]);
    expect(graphData.nodes.length).toBe(0);
    expect(graphData.links.length).toBe(0);
});

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

test("filter maxDepth regression", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["1", "2", "3"],
            ["A", "B", "1"]
        ]
    });

    let graphData;

    thinkabletype.depth = ThinkableType.DEPTH.SHALLOW;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
    expect(graphData.depth).toBe(0);
    expect(graphData.maxDepth).toBe(1);

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(1);

    thinkabletype.depth = 2;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(1);

    thinkabletype.depth = ThinkableType.DEPTH.DEEP;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(1);
});



// one way A -> B (works on any part?)
// two way A <-> B (works on any part?)
// todo: make sure doesn't break bridge mode



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

