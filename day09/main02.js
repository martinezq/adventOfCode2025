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

function calcArea(p1, p2) {
    // area in 2d space (ignoring z)
    return (Math.abs(p1[0] - p2[0]) + 1) * (Math.abs(p1[1] - p2[1]) + 1);
}

// --------------------------------------------

function indexRedPoints(points) {
    let index = {};

    points.forEach(p => {
        const key = `${p}`;
        index[key] = true;
    });

    return index;
}

// --------------------------------------------

function calcGrid(points) {
    const xs = R.uniq(points.map(p => p[0]).sort((a, b) => a - b));
    const ys = R.uniq(points.map(p => p[1]).sort((a, b) => a - b));

    const mapping = [];
    const grid = [];

    for (let j = 0; j < ys.length; j++) {
        var row = [];
        var mrow = [];
        const y = ys[j];

        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            const p = [x, y];
            const inside = pointInPolygon(p, points);

            const p2 = [xs[i + 1], ys[j + 1]];
            const area = calcArea(p, p2);

            row.push(inside ? area : 0);
            mrow.push([x, y])

        }

        grid.push(row);
        mapping.push(mrow);
    }

    U.log("mapping", mapping);

    return { grid, mapping };
}

// --------------------------------------------

function pointInPolygon(point, polygon) {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];

        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// --------------------------------------------

function search(grid, mapping, index) {
    let bestArea = 0;
    
    for (let j = 0; j < grid.length; j++) {
        U.log(j);
        for (let i = 0; i < grid[j].length; i++) {
            const area = grid[j][i];
        
            if (area === 0) continue

            const p1 = mapping[j][i];
            const key1 = `${p1}`;

            let bestLocalArea = 0;

            let xLimit = grid[0].length - 1;

            for (let h = 0; j + h < grid.length - 1; h++) {
                
                for (let w = 0; i + w < xLimit; w++) {
                    if (grid[j + h][i + w] === 0) {
                        xLimit = i + w - 1;
                        break;
                    }
                    
                    const p2 = mapping[j + h + 1][i + w + 1];
                    
                    const p3 = [p2[0], p1[1]];
                    const p4 = [p1[0], p2[1]];

                    const key2 = `${p2}`;
                    const key3 = `${p3}`;
                    const key4 = `${p4}`;
                                
                    if ((index[key1] && index[key2]) || (index[key3] && index[key4])) {
                        const localArea = calcArea(p1, p2);

                        if (localArea > bestLocalArea) {
                            bestLocalArea = localArea;
                            // U.log(` New best local area ${bestLocalArea} at (${p1}) size (${w+1}x${h+1})`);
                        }
                    }
                }
            }

            if (bestLocalArea > bestArea) {
                bestArea = bestLocalArea;
            }
        }
    }

    return bestArea;
}

// --------------------------------------------

function run(data) {

    const index = indexRedPoints(data);
    const { grid, mapping } = calcGrid(data);

    U.log(grid);
    U.log(U.matrixToTile(grid));

    const result = search(grid, mapping, index);

    return result;
}
