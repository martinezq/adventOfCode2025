const R = require('ramda');
const U = require('./utils');

U.runWrapper(parse, run, {
    hideRaw: true,
    hideParsed: false
});

// --------------------------------------------

function parse(lines) {
    return lines.map(x => x.split('').map(Number));
}

// --------------------------------------------

function findMaxJoltage(battery) {
    let max = 0;
    
    for (let i = 0; i < battery.length - 1; i++) {
        for (let j = i + 1; j < battery.length; j++) {
                const d1 = battery[i];
                const d2 = battery[j];

                const number =  Number(d1 + "" + d2);

                if (number > max) {
                    max = number;
                }
        }
    }

    U.log(battery, max);

    return max;
}

// --------------------------------------------

function run(data) {

    const joltages = data.map(findMaxJoltage);

    const result = R.reduce(R.add, 0, joltages);

    return result;
}

