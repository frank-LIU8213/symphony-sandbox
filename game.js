const COLORS = [
  { emote: '❤️', bg: '#e03a3a' },
  { emote: '💎', bg: '#3a87e0' },
  { emote: '🌟', bg: '#e0b43a' },
  { emote: '🍀', bg: '#3ae09e' },
  { emote: '🔥', bg: '#e0593a' },
  { emote: '❄️', bg: '#59c9e0' },
];

const POWER_ICONS = {
  bomb: '💣',
  row: '↔️',
  col: '↕️',
  color: '🎨'
};

class Game {
  constructor({ levels, effects, onStateChange, onEvent }) {
    this.levels = levels;
    this.effects = effects;
    this.onStateChange = onStateChange;
    this.onEvent = onEvent;
    this.board = [];
    this.rows = 8;
    this.cols = 8;
    this.colorsCount = 5;
    this.score = 0;
    this.moves = 0;
    this.target = 0;
    this.inventory = { bomb:0, row:0, col:0, color:0 };
    this.selected = null;
    this.powerTargetMode = null;
    this.levelIndex = 0;
  }

  start(levelIndex = 0) {
    this.levelIndex = levelIndex;
    const lv = this.levels[levelIndex];
    this.rows = lv.rows;
    this.cols = lv.cols;
    this.colorsCount = lv.colors;
    this.score = 0;
    this.moves = lv.moves;
    this.target = lv.goal;
    this.inventory = { bomb:0, row:0, col:0, color:0 };
    this.selected = null;
    this.powerTargetMode = null;
    this.board = this._createBoard();
    this._emitState();
  }

  shuffle() {
    do {
      this._fillRandom();
    } while (this._hasMatches());
    this.selected = null;
    this._emitState();
  }

  restart() {
    this.start(this.levelIndex);
  }

  getBoard() {
    return this.board;
  }

  select(row, col) {
    if (this.powerTargetMode) return;
    if (!this.board[row]?.[col]) return;
    if (this.selected) {
      if (this.selected.row === row && this.selected.col === col) {
        this.selected = null;
        this._emitState();
        return;
      }
      if (this._isAdjacent(this.selected, {row, col})) {
        this._trySwap(this.selected, {row, col});
        this.selected = null;
      } else {
        this.selected = {row, col};
      }
    } else {
      this.selected = {row, col};
    }
    this._emitState();
  }

  usePowerup(name) {
    if (!this.inventory[name]) return;
    if (this.powerTargetMode) return;
    this.powerTargetMode = name;
    this._emitState();
    this.onEvent?.('powerup-selected', name);
  }

  applyPowerTarget(row, col) {
    if (!this.powerTargetMode) return;
    const name = this.powerTargetMode;
    this.powerTargetMode = null;
    if (name === 'bomb') {
      this._applyBomb(row, col);
    } else if (name === 'row') {
      this._clearRow(row);
    } else if (name === 'col') {
      this._clearCol(col);
    } else if (name === 'color') {
      const cell = this.board[row]?.[col];
      if (!cell) return;
      this._clearColor(cell.color);
    }
    this.inventory[name]--;
    this._afterClear();
    this._emitState();
    if (this.isGameOver()) this._emitState();
  }

  isGameOver() {
    if (this.score >= this.target) return { win: true };
    if (this.moves <= 0) return { win: false };
    return null;
  }

  // ---------- internal ----------
  _emitState() {
    this.onStateChange?.();
  }

  _createBoard() {
    const b = Array.from({length: this.rows}, () => Array(this.cols).fill(null));
    do {
      for (let r=0; r<this.rows; r++) {
        for (let c=0; c<this.cols; c++) {
          b[r][c] = this._randomCell();
        }
      }
    } while (this._hasMatches(b));
    return b;
  }

  _fillRandom(board = this.board) {
    for (let r=0; r<this.rows; r++) {
      for (let c=0; c<this.cols; c++) {
        if (!board[r][c]) board[r][c] = this._randomCell();
      }
    }
  }

