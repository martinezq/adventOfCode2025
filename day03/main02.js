const R = require('ramda');
const U = require('./utils');

let cache = {};

U.runWrapper(parse, run, {
    hideRaw: true,
    hideParsed: false
});

// --------------------------------------------

function parse(lines) {
    return lines.map(x => x.split('').map(Number));
}

// --------------------------------------------

function findMaxJoltage(battery, start = 0, pos = 0) {
    const LEN = 12;

    if (start === 0 && pos === 0) {
        cache = {};
    }

    const cacheKey = `${start},${pos}`;
    const cacheVal = cache[cacheKey];

    if (cacheVal !== undefined) {
        return cacheVal;
    }
    

    let max = 0;

    const limit = battery.length - LEN + pos + 1;

    for (let i = start; i < limit; i++) {
        const d = battery[i];
        const added = d * Math.pow(10, LEN - pos - 1);

        let x = 0;

        if (pos + 1 < LEN) {
            x = findMaxJoltage(battery, i + 1, pos + 1);
        }

        const number = added + x;

        // U.log(battery, 'testing', d, 'pos', pos, 'number', number);

        if (number > max) {
            max = number;
        }

        cache[cacheKey] = max;
        
    }

    if (start === 0 && pos === 0) {
        U.log(battery, max);
    }

    return max;
}

// --------------------------------------------

function run(data) {

    const joltages = data.map(b => findMaxJoltage(b));

    const result = R.reduce(R.add, 0, joltages);

    return result;
}

