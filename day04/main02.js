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

            if (count > 3) return false;
        }
    }

    return true
}

// --------------------------------------------

function removeRolls(map) {
    let result = 0;

    let list = [];

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] !== '@') continue;

            const can = canAccess(map, x, y);
            if (can) {
                list.push([x, y]);
                result++;
            }
        }
    }

    list.forEach(([x, y]) => map[y][x] = '.');

    return result;
}

// --------------------------------------------

function run(map) {

    let result = 0;
    let count = 0;
    
    while ((count = removeRolls(map)) > 0) {
         U.log('removed', count);
        result += count;
    }

    


    return result;
}

