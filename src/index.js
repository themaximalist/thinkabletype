import Hypergraph from "./hypergraph.js";

async function main() {
    const graph = Hypergraph.parse(`Ted Nelson invented hypertext
Ted Nelson invented hypermedia
Ted Nelson invented Xanadu`);

    await graph.waitForLoaded();

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(graph.nodes.length);

    console.log("SIMILAR");
    console.log(await graph.similar("hypermedia"));
}

main();

// TODO: node.similar() should return similar to that node
// TODO: hyperedge.similar() should return similar to that hyperedge (...how to do this?)
//        - do we need to do a hyperedge embedding? --> yes
//        - do any of these nodes form a known hyper edge? if so, what are the longest ones?
// TODO: needs more tests...super buggy

// TODO: therefore we need embeddings to be better. faster. ideally not async...but need another way to "load" a node and not have it leak everywhere.
//        - just be explicit. anywhere a node is created, it needs to be loaded. same with a hyperedge. cache. cache. cache. test. test. test.