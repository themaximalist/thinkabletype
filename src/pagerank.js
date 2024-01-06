
export function calculatePageRank(hypergraph, iterations = 100, dampingFactor = 0.85, precision = 3) {
    let pageRanks = {};
    const initialRank = 1 / hypergraph.nodes.length;
    hypergraph.nodes.forEach(node => {
        pageRanks[node.symbol] = initialRank;
    });

    for (let i = 0; i < iterations; i++) {
        let newPageRanks = {};

        hypergraph.nodes.forEach(node => {
            const hyperedges = node.hyperedges();
            hyperedges.forEach(hyperedge => {
                const share = pageRanks[node.symbol] / hyperedge.nodes.length;
                hyperedge.nodes.forEach(neighbor => {
                    if (!node.equal(neighbor)) {
                        if (!newPageRanks[neighbor.symbol]) {
                            newPageRanks[neighbor.symbol] = 0;
                        }
                        newPageRanks[neighbor.symbol] += share;
                    }
                });
            });
        });

        hypergraph.nodes.forEach(node => {
            const rankFromSelf = (1 - dampingFactor) / hypergraph.nodes.length;
            const rankFromOthers = dampingFactor * (newPageRanks[node.symbol] || 0);
            pageRanks[node.symbol] = rankFromSelf + rankFromOthers;
        });
    }

    Object.keys(pageRanks).forEach(nodeSymbol => {
        pageRanks[nodeSymbol] = parseFloat(pageRanks[nodeSymbol].toFixed(precision));
    });

    return pageRanks;
}

export function pageRank(hypergraph, symbol, precision = 3) {
    const pageRanks = hypergraph.pageranks;

    let contributions = {};

    hypergraph.nodes.forEach(node => {
        contributions[node.symbol] = 0;

        const hyperedges = node.hyperedges();
        hyperedges.forEach(hyperedge => {
            if (hyperedge.has(symbol)) {
                const share = pageRanks[node.symbol] / hyperedge.nodes.length;
                contributions[node.symbol] += share;
            }
        });
    });

    Object.keys(contributions).forEach(nodeSymbol => {
        contributions[nodeSymbol] = parseFloat(contributions[nodeSymbol].toFixed(precision));
    });

    return contributions;
}
