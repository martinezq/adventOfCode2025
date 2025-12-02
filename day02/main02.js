const R = require('ramda');
const U = require('./utils');

U.runWrapper(parse, run, {
    hideRaw: true,
    hideParsed: false
});

// --------------------------------------------

function parse(lines) {
    const line = lines.join('').replace('\n', '');
    const ranges = line.split(',');

    return ranges.map(range => range.split('-').map(Number));
}

// --------------------------------------------

function rangeInvalid(range) {
    let result = [];

    for (let i = range[0]; i <= range[1]; i++) {
        if (idInvalid(i)) result.push(i);
    }

    return result;
}

function idInvalid(id) {
    const str = String(id);

    if (str.length < 2) return false;

    for (let i = 1; i < str.length / 2 + 1; i++) {
        if (str.length % i !== 0) continue;

        const n0 = Number(str.slice(0, i));

        let invalid = true

        for (let r = 1; r < str.length / i; r++) {
            const s = r * i;
            const e = r * i + i;
            const nx = Number(str.slice(s, e));
            // U.log(id, 'n0', n0, 'rep', r, 'nx', nx);

            if (n0 != nx) {
                invalid = false
                break;
            }
        }

        if (invalid) {
            return true;
        }

    }
    
    return false;
}

// --------------------------------------------

function run(data) {

    const result = R.flatten(data.map(rangeInvalid));

    U.log(result);

    return R.reduce(R.add, 0, result);
}

// 45814076275 too high