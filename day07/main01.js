const R = require('ramda');
const U = require('./utils');

U.runWrapper(parse, run, {
    hideRaw: true,
    hideParsed: true
});

// --------------------------------------------

function parse(lines) {
    return lines.map(x => x.split(''));
}

// --------------------------------------------

function step(map, x, y, context = { count: 0 }) {
    if (x < 0 || x >= map[0].length || y < 0 || y >= map.length) {
        return;
    }
    
    const tile = map[y][x];

    if (tile === 'S') {
        step(map, x, y + 1, context);
    } else if (tile === '|') {
        // skip
    } else if (tile === '.') {
        map[y][x] = '|';
        step(map, x, y + 1, context);
    } else if (tile === '^') {
        context.count++;
        step(map, x - 1, y, context);
        step(map, x + 1, y, context);
    }

    // U.log(U.matrixToTile(map))

    return context;
}


// --------------------------------------------

function run(map) {
    const startX = map[0].findIndex(x => x === 'S');

    const result = step(map, startX, 0);


    return result.count;
}

