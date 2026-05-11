import { Game } from './game.js';
import { LEVELS } from './levels.js';
import { createEffects } from './effects.js';

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const movesEl = document.getElementById('moves');
const targetEl = document.getElementById('target');
const msgEl = document.getElementById('message');
const bombBtn = document.getElementById('bomb-btn');
const rowBtn = document.getElementById('row-btn');
const colBtn = document.getElementById('col-btn');
const colorBtn = document.getElementById('color-btn');
const bombCount = document.getElementById('bomb-count');
const rowCount = document.getElementById('row-count');
const colCount = document.getElementById('col-count');
const colorCount = document.getElementById('color-count');
const restartBtn = document.getElementById('restart-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const canvasEl = document.getElementById('effects-canvas');

const ctx = canvasEl.getContext('2d');
let particles = [];

function burst(x, y, color) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color });
  }
}

function updateParticles() {
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.03;
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  requestAnimationFrame(updateParticles);
}
updateParticles();

const effects = createEffects();

let selectionMode = null;

function render(game) {
  scoreEl.textContent = game.score;
  movesEl.textContent = game.moves;
  targetEl.textContent = game.target;
  bombCount.textContent = game.inventory.bomb;
  rowCount.textContent = game.inventory.row;
  colCount.textContent = game.inventory.col;
  colorCount.textContent = game.inventory.color;

  bombBtn.classList.toggle('disabled', game.inventory.bomb === 0);
  rowBtn.classList.toggle('disabled', game.inventory.row === 0);
  colBtn.classList.toggle('disabled', game.inventory.col === 0);
  colorBtn.classList.toggle('disabled', game.inventory.color === 0);

  const board = game.getBoard();
  boardEl.style.gridTemplateColumns = `repeat(${board[0].length}, 3.6rem)`;
  boardEl.innerHTML = '';

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const cell = board[r][c];
      const div = document.createElement('div');
      div.className = 'cell';
      if (game.selected && game.selected.row === r && game.selected.col === c) {
        div.classList.add('selected');
      }
      div.dataset.row = r;
      div.dataset.col = c;
      if (cell) {
        div.textContent = cell.emote;
        div.style.background = cell.bg;
      }
      div.addEventListener('click', () => handleCellClick(r, c));
      boardEl.appendChild(div);
    }
  }
}

function handleCellClick(row, col) {
  if (game.isGameOver()) return;
  if (game.powerTargetMode) {
    const name = game.powerTargetMode;
    game.applyPowerTarget(row, col);
    render(game);
    if (game.isGameOver()) showResult();
    return;
  }
  game.select(row, col);
  render(game);
  if (game.isGameOver()) showResult();
}

function showResult() {
  const over = game.isGameOver();
  if (over.win) {
    msgEl.textContent = '🎉 You Win!';
  } else {
    msgEl.textContent = '😞 Game Over';
  }
}

function startLevel(levelIdx = 0) {
  game.start(levelIdx);
  render(game);
  msgEl.textContent = '';
}

const game = new Game({
  levels: LEVELS,
  effects,
  onStateChange: () => { render(game); },
  onEvent: (type, detail) => {
    if (type === 'match') {
      const cellEl = document.querySelector(`.cell[data-row="${detail.row}"][data-col="${detail.col}"]`);
      if (cellEl) {
        const rect = cellEl.getBoundingClientRect();
        const boardRect = boardEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - boardRect.left;
        const y = rect.top + rect.height / 2 - boardRect.top;
        burst(x, y, '#ffe45c');
      }
    } else if (type === 'reward') {
      effects.playReward();
    }
  }
});

bombBtn.addEventListener('click', () => game.usePowerup('bomb'));
rowBtn.addEventListener('click', () => game.usePowerup('row'));
colBtn.addEventListener('click', () => game.usePowerup('col'));
colorBtn.addEventListener('click', () => game.usePowerup('color'));

restartBtn.addEventListener('click', () => startLevel(game.levelIndex));
shuffleBtn.addEventListener('click', () => {
  game.shuffle();
  render(game);
});

startLevel(0);
