import * as utils from "./utils.js";

export default class ForceNode {
    constructor(symbol, index, link) {
        this.symbol = symbol;
        this.index = index;
        this.link = link;
    }

    get id() {
        return this.link.nodeId(this.index);
    }

    updateGraphData(nodes, links) {
        nodes.set(this.id, {
            id: this.id,
            name: this.symbol,
            color: this.link.color,
            textHeight: 8,
        });
    }
}
