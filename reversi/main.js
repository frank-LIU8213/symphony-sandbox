import { createBoard, getValidMoves, placeDisc, getScore, isGameOver, getWinner, isValidMove } from './gameLogic.js';
import { BoardRenderer } from './boardRenderer.js';
import { createInfoPanel } from './infoPanel.js';
import { loadBackgroundImage } from './generateBackground.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Apply background image
  const bg = await loadBackgroundImage();
  if (bg && bg !== 'none') {
    document.body.style.backgroundImage = bg;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  }

  const app = document.getElementById('app');
  if (!app) return;

  // 2. Create layout containers for board and info panel
  app.style.display = 'flex';
  app.style.justifyContent = 'center';
  app.style.alignItems = 'flex-start';
  app.style.gap = '32px';
  app.style.padding = '40px';

  const boardContainer = document.createElement('div');
  boardContainer.id = 'board-container';
  app.appendChild(boardContainer);

  const infoContainer = document.createElement('div');
  infoContainer.id = 'info-container';
  app.appendChild(infoContainer);

  // 3. Create board renderer and info panel
  let board = createBoard();
  let currentPlayer = 'black';

  const boardRenderer = new BoardRenderer(boardContainer, {
    onCellClick: (row, col) => {
      // Ignore clicks when game is already over
      if (isGameOver(board)) return;

      if (!isValidMove(board, row, col, currentPlayer)) return;

      // Place disc and get flipped positions
      const { newBoard, flippedDiscs } = placeDisc(board, row, col, currentPlayer);
      board = newBoard;

      // Determine next player
      const opponent = currentPlayer === 'black' ? 'white' : 'black';
      let nextPlayer;
      if (getValidMoves(board, opponent).length > 0) {
        nextPlayer = opponent;
      } else if (getValidMoves(board, currentPlayer).length > 0) {
        nextPlayer = currentPlayer; // same player plays again
      } else {
        nextPlayer = null; // game over
      }

      // Update UI
      const score = getScore(board);
      infoPanel.updateScore(score.black, score.white);

      // Render board with valid moves for the next player (or none if over)
      const validMoves = nextPlayer ? getValidMoves(board, nextPlayer) : [];
      boardRenderer.render(board, validMoves);
      boardRenderer.highlightFlipping(flippedDiscs);

      if (nextPlayer) {
        currentPlayer = nextPlayer;
        infoPanel.updateTurn(currentPlayer);
      }

      // Check game over
      if (isGameOver(board)) {
        const winner = getWinner(board);
        infoPanel.showGameOver(winner, score);
      }
    },
  });

  const infoPanel = createInfoPanel(infoContainer);

  // 4. Initial render
  const initialValidMoves = getValidMoves(board, currentPlayer);
  boardRenderer.render(board, initialValidMoves);
  const initialScore = getScore(board);
  infoPanel.updateScore(initialScore.black, initialScore.white);
  infoPanel.updateTurn(currentPlayer);

  // 5. Reset callback
  infoPanel.reset(() => {
    // Hide the game-over modal if it is currently displayed
    const modal = document.getElementById('game-over-modal');
    if (modal) modal.style.display = 'none';

    board = createBoard();
    currentPlayer = 'black';
    const validMoves = getValidMoves(board, currentPlayer);
    boardRenderer.render(board, validMoves);
    const score = getScore(board);
    infoPanel.updateScore(score.black, score.white);
    infoPanel.updateTurn(currentPlayer);
  });
});
