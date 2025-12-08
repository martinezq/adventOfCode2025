const R = require('ramda');
const U = require('./utils');

let cache = {};

U.runWrapper(parse, run, {
    hideRaw: true,
    hideParsed: true
});

// --------------------------------------------

function parse(lines) {
    return lines.map(x => x.split(''));
}

// --------------------------------------------

function step(map, x, y, count = 0) {
    const key = `${x},${y}`;
    const cached = cache[key];

    if (cached !== undefined) {
        return cached;
    }

    if (x < 0 || x >= map[0].length) {
        return 0;
    }

    if (y >= map.length) {
        return count + 1;
    }
    
    const tile = map[y][x];
    let newCount = count;

    if (tile === 'S') {
        newCount = step(map, x, y + 1, count);
    } else if (tile === '.' ) {
        map[y][x] = '|';
        // U.log(U.matrixToTile(map))
        newCount = step(map, x, y + 1, count);
    } else if (tile === '|') {
        newCount = step(map, x, y + 1, count);
    } else if (tile === '^') {
        const x1 = step(map, x - 1, y, count);
        const x2 = step(map, x + 1, y, count);

        newCount = x1 + x2;
    }    

    cache[key] = newCount;

    return newCount;
}


// --------------------------------------------

function run(map) {
    const startX = map[0].findIndex(x => x === 'S');

    const result = step(map, startX, 0);


    return result;
}

