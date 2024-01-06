import Hypergraph from "./hypergraph.js";

export default Hypergraph;

/*
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
*/
