const R = require('ramda');
const U = require('./utils');

U.runWrapper(parse, run, {
    hideRaw: true,
    hideParsed: false
});

// --------------------------------------------

function parse(lines) {
    return lines.map(x => x.split(''));
}

// --------------------------------------------

function canAccess(map, x, y) {
    let count = 0;
    for (let j = Math.max(y - 1, 0); j < Math.min(y + 2, map.length); j++) {
        for (let i = Math.max(x - 1, 0); i < Math.min(x + 2, map[j].length); i++) {
            if (i === x & j === y) continue;
            if (map[j][i] === '@') count++;
        }
    }

    return count < 4;
}

// --------------------------------------------

function run(map) {

    let result = 0;

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] !== '@') continue;
            
            const can = canAccess(map, x, y);
            if (can) {
                // data[y][x] = 'x';
                result++;
            }
        }
    }

    return result;
}

