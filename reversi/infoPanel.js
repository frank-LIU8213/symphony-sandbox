/**
 * Info panel for Reversi game.
 * Creates DOM elements for score, turn indicator, reset button, and game‑over modal.
 * Returns an object with methods to update the UI.
 *
 * @param {HTMLElement} containerElement - The parent element (#app) to attach the panel to.
 * @returns {{
 *   updateScore: (black: number, white: number) => void,
 *   updateTurn: (player: string) => void,
 *   showGameOver: (winner: string, score: { black: number, white: number }) => void,
 *   reset: (callback: () => void) => void
 * }}
 */
export function createInfoPanel(containerElement) {
  // ---- main panel wrapper ----
  const panel = document.createElement('div');
  panel.id = 'info-panel';
  panel.className = 'info-panel';

  // ---- score area ----
  const scoreArea = document.createElement('div');
  scoreArea.className = 'info-panel__score-area';

  const blackLabel = document.createElement('span');
  blackLabel.className = 'info-panel__label';
  blackLabel.textContent = 'Black: ';

  const blackScore = document.createElement('span');
  blackScore.id = 'black-score';
  blackScore.className = 'info-panel__score';
  blackScore.textContent = '0';

  const whiteLabel = document.createElement('span');
  whiteLabel.className = 'info-panel__label';
  whiteLabel.textContent = '  White: ';

  const whiteScore = document.createElement('span');
  whiteScore.id = 'white-score';
  whiteScore.className = 'info-panel__score';
  whiteScore.textContent = '0';

  scoreArea.appendChild(blackLabel);
  scoreArea.appendChild(blackScore);
  scoreArea.appendChild(whiteLabel);
  scoreArea.appendChild(whiteScore);

  // ---- turn indicator ----
  const turnDiv = document.createElement('div');
  turnDiv.id = 'turn-indicator';
  turnDiv.className = 'info-panel__turn';
  turnDiv.textContent = "Black's turn";

  // ---- reset button ----
  const resetBtn = document.createElement('button');
  resetBtn.id = 'reset-btn';
  resetBtn.className = 'info-panel__reset-btn';
  resetBtn.textContent = 'New Game';

  // ---- game‑over modal ----
  const overlay = document.createElement('div');
  overlay.id = 'game-over-modal';
  overlay.className = 'game-over';
  overlay.style.display = 'none'; // hidden until game ends

  const modalContent = document.createElement('div');
  modalContent.className = 'game-over__content';

  const winnerEl = document.createElement('div');
  winnerEl.className = 'game-over__winner';

  const messageEl = document.createElement('div');
  messageEl.className = 'game-over__message';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'game-over__close-btn';
  closeBtn.textContent = 'Close';

  modalContent.appendChild(winnerEl);
  modalContent.appendChild(messageEl);
  modalContent.appendChild(closeBtn);
  overlay.appendChild(modalContent);

  // close button hides the modal
  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  // ---- assemble panel ----
  panel.appendChild(scoreArea);
  panel.appendChild(turnDiv);
  panel.appendChild(resetBtn);
  panel.appendChild(overlay);

  // ---- attach to container ----
  containerElement.appendChild(panel);

  // ---- returned API ----
  return {
    updateScore(black, white) {
      blackScore.textContent = String(black);
      whiteScore.textContent = String(white);
    },

    updateTurn(player) {
      turnDiv.textContent = player === 'black' ? "Black's turn" : "White's turn";
    },

    showGameOver(winner, score) {
      if (winner === 'draw') {
        winnerEl.textContent = 'Draw!';
      } else {
        const cap = winner.charAt(0).toUpperCase() + winner.slice(1);
        winnerEl.textContent = `${cap} wins!`;
      }
      messageEl.textContent = `Black: ${score.black} – White: ${score.white}`;
      overlay.style.display = 'flex'; // show the modal
    },

    reset(callback) {
      resetBtn.onclick = callback; // replaces any previous handler
    },
  };
}
