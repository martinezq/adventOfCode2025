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
    
    if (str.length % 2 === 1) return false;

    const parts = [
        str.slice(0, str.length / 2),
        str.slice(str.length / 2)
    ];
        
    return Number(parts[0]) === Number(parts[1]);
}

// --------------------------------------------

function run(data) {

    const result = R.flatten(data.map(rangeInvalid));

    U.log(result);

    return R.reduce(R.add, 0, result);
}

