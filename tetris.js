// UI Elements
let grid = document.querySelector('#tetris');
let scoreDisplay = document.getElementById('score');
let levelDisplay = document.getElementById('level');
let linesDisplay = document.getElementById('lines');
let startButton = document.querySelector('.start');
let restartButton = document.querySelector('.restart');
let gameMusic = document.getElementById('gameMusic');
let gameOverSound = document.getElementById('gameOverSound');

// Game Variables
let width = 10;
let timerId;
let score = 0;
let level = 1;
let linesCleared = 0;
let gridCells = [];
let isGameOver = false;

// Tetromino Shapes
const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
];

const zTetromino = [
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1],
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1]
];

const tTetromino = [
    [1, width, width+1, width+2],
    [1, width+1, width+2, width*2+1],
    [width, width+1, width+2, width*2+1],
    [1, width, width+1, width*2+1]
];

const oTetromino = [
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1]
];

const iTetromino = [
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3],
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3]
];

const jTetromino = [
    [0, width, width+1, width*2+1],
    [1, width+2, width*2, width*2+1],
    [width, width+1, width+2, width*2+2],
    [0, width, width+1, width*2+1]
];

const sTetromino = [
    [1, width+1, width+2, width*2+2],
    [width, width+1, width+2, width*2+1],
    [1, width+1, width+2, width*2+2],
    [width, width+1, width+2, width*2+1]
];

const tetrominos = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino, jTetromino, sTetromino];

// Game State
let currentPosition = 4;
let currentRotation = 0;
let random = Math.floor(Math.random() * tetrominos.length);
let current = tetrominos[random][currentRotation];

// Grid Creation
function createGrid() {
    grid.innerHTML = '';
    gridCells = [];
    for (let i = 0; i < 200; i++) {
        let cell = document.createElement('div');
        cell.classList.add('cell');
        grid.appendChild(cell);
        gridCells.push(cell);
    }
    for (let i = 0; i < 10; i++) {
        let cell = document.createElement('div');
        cell.classList.add('cell', 'taken');
        grid.appendChild(cell);
        gridCells.push(cell);
    }
}

// Tetromino Movement
function draw() {
    current.forEach(index => {
        gridCells[currentPosition + index].classList.add('filled');
    });
}

function undraw() {
    current.forEach(index => {
        gridCells[currentPosition + index].classList.remove('filled');
    });
}

function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
}

function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
    if (!isAtLeftEdge) currentPosition -= 1;
    if (current.some(index => gridCells[currentPosition + index].classList.contains('taken'))) {
        currentPosition += 1;
    }
    draw();
}

function moveRight() {
    undraw();
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
    if (!isAtRightEdge) currentPosition += 1;
    if (current.some(index => gridCells[currentPosition + index].classList.contains('taken'))) {
        currentPosition -= 1;
    }
    draw();
}

function rotate() {
    undraw();
    currentRotation++;
    if (currentRotation === current.length) {
        currentRotation = 0;
    }
    current = tetrominos[random][currentRotation];
    draw();
}

// Game Controls
function control(e) {
    if (!isGameOver) {
        if (e.keyCode === 37) {
            moveLeft();
        } else if (e.keyCode === 38) {
            rotate();
        } else if (e.keyCode === 39) {
            moveRight();
        } else if (e.keyCode === 40) {
            moveDown();
        }
    }
}

// Game Logic
function freeze() {
    if (current.some(index => gridCells[currentPosition + index + width].classList.contains('taken'))) {
        current.forEach(index => gridCells[currentPosition + index].classList.add('taken'));
        random = Math.floor(Math.random() * tetrominos.length);
        current = tetrominos[random][currentRotation];
        currentPosition = 4;
        draw();
        addScore();
        gameOver();
    }
}

function addScore() {
    for (let i = 0; i < 199; i += width) {
        const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];
        if (row.every(index => gridCells[index].classList.contains('taken'))) {
            score += 10;
            linesCleared++;
            if (linesCleared % 10 === 0) {
                level++;
                clearInterval(timerId);
                timerId = setInterval(moveDown, 1000 - (level * 100));
            }
            scoreDisplay.innerHTML = score;
            levelDisplay.innerHTML = level;
            linesDisplay.innerHTML = linesCleared;
            row.forEach(index => {
                gridCells[index].classList.add('spark');
            });
            setTimeout(() => {
                row.forEach(index => {
                    gridCells[index].classList.remove('taken', 'filled', 'spark');
                });
                const removedCells = gridCells.splice(i, width);
                gridCells.unshift(...removedCells);
                gridCells.forEach(cell => grid.appendChild(cell));
            }, 300);
        }
    }
}

function gameOver() {
    if (current.some(index => gridCells[currentPosition + index].classList.contains('taken'))) {
        scoreDisplay.innerHTML = "Game Over";
        clearInterval(timerId);
        isGameOver = true;
        gameMusic.pause();
        gameOverSound.play();
        restartButton.style.display = 'block';
    }
}

function startGame() {
    startButton.style.display = 'none';
    grid.style.display = 'grid';
    gameMusic.play();
    draw();
    timerId = setInterval(moveDown, 1000);
}

function restartGame() {
    isGameOver = false;
    score = 0;
    level = 1;
    linesCleared = 0;
    scoreDisplay.innerHTML = score;
    levelDisplay.innerHTML = level;
    linesDisplay.innerHTML = linesCleared;
    restartButton.style.display = 'none';
    createGrid();
    draw();
    timerId = setInterval(moveDown, 1000);
    gameMusic.currentTime = 0;
    gameMusic.play();
}

// Event Listeners
document.addEventListener('keydown', control);
createGrid();
