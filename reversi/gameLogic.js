export const BOARD_SIZE = 8;
export const BLACK = 'black';
export const WHITE = 'white';

const DIRS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function inBounds(r, c) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

export function createBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[3][3] = WHITE;
  board[4][4] = WHITE;
  return board;
}

export function getFlippedDiscs(board, row, col, player) {
  if (board[row][col] !== null) return [];
  const opponent = player === BLACK ? WHITE : BLACK;
  const flipped = [];

  for (const [dr, dc] of DIRS) {
    const line = [];
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c) && board[r][c] === opponent) {
      line.push({ row: r, col: c });
      r += dr;
      c += dc;
    }
    if (inBounds(r, c) && board[r][c] === player && line.length > 0) {
      flipped.push(...line);
    }
  }
  return flipped;
}

export function isValidMove(board, row, col, player) {
  if (!inBounds(row, col) || board[row][col] !== null) return false;
  return getFlippedDiscs(board, row, col, player).length > 0;
}

export function placeDisc(board, row, col, player) {
  // Compute flipped positions using the original board before modification
  const flippedDiscs = getFlippedDiscs(board, row, col, player);
  const newBoard = board.map((r) => [...r]);
  newBoard[row][col] = player;
  for (const pos of flippedDiscs) {
    newBoard[pos.row][pos.col] = player;
  }
  return { newBoard, flippedDiscs };
}

export function getValidMoves(board, player) {
  const moves = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null && isValidMove(board, r, c, player)) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}

export function getScore(board) {
  let black = 0;
  let white = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === BLACK) black++;
      else if (board[r][c] === WHITE) white++;
    }
  }
  return { black, white };
}

export function isGameOver(board) {
  const blackMoves = getValidMoves(board, BLACK);
  const whiteMoves = getValidMoves(board, WHITE);
  return blackMoves.length === 0 && whiteMoves.length === 0;
}

export function getWinner(board) {
  if (!isGameOver(board)) return null;
  const score = getScore(board);
  if (score.black > score.white) return BLACK;
  if (score.white > score.black) return WHITE;
  return 'draw';
}
