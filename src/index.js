import VectorDB from "@themaximalist/vectordb-lite.js";

export default class Hypergraph {
    constructor() {
        this.vectordb = new VectorDB();
        console.log("INIT HYPERGRAPH");
    }
}

//import Hypergraph from "./hypergraph.js";
//export default Hypergraph;
