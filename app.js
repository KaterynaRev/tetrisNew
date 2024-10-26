
//визначеня кількості колонок в одному ряді
const PLAYFIELD_COLUMNS = 10;
//визначеня кількості рядків
const PLAYFIELD_ROWS = 20;
let playField;
let isPaused = false;
let timedId;
let cells;
let isGameOver = false;
const messageEnd = document.getElementById('message');
messageEnd.style.display = 'none';
const startBtn = document.getElementById('startBtn');
let scoreUser = document.getElementById('scoreUser');
let score = 0;
let scoreMainDiv = document.getElementById('scoreMain');
let scoreMain = 0;

const PLAYFIELD_COLUMNS_NEXT = 4;
const PLAYFIELD_ROWS_NEXT = 4;
let nextTetromino = {
    name: '',
    matrix: [],
}
let playFieldNextFigure;
let cellsNextFigure;

const TETROMINO_NAMES = [
    'O', 'I', 'S', 'Z', 'Zz', 'L', 'J', 'T', 'V', 'D'
]

const TETROMINOES = {
    'O': [
        [1, 1],
        [1, 1]
    ],
    'I': [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    'S': [
        [0, 1, 1],
        [0, 1, 0],
        [1, 1, 0]
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    'Zz': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'J': [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0]
    ],
    'T': [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0]
    ],
    'V': [
        [1, 1, 0],
        [0, 1, 0],
        [0, 0, 0]
    ],
    'D': [
        [1]
    ]
}

let tetromino = {
    name: '',
    matrix: [],
    column: 0,
    row: 0,
}

function randomFigure(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

// keyboard
function startGame() {
    startBtn.addEventListener('click', function () {
        document.querySelector('.tetris').innerHTML = '';
        messageEnd.style.display = 'none';
        updateMainScore();
        init();
    });
}

//клікаємо на клавіатуру і воно буде запускатись
document.addEventListener('keydown', onKeyDown)

function onKeyDown(event) {
    if (event.key == 'Escape') {
        togglePaused();
    }
    if (!isPaused) {
        if (event.key == 'ArrowUp') {
            rotate();
        }
        if (event.key == 'Shift') {
            dropTetrominoDown();
        }
        if (event.key == 'ArrowLeft') {
            moveTetrominoLeft();
        }
        if (event.key == 'ArrowRight') {
            moveTetrominoRight()
        }
        if (event.key == 'ArrowDown') {
            moveTetrominoDown();
        }
        //інакше при кліку починалось заново без натискання старт
        if (event.code === 'Space') {
            event.preventDefault();
        } if (event.code === 'Enter') {
            event.preventDefault();
        }
    }
    draw();
}

function moveDown() {
    moveTetrominoDown();
    draw();
    stopAutoMoveDown();
    startAutoMoveDown();
}

function startAutoMoveDown() {
    if (score < 100) {
        timedId = setTimeout(() => requestAnimationFrame(moveDown), 900);
    }
    if (score >= 100 && score <= 200) {
        timedId = setTimeout(() => requestAnimationFrame(moveDown), 800);
    }
    if (score >= 201 && score <= 300) {
        timedId = setTimeout(() => requestAnimationFrame(moveDown), 600);
    }
    if (score >= 301 && score <= 400) {
        timedId = setTimeout(() => requestAnimationFrame(moveDown), 500);
    }
    if (score >= 401 && score <= 500) {
        timedId = setTimeout(() => requestAnimationFrame(moveDown), 400);
    }
}

function togglePaused() {
    if (isPaused) {
        startAutoMoveDown();
    } else {
        stopAutoMoveDown();
    }
    isPaused = !isPaused;
}

function stopAutoMoveDown() {
    clearTimeout(timedId);
    timedId = null;
}

function moveTetrominoDown() {
    tetromino.row += 1;
    if (!isValid()) {
        tetromino.row -= 1;
        //коли торкнулись дна запускаємо нову фігуру
        placeTetromino();
    }
}

function moveTetrominoLeft() {
    tetromino.column -= 1;
    if (!isValid()) {
        tetromino.column += 1;
    }
}
function moveTetrominoRight() {
    tetromino.column += 1;
    if (!isValid()) {
        tetromino.column -= 1;
    }
}

function draw() {
    cells.forEach(el => el.removeAttribute('class'))
    drawPlayField();
    drawTetramino();
}

function dropTetrominoDown() {
    while (isValid()) {
        tetromino.row++;
    }
    tetromino.row--;
}

//rotate
//код для прикладу обертання фігури
// let showRotated = [
//     [1, 2, 3],
//     [4, 5, 6],
//     [7, 8, 9]
// ]

function rotate() {
    rotateTetromino();
    draw();
}

function rotateTetromino() {
    const oldMatrix = tetromino.matrix;
    const rotatedMatrix = rotateMatrix(tetromino.matrix);
    // showRotated = rotateMatrix(showRotated); //код для прикладу обертання фігури
    tetromino.matrix = rotatedMatrix;
    if (!isValid()) {
        tetromino.matrix = oldMatrix;
    }
}

function rotateMatrix(matrixTetromino) {
    const N = matrixTetromino.length;
    //на основі старого створити новий
    const rorateMatrix = [];
    for (let i = 0; i < N; i++) {
        rorateMatrix[i] = [];
        for (let j = 0; j < N; j++) {
            rorateMatrix[i][j] = matrixTetromino[N - j - 1][i];
        }
    }
    return rorateMatrix;
}

//Collosions
function isValid() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (isOutSideOfGameBoard(row, column)) {
                return false;
            }
            if (hasCollosions(row, column)) {
                return false;
            }
        }
    }
    return true;
}

