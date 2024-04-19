import ForceLink from "./ForceLink.js";
import * as utils from "./utils.js";

// ForceGraph is about taking the hypergraph, and converting it into a "react-force-graph" compatible format
// Because connections in ThinkableType can change dynamically, we build the graph data on the fly
// In many cases, we grab an explicit subset of hyperedges, and crawl out the graph based on options
export default class ForceGraph {
    constructor(hypergraph) {
        this.hypergraph = hypergraph;
    }

    graphData(hyperedges = undefined) {
        const nodes = new Map();
        const links = new Map();

        this.forceLinks = new Map();
        for (const hyperedge of this.hypergraph.hyperedges) {
            const forceLink = new ForceLink(hyperedge, this);
            this.forceLinks.set(hyperedge.id, forceLink);
        }

        this.updateIndexes();

        for (const link of this.forceLinks.values()) {
            if (link.nodes.length === 2) continue;
            link.updateGraphData(nodes, links);
        }

        this.updateFusionData(nodes, links);

        if (this.hypergraph.isBridge) {
            this.updateBridgeData(nodes, links);
        }

        if (Array.isArray(hyperedges)) {
            return this.filterGraphData(hyperedges, { nodes, links });
        }

        this.verify(nodes, links);

        return {
            nodes: Array.from(nodes.values()),
            links: Array.from(links.values()),
        };
    }

    // verify that all links have valid source and target nodes
    verify(nodes, links) {
        const nodeIDs = new Set(nodes.keys());

        for (const link of links.values()) {
            if (!nodeIDs.has(link.source)) {
                throw `Missing source ${link.source}`;
            } else if (!nodeIDs.has(link.target)) {
                throw `Missing target ${link.target}`;
            }
        }
    }

    // indexes are shortcuts to keeping track of hyperedge connections
    // symbolIndex: all symbols
    // startSymbolIndex connects symbols at the start
    // endSymbolIndex: connects symbols at the end
    // fusionIndex: connects symbols in the middle
    updateIndexes() {
        this.symbolIndex = new Map();
        this.startSymbolIndex = new Map();
        this.endSymbolIndex = new Map();

        this.fusionIndex = new Map();

        for (const link of this.forceLinks.values()) {
            for (const symbol of link.hyperedge.symbols) {
                utils.addIndex(this.symbolIndex, symbol, link);
            }

            utils.addIndex(this.startSymbolIndex, link.hyperedge.firstSymbol, link);
            utils.addIndex(this.endSymbolIndex, link.hyperedge.lastSymbol, link);
        }

        if (this.hypergraph.isFusion) {
            this.updateFusionIndexes();
        }
    }

    // Masquerade nodes are nodes that can pretend to be other nodes
    // This is useful for fusion nodes, where we want to connect nodes with the same symbol
    isMasqueradeNode(node) {
        return this.masqueradeNode(node) !== node;
    }

    masqueradeNode(node, max = 1000) {
        let i = 0;


        // console.log(this.fusionIndex);
        while (true) {
            if (i++ > max) {
                console.log("Infinite loop for", node.id)
                throw new Error("Infinite loop");
            }

            const masqueradeNode = this.fusionIndex.get(node.id);
            if (!masqueradeNode || masqueradeNode.id === node.id) {
                return node;
            }

            node = masqueradeNode;
        }
    }


    // build up fusion indexes based on the start and end symbols
    updateFusionIndexes() {
        for (const link of this.forceLinks.values()) {
            let edges;

            // start fusion
            edges = this.endSymbolIndex.get(link.hyperedge.firstSymbol) || [];
            if (edges.length > 0) {
                this.fusionIndex.set(link.nodeId(0), edges[0].lastNode);
            }

            // end fusion
            edges = this.endSymbolIndex.get(link.hyperedge.lastSymbol) || [];
            if (edges.length > 0) {
                this.fusionIndex.set(link.lastNodeId, edges[0].lastNode);
            }
        }
    }

    fusionLinks(node) {
        const links = this.symbolIndex.get(node.symbol) || [];
        return links.filter(link => {
            return link.id !== node.link.id;
        });
    }

    fusionNodes(node) {
        return this.fusionLinks(node).map(link => {
            return link.nodeForSymbol(node.symbol);
        });
    }

