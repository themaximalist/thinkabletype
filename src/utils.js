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