function isOutSideOfTopGameBoard(row) {
    return tetromino.row + row < 0;
}

function isOutSideOfGameBoard(row, column) {
    return tetromino.matrix[row][column] &&
        (tetromino.row + row >= PLAYFIELD_ROWS
            || tetromino.column + column < 0
            || tetromino.column + column >= PLAYFIELD_COLUMNS)
}

function hasCollosions(row, column) {
    return tetromino.matrix[row][column] && playField[tetromino.row + row]?.[tetromino.column + column]
}

//генеруємо фігури де вони будуть знах-сь
function generateTetromino() {
    const nameTetro = randomFigure(TETROMINO_NAMES);
    const matrix = TETROMINOES[nameTetro];
    const columnTetro = Math.floor(PLAYFIELD_COLUMNS / 2 - matrix.length / 2);
    const rowTetro = -2;

    tetromino = {
        name: nameTetro,
        matrix: matrix,
        column: columnTetro,
        row: rowTetro,
    }
}

function generatePlayField() {
    for (let i = 0; i < PLAYFIELD_COLUMNS * PLAYFIELD_ROWS; i++) {
        const div = document.createElement('div');
        document.querySelector('.tetris').append(div);
    }
    playField = new Array(PLAYFIELD_ROWS).fill()
        .map(() => new Array(PLAYFIELD_COLUMNS).fill(0))
}

function drawTetramino() {
    const name = tetromino.name;
    const tetrominoMatrixSize = tetromino.matrix.length;
    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            //код для прикладу обертання фігури
            // const cellIndex = convertPositionToIndex(tetromino.row + row, tetromino.column + column);
            // cells[cellIndex].innerHTML = showRotated[row][column];
            if (isOutSideOfTopGameBoard(row)) {
                continue;
            }
            if (!tetromino.matrix[row][column]) {
                continue;
            }
            const cellIndex = convertPositionToIndex(tetromino.row + row, tetromino.column + column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawPlayField() {
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (!playField[row][column]) {
                continue;
            } else {
                const nameFigure = playField[row][column];
                const cellIndex = convertPositionToIndex(row, column);
                cells[cellIndex].classList.add(nameFigure);
            }
        }
    }
}

