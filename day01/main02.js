const R = require('ramda');
const U = require('./utils');

U.runWrapper(parse, run, {
    hideRaw: true,
    hideParsed: false
});

// --------------------------------------------

function parse(lines) {
    return lines.map(x => (x[0] === 'R' ? 1 : -1) * Number(R.drop(1, x.split('')).join('')));
}

// --------------------------------------------

function run(data) {

    let pos = 50;
    let count = 0;
    
    data.forEach(cmd => {
        
        const prevPos = pos;
        
        while (cmd > 0) {
            pos++;
            cmd--;

            if (pos % 100 === 0) count++;
        }

        while (cmd < 0) {
            pos--;
            cmd++;

            if (pos % 100 === 0) count++;
        }


        U.log(prevPos, pos, cmd, count);
    });

    return count;
}