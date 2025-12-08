const R = require('ramda');
const U = require('./utils');

U.runWrapper(parse, run, {
    hideRaw: true,
    hideParsed: false
});

// --------------------------------------------

function parse(lines) {

    const lastRow = lines[lines.length - 1];
    const columnIndices = [];

    for (let i = 0; i < lastRow.length; i++) {
        if (lastRow[i] === '+' || lastRow[i] === '*') {
            columnIndices.push(i);
        }
    }

    columnIndices.push(lastRow.length + 1);

    let operations = [];

    for (let cc = 0; cc < columnIndices.length - 1; cc++) {

        let operands = [];

        for (let c = columnIndices[cc]; c < columnIndices[cc + 1] - 1; c++) {

            let numStr = '';
            for (let r = 0; r < lines.length - 1; r++) {
                numStr += lines[r][c] || ' ';
            }
            let num = Number(numStr.trim());

            U.log(c, numStr, num);

            operands.push(num);
        }

        operations.push({
            operands,
            operator: lines[lines.length - 1][columnIndices[cc]]
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

    return results.reduce(R.add, 0);
}

