const fs = require('fs');
const R = require('ramda');
const A = require('../lib/astar');

function runWrapper(parseFunc, mainFunc, opts) {

    opts = opts || {
        hideRaw: false,
        hideParsed: false
    }

    const file = fs.readFileSync(`${__dirname}/input.txt`).toString();
    const lines = file.split('\r\n');

    log('------- INPUT RAW --------');
    if (!opts.hideRaw === true) {
        logf(lines);
    } else {
        log('<hidden>');
    }

    const parsed = parseFunc ? parseFunc(lines) : lines;

    log('--------- PARSED ---------');
    if (!opts.hideParsed === true) {
        logf(parsed);
    } else {
        log('<hidden>');
    }

    log('\n---------- RUN -----------');
    const result = mainFunc(parsed);
    log('-------- RUN END ---------\n',);

    log('--------- RESULT ---------');
    log(result);
}

function parse(str, regex, keys) {
    const a = str
        .match(regex)
        .slice(1)
        .map(x => Number(x) || x)

    if (keys) {
        let result = {};
        keys.forEach((k, i) => result[k] = a[i]);
        return result
    }

    return a;
}

/**
 * Log without formatting
 * @param  {...any} x 
 */
function log(...x) {
    console.log(...x.
        map(i => {
            if (Array.isArray(i)) return JSON.stringify(i);
            if (typeof i === 'object') return JSON.stringify(i);
            return i;
        })
    );
}

/**
 * Log using JSON formatting
 * @param  {...any} x
 */
function logf(...x) {
    const isSimpleType = (x) => !Array.isArray(x) && typeof x !== 'object';

    const replacer = (key, value) => {
        if (Array.isArray(value) && !Boolean(value.find(x => !isSimpleType(x)))) {
            return 'Array: [' + value.toString() + ']';
        } else {
            return value;
        }
    };

    console.log(...x
        .map(i => {
            if (isSimpleType(i)) return i;
            return JSON.stringify(i, replacer, 2);
        })
    );
}

/**
 * Log a matrix
 * @param {*} matrix 
 */
function logm(matrix) {
    if (matrix && Array.isArray(matrix)) {
        matrix.forEach(row => console.log(row));
    }

}

/**
 * Map all elements of 2D matrix
 * @param {*} matrix 
 * @param {*} func
 * @returns 
 */
function mapMatrix(matrix, func) {
    return matrix.map((row, i) => row.map((v, j) => func(v, i, j)));
}

/**
 * Flatten matrix and filter using function
 * @param {*} matrix 
 * @param {*} func 
 * @returns 
 */
function filterMatrix(matrix, func) {
    return matrix.flat().filter(func);
}

/**
 * Finds element in matrix that func returns true for
 * @param {*} matrix 
 * @param {*} func 
 * @returns [row, col]
 */
function findInMatrix(matrix, func) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (func(matrix[i][j], i, j)) return [i, j];
        }
    }
}

/**
 * Finds all elements in matrix that func returns true for
 * @param {*} matrix 
 * @param {*} func 
 * @returns [row, col]
 */
function findAllInMatrix(matrix, func) {
    let result = [];
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (func(matrix[i][j], i, j)) result.push([i, j]);
        }
    }
    return result;
}

/**
 * 
 * @param {*} x1 
 * @param {*} y1 
 * @param {*} x2 
 * @param {*} y2 
 * @returns 
 */
function createLinePointsBetween(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    let line = [];

    if (dx === 0) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            line.push([x1, y]);
        }
    } else if (dy === 0) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            line.push([x, y1]);
        }
    } else {
        const m = dy / dx;
        const b = y1 - m * x1;

        if (m < 1) {
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                const y = m * x + b;
                line.push([Math.round(x), Math.round(y)]);
            }
        } else {
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                const x = (y - b) / m;
                line.push([Math.round(x), Math.round(y)]);
            }
        }
    }
    
    return R.uniq(line);
}

