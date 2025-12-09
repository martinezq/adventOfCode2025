const R = require('ramda');
const U = require('./utils');

U.runWrapper(parse, run, {
    hideRaw: true,
    hideParsed: false
});

// --------------------------------------------

function parse(lines) {
    return lines.map(x => x.split(',').map(Number));
}

// --------------------------------------------

function area(p1, p2) {
    // area in 2d space (ignoring z)
    return (Math.abs(p1[0] - p2[0]) + 1) * (Math.abs(p1[1] - p2[1]) + 1);
}

// --------------------------------------------

function calcAreaTable(points) {
    const table = [];
    for (let i = 0; i < points.length; i++) {
        table[i] = [];
        for (let j = 0; j < points.length; j++) {
            table[i][j] = area(points[i], points[j]);
        }
    }
    
    return table;
}

// --------------------------------------------

function run(data) {

    const areaTable = calcAreaTable(data);
    U.log("areaTable", areaTable);

    const result = R.flatten(areaTable).reduce(R.max, 0);

    return result;
}

