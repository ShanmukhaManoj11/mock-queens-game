const gridContainer = document.getElementById('grid');
let cellState = new Map();
Array.from({ length: 9 }, (_, i) => i).forEach(e => {
    cellState.set(e, new Set());
});

const colors = [
    'rgba(255, 81, 23, 0.5)',
    'rgba(23, 34, 77, 0.5)',
    'rgba(123, 67, 255, 0.5)',
    'rgba(234, 12, 200, 0.5)',
    'rgba(12, 127, 87, 0.5)',
    'rgba(22, 244, 124, 0.5)',
    'rgba(138, 90, 45, 0.5)',
    'rgba(177, 123, 28, 0.5)',
    'rgba(45, 12, 33, 0.5)'
]
let qsPerColor = new Map();
colors.forEach(clr => { qsPerColor.set(clr, 0); });

// Get random integer in range [min, max).
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function randomChoice(array) {
    if (array.length == 0) {
        return -1;
    }
    return array[getRandomInt(0, array.length)];
}

function getOneof(a, b) {
    return Math.random() >= 0.5 ? a : b;
}

function getNextProbableQPos(curGridConfig, occupiedCols, row) {
    if (curGridConfig.size === 0) {
        return getRandomInt(0, 9);
    }
    const exc = new Set([curGridConfig.get(row-1)-1, curGridConfig.get(row-1)+1]);
    var possibleQPos = [];
    for (let i = 0; i < 9; i++) {
        if (!occupiedCols.has(i) && !exc.has(i)) {
            possibleQPos.push(i);
        }
    }
    return randomChoice(possibleQPos);
}

const nbrs = [[-1, 0], [0, -1], [0, 1], [1, 0]];

// Create random grid configuration.
function createRandomGridConfig() {
    let qGrid = new Map();
    let occupiedCols = new Set();
    let qPos = 0;
    for (let i = 0; i < 9; i++) {
        qPos = getNextProbableQPos(qGrid, occupiedCols, i);
        if (qPos !== -1) {
            qGrid.set(i, qPos);
            occupiedCols.add(qPos);
        }
    }

    // Compute color map.
    let cGrid = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ''));
    let cGridVisited = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => false));
    let bfsQ = []
    for (const [r, c] of qGrid) {
        cGrid[r][c] = colors[r];
        bfsQ.push(r*9+c);
    }
    while (bfsQ.length > 0) {
        let n = bfsQ.length;
        for (let i = 0; i < n; i++) {
            let rc = bfsQ.shift();
            let r = Math.floor(rc/9);
            let c = rc%9;
            cGridVisited[r][c] = true;
            nbrs.forEach(nbr => {
                let r_ = r + nbr[0];
                let c_ = c + nbr[1];
                if (r_ >= 0 && r_ < 9 && c_ >=0 && c_ < 9 && !cGridVisited[r_][c_]) {
                    if (cGrid[r_][c_] === '') {
                        bfsQ.push(r_*9+c_);
                    }
                    cGrid[r_][c_] = cGrid[r_][c_] === '' ? cGrid[r][c] : getOneof(cGrid[r][c], cGrid[r_][c_]);
                }
            });
        }
    }

    return {
        'qGrid': qGrid,
        'cGrid': cGrid
    };
}

function validateGrid(i, j, clr) {
    if (!cellState.get(i).has(j)) {
        return true;
    }
    // more than 1 Q per color - invalid state
    if (qsPerColor.get(clr) > 1) {
        return false;
    }
    // more than 1 Q in same - invalid state
    if (cellState.get(i).size > 1) {
        return false;
    }
    for (let r = 0; r < 9; r++) {
        // Q in same column in a different row - invalid state
        if (r != i && cellState.get(i).has(j) && cellState.get(r).has(j)) {
            return false;
        }
        // another Q in X nbr - invalid state
        if (r != i && Math.abs(r - i) <= 1 && (cellState.get(r).has(j-1) || cellState.get(r).has(j+1))) {
            return false;
        }
    }
    return true;
}

function checkIfDone() {
    return false;
}

function createGrid(gridConfig) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.backgroundColor = gridConfig['cGrid'][i][j];
            cell.addEventListener('click', () => {
                cell.style.color = 'black'
                if (cell.textContent === '') {
                    cell.textContent = 'x';
                } else if (cell.textContent === 'x') {
                    cell.textContent = 'Q';
                    cellState.get(i).add(j);
                    qsPerColor.set(gridConfig['cGrid'][i][j], qsPerColor.get(gridConfig['cGrid'][i][j])+1);
                } else {
                    cell.textContent = '';
                    cellState.get(i).delete(j);
                    if (qsPerColor.get(gridConfig['cGrid'][i][j]) > 0) {
                        qsPerColor.set(gridConfig['cGrid'][i][j], qsPerColor.get(gridConfig['cGrid'][i][j])-1);
                    }
                }
                if (!validateGrid(i, j, gridConfig['cGrid'][i][j])) {
                    cell.style.color = 'red';
                }
                checkIfDone();
            });
            gridContainer.appendChild(cell);
        }
    }
}

let gridConfig = createRandomGridConfig();
while (gridConfig['qGrid'].size < 9) {
    gridConfig = createRandomGridConfig();
}
createGrid(gridConfig);
