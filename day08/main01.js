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

function distance(a, b) {
    // distance in 3d space
    return Math.sqrt(
        (a[0] - b[0]) ** 2 +
        (a[1] - b[1]) ** 2 +
        (a[2] - b[2]) ** 2
    );
}

// --------------------------------------------

function calcDistanceTable(points) {
    const table = [];
    for (let i = 0; i < points.length; i++) {
        table[i] = [];
        for (let j = 0; j < points.length; j++) {
            table[i][j] = distance(points[i], points[j]);
        }
    }
    
    return table;
}
// --------------------------------------------

function calcClosestPoints(distanceTable) {
    const closestPoints = [];
    const distances = [];
    for (let i = 0; i < distanceTable.length; i++) {
        let minDistance = Infinity;
        let closestPoint = -1;
        for (let j = 0; j < distanceTable[i].length; j++) {
            if (i !== j && distanceTable[i][j] < minDistance) {
                minDistance = distanceTable[i][j];
                closestPoint = j;
            }
        }
        closestPoints[i] = closestPoint;
        distances[i] = minDistance;
    }
    return {
        points: closestPoints,
        distances
    };
}

// --------------------------------------------

// pairs from closest to the most distant
function calcPairs(points, distanceTable) {
    const pairs = [];
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            pairs.push({
                pair: [i, j],
                distance: distanceTable[i][j]
            });
        }
    }

    pairs.sort((a, b) => a.distance - b.distance);

    return pairs.map(x => x.pair);
}

// --------------------------------------------

function calcCircuits(pairs) {
    let cache = [];
    let circuits = [];

    pairs.forEach((pair, i) => {

        if (i % 1000 === 0) U.log(i);

        const [a, b] = pair;
        let found = false;  
        
        let circuitA = cache[a];;
        let circuitB = cache[b];

        if (circuitA === undefined && circuitB === undefined) {
            // new circuit
            circuits.push([a, b]);
            cache[a] = circuits.length - 1;
            cache[b] = circuits.length - 1;
            found = true;

            return;
        } 

        if (circuitA !== undefined && circuitB === undefined) {
            // add b to circuitA
            circuits[circuitA].push(b);
            cache[b] = circuitA;
            found = true;
            return;
        }

        if (circuitA === undefined && circuitB !== undefined) {
            // add a to circuitB
            circuits[circuitB].push(a);
            cache[a] = circuitB;
            found = true;
            return;
        }

        if (circuitA !== undefined && circuitB !== undefined && circuitA !== circuitB) {
            // merge circuits
            const mergedCircuit = circuits[circuitA].concat(circuits[circuitB]);
            circuits[circuitA] = mergedCircuit;
            circuits[circuitB] = [];    
            mergedCircuit.forEach(x => {
                cache[x] = circuitA;
            });
            found = true;
            return;
        }
        
    });

    circuits = R.sortBy(x => -x.length, circuits);    

    return circuits;
}

// --------------------------------------------

function run(data) {

    const distanceTable = calcDistanceTable(data);
    // U.log("distanceTable", distanceTable);
    
    const pairs = calcPairs(data, distanceTable);
    // U.log("pairs", pairs);

    // const limit = 10;
    // const limit = pairs.length - 1;
    const limit = 1000;

    const selectedPairs = R.take(limit, pairs);
    U.log("selectedPairs", selectedPairs);
    
    const circuits = calcCircuits(selectedPairs);
    U.log("circuits", circuits);

    const result = R.take(3, circuits).map(R.length).reduce(R.multiply, 1);

    return result;
}
