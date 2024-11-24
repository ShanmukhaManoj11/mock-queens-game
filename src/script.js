const gridContainer = document.getElementById('grid');

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
    let bfsQ = []
    for (const [r, c] of qGrid) {
        cGrid[r][c] = colors[r];
        bfsQ.push(r*9+c);
    }
    // while (bfsQ.length > 0) {
        
    // }

    return {
        'qGrid': qGrid,
        'cGrid': cGrid
    };
}

function validateGrid() {
    return true;
}

function createGrid(gridConfig) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.backgroundColor = gridConfig['cGrid'][i][j];
            if (j === gridConfig['qGrid'].get(i)) {
                cell.textContent = 'Q';
            }
            cell.addEventListener('click', () => {
                cell.textContent = cell.textContent === '' ? 'x' : (cell.textContent === 'x' ? 'Q': '');
                // cell.style.backgroundColor = cell.style.backgroundColor === 'lightblue' ? '#fff' : 'lightblue';
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