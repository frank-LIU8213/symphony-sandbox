import { initGame } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('game-board');
    const score = document.getElementById('score');
    initGame(svg, score);
});