//створювати нові фігури підзапускати процесс
function placeTetromino() {
    const tetrominoMatrixSize = tetromino.matrix.length;
    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (isOutSideOfTopGameBoard(row)) {
                isGameOver = true;
                messageEnd.style.display = 'inline';
                return;
            }
            if (tetromino.matrix[row][column]) {
                playField[tetromino.row + row][tetromino.column + column] = tetromino.name;
            }
        }
    }
    let filledRows = findFilledRows();
    removeFillRow(filledRows);
    scoreCount(filledRows.length);
    generateTetromino();
}

function updateMainScore() {
    scoreMain += score;
    scoreMainDiv.innerHTML = scoreMain;
}
function scoreCount(destroyRows) {
    if (destroyRows == 1) {
        score += 10;
    }
    if (destroyRows == 2) {
        score += 20;
    }
    if (destroyRows == 3) {
        score += 40;
    }
    if (destroyRows == 4) {
        score += 100;
    }
    scoreUser.innerHTML = score;
}

function removeFillRow(filledRows) {
    for (let i = 0; i < filledRows.length; i++) {
        const row = filledRows[i];
        dropRowsAbove(row);
    }
}
function dropRowsAbove(rowDelete) {
    for (let row = rowDelete; row > 0; row--) {
        playField[row] = playField[row - 1];
    }
    playField[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

function findFilledRows() {
    const fillRows = [];
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        let filledColums = 0;
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (playField[row][column] != 0) {
                filledColums++;
            }
        }
        if (PLAYFIELD_COLUMNS == filledColums) {
            fillRows.push(row);
        }
    }
    return fillRows;
}

function convertPositionToIndex(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}

function init() {
    score = 0;
    scoreUser.innerHTML = 0;
    isGameOver = false;
    generatePlayField()
    cells = document.querySelectorAll('.tetris div');
    generateTetromino();
    moveDown();
}


// function generateTetromino() {
//     // Спочатку створюємо новий Tetromino з nextTetromino
//     tetromino.name = nextTetromino.name;
//     tetromino.matrix = nextTetromino.matrix;
//     tetromino.column = Math.floor((PLAYFIELD_COLUMNS - tetromino.matrix[0].length) / 2);
//     tetromino.row = 0;

//     // Потім створюємо новий nextTetromino
//     nextTetromino.name = randomFigure(TETROMINO_NAMES);
//     nextTetromino.matrix = TETROMINOES[nextTetromino.name];

//     if (!isValid()) {
//         console.log('game over');
//         messageEnd.style.display = 'block';
//         startBtn.disabled = false;
//         stopAutoMoveDown();
//         isGameOver = true;
//     }

//     drawPlayFieldNexrFigure(); 
// }

function generatePlayFieldNextFigure() {
    for (let i = 0; i < PLAYFIELD_COLUMNS_NEXT * PLAYFIELD_ROWS_NEXT; i++) {
        const div = document.createElement('div');
        document.querySelector('.tetrisNextFigure').append(div);
    }
    playFieldNextFigure = new Array(PLAYFIELD_ROWS_NEXT).fill()
        .map(() => new Array(PLAYFIELD_COLUMNS_NEXT).fill(0))
}
function drawPlayFieldNexrFigure() {
    for (let row = 0; row < PLAYFIELD_ROWS_NEXT; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS_NEXT; column++) {
            if (!playFieldNextFigure[row][column]) {
                continue;
            } else {
                const nameFigure = playFieldNextFigure[row][column];
                const cellIndex = convertPositionToIndex(row, column);
                cellsNextFigure[cellIndex].classList.add(nameFigure);
            }
        }
    }
}
function drawTetraminoNextFigure() {
    cellsNextFigure.forEach(el => el.removeAttribute('class'));
    const name = nextTetromino.name;
    const tetrominoMatrixSize = nextTetromino.matrix.length;
    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (!nextTetromino.matrix[row][column]) {
                continue;
            }
            const cellIndex = row * PLAYFIELD_COLUMNS_NEXT + column;
            cellsNextFigure[cellIndex].classList.add(name);
        }
    }
}

function initNext() {
    generatePlayFieldNextFigure();
    cellsNextFigure = document.querySelectorAll('.tetrisNextFigure div');
}
/////////


initNext();
generatePlayField();
startGame();