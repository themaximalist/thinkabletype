import Colors from "./colors.js";

export function addIndex(index, key, val) {
    if (!index.has(key)) {
        index.set(key, []);
    }

    index.get(key).push(val);
}

export function setIndex(index, key, val) {
    if (!index.has(key)) {
        index.set(key, new Map());
    }

    index.get(key).set(val.id, val);
}

export function arrayContains(x, y) {
    if (y.length > x.length) {
        return false;
    }

    for (let i = 0; i <= x.length - y.length; i++) {
        let match = true;

        for (let j = 0; j < y.length; j++) {
            if (x[i + j] !== y[j]) {
                match = false;
                break;
            }
        }

        if (match) {
            return true;
        }
    }

    return false;
}

export function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export function stringToColor(str, colors = Colors) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

export function hyperedgesFromArguments() {
    let hyperedges;
    if (Array.isArray(arguments[0])) {
        hyperedges = arguments[0];
    } else {
        hyperedges = Array.from(arguments);
    }

    if (!Array.isArray(hyperedges[0])) {
        hyperedges = [hyperedges]
    }

    return hyperedges;
}

export function verifyGraphData(nodes, links) {
    const nodeIDs = new Set(nodes.keys());

    for (const link of links.values()) {
        if (!nodeIDs.has(link.source)) {
            throw `Missing source ${link.source}`;
        } else if (!nodeIDs.has(link.target)) {
            throw `Missing target ${link.target}`;
        }
    }
}