import { Board, PathFinder } from './game.js';
import { createBoardSvg, animatePath, removeTile, drawScore } from './renderer.js';

let board;
let selected = null;
let score = 0;

export function initGame(svgElement, scoreElement) {
    board = new Board(10, 8, 4);
    // Randomly populate the board for the stub; real implementation may shuffle properly.
    for (let r = 0; r < board.height; r++) {
        for (let c = 0; c < board.width; c++) {
            const type = Math.floor(Math.random() * 4) + 1;
            board.grid[r][c] = { row: r, col: c, type };
        }
    }
    createBoardSvg(board, svgElement);
    drawScore(score, scoreElement);
    svgElement.addEventListener('click', (event) => handleClick(event, svgElement, scoreElement));
}

export function getBoard() {
    return board;
}

function handleClick(event, svgElement, scoreElement) {
    const target = event.target;
    if (!target || !target.id.startsWith('tile-')) return;
    const parts = target.id.split('-');
    const row = parseInt(parts[1]);
    const col = parseInt(parts[2]);
    const tile = board.getTile(row, col);
    if (!tile) return;

    if (selected) {
        if (selected.row === row && selected.col === col) {
            target.classList.remove('tile-selected');
            selected = null;
            return;
        }
        const path = PathFinder.findPath(board, selected, tile);
        if (path) {
            animatePath(path, svgElement, () => {
                removeTile(selected.row, selected.col, svgElement, () => {
                    board.remove(selected.row, selected.col);
                    removeTile(row, col, svgElement, () => {
                        board.remove(row, col);
                        score += 10;
                        drawScore(score, scoreElement);
                        if (board.isCleared()) {
                            alert('Congratulations! You cleared the board!');
                        }
                    });
                });
            });
            selected = null;
        } else {
            const oldEl = svgElement.querySelector(`#tile-${selected.row}-${selected.col}`);
            if (oldEl) oldEl.classList.remove('tile-selected');
            target.classList.add('tile-selected');
            setTimeout(() => target.classList.remove('tile-selected'), 300);
            selected = null;
        }
    } else {
        target.classList.add('tile-selected');
        selected = { row, col };
    }
}
