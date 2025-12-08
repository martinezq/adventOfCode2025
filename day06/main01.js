const R = require('ramda');
const U = require('./utils');

U.runWrapper(parse, run, {
    hideRaw: true,
    hideParsed: false
});

// --------------------------------------------

function parse(lines) {
    const rows = lines.map(x => x.split(/\s+/).filter(x => x.length > 0));

    let operations = [];

    for (let c = 0; c < rows[0].length; c++) {
        let operands = [];
        for (let r = 0; r < rows.length - 1; r++) {
            operands.push(Number(rows[r][c]));
        }

        operations.push({
            operands,
            operator: rows[rows.length - 1][c]
        });
    }

    return operations;
}


// --------------------------------------------

function run(operations) {

    const results = operations.map(op => op.operands.reduce((a, b) => {
        switch (op.operator) {
            case '+': return a + b;
            case '*': return a * b;
        }
    }, op.operator === '+' ? 0 : 1));

    // const result = data.length;

    return results.reduce(R.add, 0);
}

