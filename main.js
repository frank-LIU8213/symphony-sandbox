import { initGame } from './ui.js';
import { initSound } from './sound.js';
import { initParticles } from './particles.js';
import { applyBackground } from './background.js';
import { bus } from './eventBus.js';

document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('game-board');
    const score = document.getElementById('score');
    const particlesLayer = document.getElementById('particles-layer');
    const backgroundContainer = document.getElementById('background-container');

    initGame(svg, score, bus);
    initSound(bus);
    initParticles(bus, particlesLayer);
    applyBackground(backgroundContainer);
});
