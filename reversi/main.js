import { createBoard, getValidMoves, placeDisc, getScore, isGameOver, getWinner } from './gameLogic.js';
import { BoardRenderer } from './boardRenderer.js';
import { createInfoPanel } from './infoPanel.js';
import { loadBackgroundImage } from './generateBackground.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Integration – worker will implement wiring
  // 1. Apply background
  // 2. Create board renderer, info panel
  // 3. Handle cell clicks, update state, propagate to UI
  // 4. Show game over when needed
  throw new Error('Not implemented');
});