  _randomCell() {
    const ci = Math.floor(Math.random() * this.colorsCount);
    return { color: ci, powerUp: null };
  }

  _isAdjacent(a, b) {
    const dr = Math.abs(a.row - b.row);
    const dc = Math.abs(a.col - b.col);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  }

  _trySwap(sel, tgt) {
    this._swapCells(sel, tgt);
    const groups = this._findMatches();
    if (groups.length === 0) {
      this._swapCells(sel, tgt); // revert
      this.effects?.playInvalid?.();
      return;
    }
    this.effects?.playSwap?.();
    if (this.board[sel.row][sel.col].powerUp && this.board[tgt.row][tgt.col].powerUp) {
      this._handleDoublePower(sel, tgt);
      this.moves--;
    } else {
      this._resolveMatches(groups, sel, tgt);
      this.moves--;
    }
  }

  _swapCells(a, b) {
    const tmp = this.board[a.row][a.col];
    this.board[a.row][a.col] = this.board[b.row][b.col];
    this.board[b.row][b.col] = tmp;
  }

  _handleDoublePower(a, b) {
    const cellA = this.board[a.row][a.col];
    const cellB = this.board[b.row][b.col];
    const pa = cellA?.powerUp;
    const pb = cellB?.powerUp;
    if (!pa || !pb) return;
    // remove both
    this.board[a.row][a.col] = null;
    this.board[b.row][b.col] = null;
    this._applyComboEffect(pa, pb, a, b);
    this._afterClear();
    this._emitState();
  }

  _applyComboEffect(pa, pb, a, b) {
    if (pa === 'bomb' && pb === 'bomb') {
      this._explode(a, 3);
      return;
    }
    if (pa === 'bomb' || pb === 'bomb') {
      const bombPos = pa === 'bomb' ? a : b;
      const other = pa === 'bomb' ? pb : pa;
      const otherPos = pa === 'bomb' ? b : a;
      this._explode(bombPos, 1);
      if (other === 'row') {
        this._clearRow(otherPos.row);
        this._clearRow(otherPos.row - 1);
        this._clearRow(otherPos.row + 1);
      } else if (other === 'col') {
        this._clearCol(otherPos.col);
        this._clearCol(otherPos.col - 1);
        this._clearCol(otherPos.col + 1);
      } else if (other === 'color') {
        const cell = this.board[otherPos.row][otherPos.col];
        if (cell) this._clearColor(cell.color);
        this._explode(bombPos, 1);
      }
      return;
    }
    if (pa === 'row' && pb === 'row') {
      this._clearRow(a.row);
      this._clearRow(b.row);
      this._clearCol(a.col);
      return;
    }
    if (pa === 'col' && pb === 'col') {
      this._clearCol(a.col);
      this._clearCol(b.col);
      this._clearRow(a.row);
      return;
    }
    if ((pa === 'row' && pb === 'col') || (pa === 'col' && pb === 'row')) {
      const rowPos = pa === 'row' ? a : b;
      const colPos = pa === 'col' ? a : b;
      this._clearRow(rowPos.row);
      this._clearCol(colPos.col);
      return;
    }
    if (pa === 'color' || pb === 'color') {
      const colorCell = pa === 'color' ? a : b;
      const otherType = pa === 'color' ? pb : pa;
      const otherPos = pa === 'color' ? b : a;
      const cell = this.board[colorCell.row][colorCell.col];
      if (cell) this._clearColor(cell.color);
      if (otherType === 'row') this._clearRow(otherPos.row);
      if (otherType === 'col') this._clearCol(otherPos.col);
      if (otherType === 'bomb') this._explode(otherPos, 2);
      return;
    }
  }

