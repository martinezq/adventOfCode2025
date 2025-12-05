const R = require('ramda');
const U = require('./utils');

U.runWrapper(parse, run, {
    hideRaw: true,
    hideParsed: false
});

// --------------------------------------------

function parse(lines) {
    const parts = R.splitWhen(x => x === '', lines);
    
    const ranges = parts[0].map(x => {
        const bounds = x.split('-').map(Number);
        return { min: bounds[0], max: bounds[1] };
    });

    const numbers = R.drop(1, parts[1]).map(Number);
    
    return {
        ranges,
        numbers
    }
}

// --------------------------------------------

function inRange(num, range) {
    return num >= range.min && num <= range.max;
}

function inAnyRange(num, ranges) {
    return ranges.some(range => inRange(num, range));
}

// --------------------------------------------

// Reduce overlapping ranges
function reducteRanges(ranges) {
    const sorted = R.sortBy(R.prop('min'), ranges);
    const reduced = [];
    for (const range of sorted) {
        const last = R.last(reduced);
        if (last && range.min <= last.max) {
            last.max = Math.max(last.max, range.max);
        } else {
            reduced.push({ ...range });
        }
    }
    return reduced;
}

// --------------------------------------------

function run({ ranges, numbers}) {

    const reducedRanges = reducteRanges(ranges);
    const reducedRangesLengths = reducedRanges.map(r => r.max - r.min + 1);
    
    const result = R.reduce(R.add, 0, reducedRangesLengths);

    return result;
}

