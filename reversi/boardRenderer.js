import { BOARD_SIZE, BLACK, WHITE } from './gameLogic.js';

export class BoardRenderer {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.onCellClick = options.onCellClick || (() => {});
    this.cells = [];
    this.boardEl = null;
    this._buildDOM();
  }

  _buildDOM() {
    this.boardEl = document.createElement('div');
    this.boardEl.id = 'board';
    this.boardEl.style.display = 'grid';
    this.boardEl.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;

    for (let r = 0; r < BOARD_SIZE; r++) {
      const rowCells = [];
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('click', () => this.onCellClick(r, c));
        this.boardEl.appendChild(cell);
        rowCells.push(cell);
      }
      this.cells.push(rowCells);
    }
    this.container.appendChild(this.boardEl);
  }

  render(board, validMoves = []) {
    const moveSet = new Set(validMoves.map(p => `${p.row},${p.col}`));
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = this.cells[r][c];
        cell.innerHTML = '';
        const discColor = board[r][c];
        if (discColor !== null) {
          const disc = document.createElement('div');
          disc.className = `disc disc--${discColor}`;
          cell.appendChild(disc);
        }
        if (moveSet.has(`${r},${c}`)) {
          cell.classList.add('valid-move');
        } else {
          cell.classList.remove('valid-move');
        }
      }
    }
  }

  highlightFlipping(cells) {
    for (const pos of cells) {
      const cellEl = this.cells[pos.row]?.[pos.col];
      if (!cellEl) continue;
      const disc = cellEl.querySelector('.disc');
      if (disc) {
        disc.classList.add('disc--flipping');
        setTimeout(() => disc.classList.remove('disc--flipping'), 300);
      }
    }
  }

  destroy() {
    if (this.boardEl && this.boardEl.parentNode) {
      this.boardEl.parentNode.removeChild(this.boardEl);
    }
  }
}