  _resolveMatches(groups, swapA, swapB) {
    let chainCount = 0;
    while (groups.length) {
      this._processGroups(groups, chainCount, swapA);
      this._removeCells(groups);
      this._applyGravity();
      groups = this._findMatches();
      chainCount++;
    }
    // grant bonus for chain
    if (chainCount > 1) {
      this.inventory.bomb++;
      this.onEvent?.('reward', { });
    }
    this.score += 10 * chainCount;
  }

  _processGroups(groups, chain, swapPos) {
    for (const g of groups) {
      if (chain === 0) {
        if (g.size === 4) {
          this.inventory.bomb++;
          this.effects?.playReward?.();
        } else if (g.size >= 5) {
          if (g.orientation === 'h') {
            this.inventory.row++;
          } else {
            this.inventory.col++;
          }
          this.effects?.playReward?.();
        }
      } else {
        this.inventory.color++;
        this.effects?.playReward?.();
      }
    }
  }

  _removeCells(groups) {
    for (const g of groups) {
      for (const {row, col} of g.cells) {
        this.board[row][col] = null;
      }
    }
  }

  _applyGravity() {
    for (let c = 0; c < this.cols; c++) {
      const colCells = [];
      for (let r = 0; r < this.rows; r++) {
        if (this.board[r][c]) colCells.push(this.board[r][c]);
      }
      for (let r = this.rows - 1; r >= 0; r--) {
        this.board[r][c] = colCells.pop() || null;
      }
      // fill top nulls
      for (let r = 0; r < this.rows; r++) {
        if (!this.board[r][c]) this.board[r][c] = this._randomCell();
      }
    }
  }

  _findMatches(board = this.board) {
    const groups = [];
    // horizontal
    for (let r = 0; r < this.rows; r++) {
      let start = 0;
      while (start < this.cols) {
        const color = board[r][start]?.color;
        let end = start + 1;
        while (end < this.cols && board[r][end]?.color === color) end++;
        const len = end - start;
        if (len >= 3 && color !== undefined) {
          const cells = [];
          for (let c = start; c < end; c++) cells.push({row: r, col: c});
          groups.push({ size: len, orientation: 'h', cells });
        }
        start = end;
      }
    }
    // vertical
    for (let c = 0; c < this.cols; c++) {
      let start = 0;
      while (start < this.rows) {
        const color = board[start][c]?.color;
        let end = start + 1;
        while (end < this.rows && board[end][c]?.color === color) end++;
        const len = end - start;
        if (len >= 3 && color !== undefined) {
          const cells = [];
          for (let r = start; r < end; r++) cells.push({row: r, col: c});
          groups.push({ size: len, orientation: 'v', cells });
        }
        start = end;
      }
    }
    return groups;
  }

  _hasMatches(board = this.board) {
    return this._findMatches(board).length > 0;
  }

  _explode(pos, radius) {
    const r0 = pos.row, c0 = pos.col;
    for (let r = r0 - radius; r <= r0 + radius; r++) {
      for (let c = c0 - radius; c <= c0 + radius; c++) {
        if (r >=0 && r<this.rows && c>=0 && c<this.cols) {
          this.board[r][c] = null;
        }
      }
    }
  }

  _clearRow(row) {
    for (let c=0; c<this.cols; c++) this.board[row][c] = null;
  }

  _clearCol(col) {
    for (let r=0; r<this.rows; r++) this.board[r][col] = null;
  }

  _clearColor(color) {
    for (let r=0; r<this.rows; r++) {
      for (let c=0; c<this.cols; c++) {
        if (this.board[r][c]?.color === color) this.board[r][c] = null;
      }
    }
  }

  _applyBomb(row, col) {
    this._explode({row, col}, 1);
  }

  _afterClear() {
    this._applyGravity();
    let groups = this._findMatches();
    while (groups.length) {
      this._processGroups(groups, 0, null);
      this._removeCells(groups);
      this._applyGravity();
      groups = this._findMatches();
    }
  }
}

export { Game };
