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
