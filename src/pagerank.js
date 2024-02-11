
export function calculatePageRank(hypergraph, iterations = 100, dampingFactor = 0.85, precision = 3) {
    let pageRanks = {};
    const symbols = hypergraph.symbols; // Get symbols from the hypergraph
    const initialRank = 1 / symbols.length;
    symbols.forEach(symbol => {
        pageRanks[symbol] = initialRank;
    });

    for (let i = 0; i < iterations; i++) {
        let newPageRanks = {};

        hypergraph.hyperedges.forEach(hyperedge => {
            const share = hyperedge.symbols.reduce((acc, symbol) => acc + pageRanks[symbol], 0) / hyperedge.symbols.length;
            hyperedge.symbols.forEach(symbol => {
                if (!newPageRanks[symbol]) {
                    newPageRanks[symbol] = 0;
                }
                newPageRanks[symbol] += share;
            });
        });

        symbols.forEach(symbol => {
            const rankFromSelf = (1 - dampingFactor) / symbols.length;
            const rankFromOthers = dampingFactor * (newPageRanks[symbol] || 0);
            pageRanks[symbol] = rankFromSelf + rankFromOthers;
        });
    }

    Object.keys(pageRanks).forEach(symbol => {
        pageRanks[symbol] = parseFloat(pageRanks[symbol].toFixed(precision));
    });

    return pageRanks;
}

export function pageRank(hypergraph, targetSymbol, precision = 3) {
    const pageRanks = hypergraph.pageranks;

    let contributions = {};

    // Initialize contributions for each symbol with 0
    hypergraph.symbols.forEach(symbol => {
        contributions[symbol] = 0;
    });

    // Iterate through each hyperedge to calculate contributions
    hypergraph.hyperedges.forEach(hyperedge => {
        if (hyperedge.symbols.includes(targetSymbol)) {
            hyperedge.symbols.forEach(symbol => {
                // Check if the current symbol is not the target symbol to avoid self-contributions
                if (symbol !== targetSymbol) {
                    const share = pageRanks[symbol] / hyperedge.symbols.length;
                    contributions[symbol] += share;
                }
            });
        }
    });

    // Format the contributions to the specified precision
    Object.keys(contributions).forEach(symbol => {
        contributions[symbol] = parseFloat(contributions[symbol].toFixed(precision));
    });

    return contributions;
}

