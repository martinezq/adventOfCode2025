const R = require('ramda');
const U = require('./utils');

U.runWrapper(parse, run, {
    hideRaw: true,
    hideParsed: false
});

// --------------------------------------------

function parse(lines) {
    return lines.map(x => ({
        dir: x[0],
        steps: Number(R.drop(1, x.split('')).join(''))
    }));
}

// --------------------------------------------

function run(data) {

    let pos = 50;
    let count = 0;
    
    data.forEach(cmd => {
        if (cmd.dir === 'L') {
            pos = ((pos - cmd.steps) + 100) % 100;
        } else {
            pos = (pos + cmd.steps) % 100;
        }

        U.log(cmd, pos);

        if (pos === 0) count++;

    });

    return count;
}