/**
 * 
 * @param {*} points 
 * @param {*} defValue 
 * @param {*} f 
 * @returns 
 */
function createMatrixFromPoints(points, defValue, f) {
    f = f || (() => 1);

    const width = R.last(points.map(x => x[0]).sort((x, y) => x-y)) + 1;
    const height = R.last(points.map(x => x[1]).sort((x, y) => x-y)) + 1;

    const m = R.times(r => {
        let line = Array.from({ length: width }, () => defValue);
        points.filter(x => x[1] === r).forEach(x => line[x[0]] = f(x[0], r))
        return line;
    }, height);

    return m;
}

function calculateMatrixWindow(matrix, margin, blankChar) {
    blankChar = blankChar || '.';
    margin = margin || 0;

    const transposedMatrix = R.transpose(matrix);

    const firstRowIndex = transposedMatrix.findIndex(l => l.find(x => x !== blankChar));
    const lastRowIndex = transposedMatrix.length - R.reverse(transposedMatrix).findIndex(l => l.find(x => x !== blankChar));
    const firstLineIndex = matrix.findIndex(l => l.find(x => x !== blankChar));
    const lastLineIndex = matrix.length - R.reverse(matrix).findIndex(l => l.find(x => x !== blankChar));

    return {
        x1: firstRowIndex - margin,
        y1: firstLineIndex - margin,
        x2: lastRowIndex + margin,
        y2: lastLineIndex + margin
    };
}

/**
 * Convert matrix to a tile string
 * @param {*} matrix
 * @param {*} opts
 * @returns 
 * 
 * @example
 ```
    const opts = { window: U.calculateMatrixWindow(matrix, 1) };
 ```
 */
function matrixToTile(matrix, opts) {
    const maxLength = R.reduce(R.max, 0, matrix.map(x => x.length));
    const window = {
        x1: opts?.window?.x1 || 0,
        y1: opts?.window?.y1 || 0,
        x2: opts?.window?.x2 || (maxLength || 0),
        y2: opts?.window?.y2 || matrix.length
    };

    const lines = R.take(window.y2 - window.y1, R.drop(window.y1, matrix));

    let str = '';

    lines.forEach(r => {
        const line = R.take(window.x2 - window.x1, R.drop(window.x1, r));
        const lineStr = line.join('') + '\n';
        str += lineStr;
    });

    return str;
}

const minA = (x) => x.reduce((p, c) => Math.min(p, c), Number.POSITIVE_INFINITY);
const maxA = (x) => x.reduce((p, c) => Math.max(p, c), Number.NEGATIVE_INFINITY);
const sumA = (x) => R.reduce(R.add, 0, x);

const minIndexA = (x) => x.reduce((p, c, i) => c < x[p] ? i : p, 0);
const maxIndexA = (x) => x.reduce((p, c, i) => c > x[p] ? i : p, 0);

const normalize = (x) => x > 0 ? 1 : (x < 0 ? -1 : 0);

const sortByNumber = R.sortBy(Number);

function splitStringByLength(str, len) {
    let result = [];
    let j = 0;
    let buf = [];

    for (let i=0; i<str.length; i++) {
        buf[j++] = str[i];
        if (j == len) {
            result.push(buf.join(''));
            j = 0;
        }
    }

    return result;
}

/** 
 * Decimal to binary string
 *   @example 
 *      dec2bin(8)     -> '1011'
 *      dec2bin(8, 36) -> '000000000000000000000000000000001011'
**/
function dec2bin(x, length) {
    return (x >>> 0).toString(2).padStart(length, '0');
}

/**  
 * Binary string to decimal
 * @example
 *      bin2dec('1011') -> 8
**/ 
function bin2dec(x) {
    return parseInt(x, 2);
}

/*

*/

