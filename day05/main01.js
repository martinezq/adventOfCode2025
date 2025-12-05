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

function run({ ranges, numbers}) {

    const fresh = numbers.filter(num => inAnyRange(num, ranges));

    const result = fresh.length;

    return result;
}