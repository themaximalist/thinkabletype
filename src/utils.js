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

export function createIndex(items) {
    const index = new Map();
    for (const item of items) { index.set(item.id, item) }
    return index;
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

export function restoreData(data, old) {
    const index = createIndex(old.nodes.values());
    for (const node of data.nodes.values()) {
        const old = index.get(node.id);
        if (!old) continue;
        if (typeof old.x === 'number') node.x = old.x;
        if (typeof old.y === 'number') node.y = old.y;
        if (typeof old.z === 'number') node.z = old.z;
        if (typeof old.vx === 'number') node.vx = old.vx;
        if (typeof old.vy === 'number') node.vy = old.vy;
        if (typeof old.vz === 'number') node.vz = old.vz;
    }
}