/**
 * Process input
 * @param {*} rules [object]
 * @param {*} context [object]
 * @param {*} input [string]
 * 
 * @example
 * ```
 *  const rules = {
 *   '\\$ (cd) (.*)':    ([cmd, arg], context) => console.log('CMD', cmd, arg),
 *   '\\$ (ls)':         ([cmd], context) => console.log('CMD', cmd),
 *   '([0-9]+) (.*)':    ([size, name], context) => console.log('FILE', size, name),
 *   'dir (.*)':         ([name], context) => console.log('DIR', name)
 * }
 * ```
 */
function processUsingRulesInternal(rules, context, input) {
    let done = false;
    R.keys(rules).forEach(key => {
        if (done) return; // ignore

        const re = RegExp(key);
        const parsed = input.match(re);
        
        if (parsed) {
            const res = rules[key](R.tail(parsed), context);
            done = true;
            return res;
        } 
    });

    if (!done) {
        log(' ---> WARNING: No rule found to match: ' + input + ' <---');
    }
}

const processUsingRules = R.curry(processUsingRulesInternal);

// ----------------------------------------------------------------------------

/**
 * 
 * @param {*} grid  - 0 - wall, other - weight
 * @param {*} start - [0, 0]
 * @param {*} end   - [4, 4]
 * @param {*} options - additional options: acceptNeighbor: (candidateNode, fromNode) => boolean
 * @returns path or [] if path cannot be found
 * 
 * @example
 * ```
    const grid =
        [0, 0, 0, 0, 0]
        [0, 1, 2, 3, 0],
        [0, 2, 3, 2, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0]                
    ];

    const start = [0, 0];
    const end = [4, 4];

    const path = U.findPath(grid, start, end, {
        acceptNeighbor: (n, s) => n.weight - s.weight <= 1 // move only if weight difference is <= 1
    });

    console.log('Length', R.length(path));
    console.log('Total cost', R.last(path).g);
 
 * ```
 */
function findPath(grid, start, end, options = {}) {
    const graph = new A.Graph(grid);
	const startNode = graph.grid[start[0]][start[1]];
	const endNode = graph.grid[end[0]][end[1]];

    if (options.acceptNeighbor) {
        const neighborsInternal = graph.neighbors;

        graph.neighbors = function(node) {
            const res = neighborsInternal.call(this, node);
            return res.filter(x => options.acceptNeighbor(x, node));
        }
    }

    const result = A.astar.search(graph, startNode, endNode, options);

    return result;
}

// ----------------------------------------------------------------------------

/**
 * Calculate Manhattan distance between two points
 * @param {*} p1 - [0, 0]
 * @param {*} p2 - [100, 200]
 * @returns 
 */
function distanceManhattan(p1, p2) {
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
}

/**
 * Calculate crossing point of two segments
 * @param {*} segment1 - [[0, 0], [100, 200]]
 * @param {*} segment2 = [[40, 50], [200, 300]
 * @returns [x, y] - values are rounded to integer
 */
function crossingPoint(segment1, segment2) {
    const [x1, y1] = segment1[0];
    const [x2, y2] = segment1[1];
    const [x3, y3] = segment2[0];
    const [x4, y4] = segment2[1];

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denominator === 0) {
        return;
    }

    const x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denominator;
    const y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denominator;

    if (x < Math.min(x1, x2) || x > Math.max(x1, x2) || x < Math.min(x3, x4) || x > Math.max(x3, x4)) {
        return;
    }

    return [Math.round(x), Math.round(y)];
}

// ----------------------------------------------------------------------------

module.exports = {
    runWrapper,
    parse,
    log, logf, logm,
    minA, maxA, sortByNumber,
    minIndexA, maxIndexA,
    sumA,
    normalize,
    mapMatrix, filterMatrix,findInMatrix, findAllInMatrix,
    createLinePointsBetween, createMatrixFromPoints, 
    calculateMatrixWindow, matrixToTile,
    splitStringByLength,
    dec2bin, bin2dec,
    processUsingRules,
    findPath,
    distanceManhattan,
    crossingPoint
}