    // update fusion data for 2-edge nodes
    // these are treated special in ThinkableType, basically as a bridge but in fusion mode
    updateFusionData(nodes, links) {
        const seenIndex = new Map();

        for (const link of this.forceLinks.values()) {

            if (link.nodes.length !== 2) {
                for (const node of link.nodes) {
                    seenIndex.set(node.symbol, true);
                }
                continue;
            }

            if (this.hypergraph.isFusion) {

                console.log("LINK", link);

                let fromNodes = this.fusionNodes(link.firstNode);
                let toNodes = this.fusionNodes(link.lastNode);

                console.log("FROM NODES", fromNodes);
                console.log("TO NODES", toNodes);

                const firstSeen = seenIndex.get(link.firstNode.symbol);
                const lastSeen = seenIndex.get(link.lastNode.symbol);
                const seen = firstSeen || lastSeen;
                console.log("SEEN", firstSeen, lastSeen, seen);
                console.log(seenIndex);
                if (!seen) {
                    link.updateGraphData(nodes, links);
                }

                if (fromNodes.length === 0) {
                    for (const node of link.nodes.slice(0, -1)) {
                        console.log("ADDING");
                        node.updateGraphData(nodes, links);
                    }

                    toNodes.push(link.firstNode);
                }

                if (toNodes.length === 0) {
                    console.log("TO NODES EMPTY");
                    for (const node of link.nodes.slice(1)) {
                        console.log("ADDING1", node);
                        node.updateGraphData(nodes, links);
                    }

                    toNodes.push(link.lastNode);
                }

                for (const fromNode of fromNodes) {
                    for (const toNode of toNodes) {
                        if (!nodes.has(fromNode.id)) {
                            fromNode.updateGraphData(nodes, links);
                        }

                        if (!nodes.has(toNode.id)) {
                            toNode.updateGraphData(nodes, links);
                        }

                        const linkData = fromNode.link.linkData(fromNode, toNode);
                        links.set(link.id, linkData);
                    }
                }

            } else {
                link.updateGraphData(nodes, links);
            }

            for (const node of link.nodes) {
                seenIndex.set(node.symbol, true);
            }

        }

        console.log(nodes);
        console.log(links);

    }

    // bridges are nodes that connect multiple hyperedges
    // A -> B -> C
    // 1 -> B -> 2
    // When interwingle is bridge, both hyperedges will be connected through the "B" bridge node
    updateBridgeData(nodes, links) {
        const bridgeIndex = new Map();

        // Build up index of nodes
        for (const link of this.forceLinks.values()) {
            for (let node of link.nodes) {
                node = this.masqueradeNode(node);
                utils.setIndex(bridgeIndex, node.symbol, node);
            }
        }


        // Iterate through index, check which nodes have multiple connections
        // If found, create a bridgeNode and connect them all
        for (const bridgeNodes of bridgeIndex.values()) {
            if (bridgeNodes.size < 2) continue;

            const hyperedgeIDs = Array.from(bridgeNodes.values()).map(node => node.link.id);

            const bridgeNode = {
                id: `${bridgeNodes.values().next().value.symbol}#bridge`,
                bridge: true,
                _meta: {
                    hyperedgeIDs: hyperedgeIDs
                }
            };

            nodes.set(bridgeNode.id, bridgeNode);


            for (const node of bridgeNodes.values()) {
                const link = {
                    id: `${bridgeNode.id}->${node.id}`,
                    source: bridgeNode.id,
                    target: node.id,
                    color: node.link.color,
                    _meta: {
                        hyperedgeIDs: hyperedgeIDs
                    },
                };

                links.set(link.id, link);
            }
        }
    }

    // hacky...but it works
    // filter hyperedges, and then expand out based on interwingle connections
    filterGraphData(hyperedges, graphData) {
        const hyperedgeIDs = new Set(hyperedges.map(hyperedge => hyperedge.id));
        const nodeIDs = new Set();

        const nodes = new Map();
        const links = new Map();

        let depth = this.hypergraph.depth;

        const updateNodesAndLinks = (depth = 0) => {
            for (const node of graphData.nodes.values()) {
                const ids = node._meta.hyperedgeIDs;
                if (ids.some(id => hyperedgeIDs.has(id))) {
                    if (node.bridge && (!this.hypergraph.isBridge || depth === 0)) continue;
                    nodes.set(node.id, node);
                    nodeIDs.add(node.id);
                }
            }

            for (const link of graphData.links.values()) {
                if (nodeIDs.has(link.source) && nodeIDs.has(link.target)) {
                    links.set(link.id, link);
                }
            }

        }

        function updateHyperedges() {
            for (const node of nodes.values()) {
                for (const id of node._meta.hyperedgeIDs) {
                    hyperedgeIDs.add(id);
                }
            }

            for (const link of links.values()) {
                for (const id of link._meta.hyperedgeIDs) {
                    hyperedgeIDs.add(id);
                }
            }
        }

        updateNodesAndLinks(depth);

        let finalNodes = new Map(nodes);
        let finalLinks = new Map(links);
        let maxDepth = 0;

        while (true) {
            const existingNodeSize = nodes.size;
            const existingLinkSize = links.size;

            updateHyperedges();
            updateNodesAndLinks(maxDepth);

            if (maxDepth < depth) {
                finalNodes = new Map(nodes);
                finalLinks = new Map(links);
            }

            if (existingNodeSize === nodes.size && existingLinkSize === links.size) {
                break;
            }

            maxDepth++;
        }


        this.verify(finalNodes, finalLinks);

        if (maxDepth < 0) { maxDepth = 0 }
        if (depth > maxDepth) { depth = maxDepth }

        return {
            nodes: Array.from(finalNodes.values()),
            links: Array.from(finalLinks.values()),
            depth,
            maxDepth,
        };
    }
}

