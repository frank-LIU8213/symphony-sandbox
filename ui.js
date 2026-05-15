import { Board, PathFinder } from './game.js';
import { createBoardSvg, animatePath, removeTile, drawScore } from './renderer.js';
import { bus as fallbackBus } from './eventBus.js';

// CSS for shake feedback when a pair cannot be connected
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
let eventBus;
let firstMatch = true;

/**
 * Initialise the game.
 * - Creates a 10×8 board with 4 tile types (the Board constructor guarantees even counts).
 * - Renders the board into `svgElement` and shows the score in `scoreElement`.
 * - Accepts an optional `bus` instance; falls back to the project singleton.
 *
 * @param {SVGSVGElement} svgElement   the SVG that hosts the board
 * @param {HTMLElement}   scoreElement  displays the current score
 * @param {EventBus}      [bus]         optional event bus (defaults to the global singleton)
 */
export function initGame(svgElement, scoreElement, bus) {
    eventBus = bus || fallbackBus;
    score = 0;
    selected = null;
    firstMatch = true;

    board = new Board(10, 8, 4);
    // Use the board's own grid as-is; do NOT overwrite cell types with random values.
    createBoardSvg(board, svgElement);
    drawScore(score, scoreElement);
    svgElement.addEventListener('click', (event) =>
        handleClick(event, svgElement, scoreElement)
    );
}

/** Expose the current board for any external use (e.g., testing). */
export function getBoard() {
    return board;
}

/**
 * Click handler for tile selection / match attempts.
 *
 * Events emitted (via the shared EventBus):
 *   'match'    – when two matching tiles are successfully removed.
 *   'invalid'  – when no path exists between the two selected tiles.
 *   'start'    – once, on the first successful match.
 *   'gameOver' – when the board becomes empty.
 */
function handleClick(event, svgElement, scoreElement) {
    const target = event.target;
    if (!target || !target.id.startsWith('tile-')) return;

    const parts = target.id.split('-');
    const row = parseInt(parts[1]);
    const col = parseInt(parts[2]);
    const tile = board.getTile(row, col);
    if (!tile) return;

    if (selected) {
        // Clicking the same tile deselects it
        if (selected.row === row && selected.col === col) {
            target.classList.remove('tile-selected');
            selected = null;
            return;
        }

        // Remove highlight from the previously selected tile
        const oldSelectedEl = svgElement.querySelector(
            `#tile-${selected.row}-${selected.col}`
        );
        if (oldSelectedEl) {
            oldSelectedEl.classList.remove('tile-selected');
        }

        // Capture tile data before path animation (the data is needed for events)
        const tile1 = board.getTile(selected.row, selected.col);
        const tile2 = tile;

        const path = PathFinder.findPath(board, selected, tile);
        if (path) {
            // ---- Valid match ----
            const emitMatchData = { tile1: { ...tile1 }, tile2: { ...tile2 } };

            animatePath(path, svgElement, () => {
                removeTile(selected.row, selected.col, svgElement, () => {
                    board.remove(selected.row, selected.col);
                    removeTile(row, col, svgElement, () => {
                        board.remove(row, col);
                        score += 10;
                        drawScore(score, scoreElement);

                        if (firstMatch) {
                            eventBus.emit('start', {});
                            firstMatch = false;
                        }
                        eventBus.emit('match', emitMatchData);

                        if (board.isCleared()) {
                            eventBus.emit('gameOver', {});
                            // Keep existing congratulation alert for now
                            alert('Congratulations! You cleared the board!');
                        }
                    });
                });
            });
            selected = null;
        } else {
            // ---- Invalid (no path) ----
            eventBus.emit('invalid', {});
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
