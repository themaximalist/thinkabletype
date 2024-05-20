import { v4 as uuidv4 } from 'uuid';

import Node from './node.js';

export default class Hyperedge {
    constructor(symbols = [], hypergraph) {
        this.nodes = [];
        this.hypergraph = hypergraph;
        this.add(symbols);
        this.uuid = uuidv4();
    }

    get id() {
        const id = this.symbols.join(".");
        if (this.hypergraph.isIsolated) {
            return `${this.index}:${id}`;
        }
        return id;
    }

    get index() {
        return this.hypergraph.hyperedges.indexOf(this);
    }

    get isFusionBridge() {
        return this.nodes.length === 2;
    }

    get symbols() {
        return this.nodes.map(node => node.symbol);
    }

    get firstNode() {
        return this.nodes[0];
    }

    get lastNode() {
        return this.nodes[this.nodes.length - 1];
    }

    get middleNodes() {
        if (this.nodes.length < 3) {
            return [];
        }

        return this.nodes.slice(1, this.nodes.length - 1);
    }

    get firstNodes() {
        return this.nodes.slice(0, -1);
    }

    get lastNodes() {
        return this.nodes.slice(1);
    }

    nodeId(index) {
        const id = this.symbols.slice(0, index + 1).join(".");
        if (this.hypergraph.isIsolated) {
            return `${this.index}:${id}`;
        }

        return id;
    }

    add(symbol) {
        if (Array.isArray(symbol)) {
            for (const s of symbol) {
                this.add(s);
            }
            return;
        }

        this.nodes.push(new Node(symbol, this));
    }

    updateGraphData(nodes, links) {
        let parent = null;

        for (const node of this.nodes) {
            node.updateGraphData(nodes, links)

            if (parent) {
                const link = this.linkData(parent, node);
                links.set(link.id, link);
            }

            parent = node;
        }

        // for (const node of this.nodes) {

        //     if (parent) {
        //         const link = this.linkData(parent, node);

        //         // a little hacky, but ensures masqurade nodes are properly linked to their hyperedges
        //         const existingLink = links.get(link.id);
        //         if (existingLink) {
        //             link._meta.hyperedgeIDs = link._meta.hyperedgeIDs.concat(existingLink._meta.hyperedgeIDs);
        //         }

        //         links.set(link.id, link);
        //     }

        //     parent = node;
        // }
    }


    linkData(parent, child) {
        const ids = new Set();
        const uuids = new Set();

        ids.add(parent.hyperedge.id);
        uuids.add(parent.hyperedge.uuid);

        if (child.bridge) {
            for (const edge of child.hyperedges) {
                ids.add(edge.id);
                uuids.add(edge.uuid);
            }
        } else {
            ids.add(child.hyperedge.id);
            uuids.add(child.hyperedge.uuid);
        }

        parent = this.hypergraph.masqueradeNode(parent);
        child = this.hypergraph.masqueradeNode(child);
        ids.add(parent.hyperedge.id);
        uuids.add(parent.hyperedge.uuid);

        if (child.bridge) {
            for (const edge of child.hyperedges) {
                ids.add(edge.id);
                uuids.add(edge.uuid);
            }
        } else {
            ids.add(child.hyperedge.id);
            uuids.add(child.hyperedge.uuid);
        }

        return {
            id: `${parent.id}->${child.id}`,
            source: parent.id,
            target: child.id,
            ids,
            uuids,
            // color: this.color,
        };
    }
}