import { Board, PathFinder } from './game.js';
import { createBoardSvg, animatePath, removeTile, drawScore } from './renderer.js';

// Inject a CSS animation for the "shake" feedback when no path exists
const _shakeStyle = document.createElement('style');
_shakeStyle.textContent = `
    @keyframes tile-shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        75% { transform: translateX(-5px); }
        100% { transform: translateX(0); }
    }
    .tile-shake {
        animation: tile-shake 0.3s ease;
    }
`;
document.head.appendChild(_shakeStyle);

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
        // Clicking the same tile: deselect
        if (selected.row === row && selected.col === col) {
            target.classList.remove('tile-selected');
            selected = null;
            return;
        }

        // Remove visual highlight from the previously selected tile
        const oldSelectedEl = svgElement.querySelector(`#tile-${selected.row}-${selected.col}`);
        if (oldSelectedEl) {
            oldSelectedEl.classList.remove('tile-selected');
        }

        const path = PathFinder.findPath(board, selected, tile);
        if (path) {
            // Valid match: animate connection, then remove both tiles
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
            // No valid path: shake the clicked tile and clear selection
            target.classList.add('tile-shake');
            setTimeout(() => {
                target.classList.remove('tile-shake');
            }, 300);
            selected = null;
        }
    } else {
        // First click: select the tile
        target.classList.add('tile-selected');
        selected = { row, col };
    }
}
