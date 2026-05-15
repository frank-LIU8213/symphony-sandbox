/**
 * SVG board rendering with tile shapes and animation helpers.
 * Designed with an Airbnb-inspired aesthetic: warm colors, rounded corners,
 * subtle shadows, and smooth drawing animations.
 */

const CELL_SIZE = 60;

/**
 * Create the SVG board representation.
 * Clears the SVG, adds `<defs>` for gradients and drop shadow,
 * then draws each tile as a rounded `<rect>` with a CSS class.
 */
export function createBoardSvg(board, svgElement) {
    svgElement.innerHTML = '';

    // ---- <defs> ----
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Drop‑shadow filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'tile-shadow');
    filter.setAttribute('x', '-10%');
    filter.setAttribute('y', '-10%');
    filter.setAttribute('width', '130%');
    filter.setAttribute('height', '130%');
    const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
    feDropShadow.setAttribute('dx', '2');
    feDropShadow.setAttribute('dy', '2');
    feDropShadow.setAttribute('stdDeviation', '3');
    feDropShadow.setAttribute('flood-opacity', '0.20');
    filter.appendChild(feDropShadow);
    defs.appendChild(filter);

    // Gradient for each tile type (Airbnb‑inspired palette)
    const gradientColors = [
        { start: '#FF7A7F', end: '#FF5A5F' },   // type 1 – coral
        { start: '#00B8A9', end: '#00A699' },   // type 2 – teal
        { start: '#FFC857', end: '#FFB400' },   // type 3 – gold
        { start: '#A566C7', end: '#9B51E0' },   // type 4 – purple
    ];

    for (let t = 1; t <= board.tileTypes; t++) {
        const idx = t - 1;
        const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        grad.setAttribute('id', `grad-type-${t}`);
        grad.setAttribute('x1', '0%');
        grad.setAttribute('y1', '0%');
        grad.setAttribute('x2', '100%');
        grad.setAttribute('y2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', gradientColors[idx].start);

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', gradientColors[idx].end);

        grad.appendChild(stop1);
        grad.appendChild(stop2);
        defs.appendChild(grad);
    }

    svgElement.appendChild(defs);

    // ---- Tiles ----
    for (let r = 0; r < board.height; r++) {
        for (let c = 0; c < board.width; c++) {
            const tile = board.getTile(r, c);
            const x = c * CELL_SIZE;
            const y = r * CELL_SIZE;
            if (tile) {
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', x);
                rect.setAttribute('y', y);
                rect.setAttribute('width', CELL_SIZE);
                rect.setAttribute('height', CELL_SIZE);
                rect.setAttribute('rx', '8');
                rect.setAttribute('ry', '8');
                rect.setAttribute('class', `tile tile-type-${tile.type}`);
                rect.setAttribute('id', `tile-${r}-${c}`);
                rect.setAttribute('fill', `url(#grad-type-${tile.type})`);
                rect.setAttribute('filter', 'url(#tile-shadow)');
                rect.setAttribute('stroke', '#E3E1E1');
                rect.setAttribute('stroke-width', '1');
                svgElement.appendChild(rect);
            }
        }
    }
}

/**
 * Draw a connecting polyline along the given path, smoothly animating its
 * appearance (draw‑on effect).  Calls `callback` after the animation completes.
 */
export function animatePath(path, svgElement, callback) {
    const points = path
        .map(p => `${p.col * CELL_SIZE + CELL_SIZE / 2},${p.row * CELL_SIZE + CELL_SIZE / 2}`)
        .join(' ');

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', points);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#FF5A5F');
    polyline.setAttribute('stroke-width', '4');
    polyline.setAttribute('stroke-linecap', 'round');
    polyline.setAttribute('stroke-linejoin', 'round');
    polyline.setAttribute('id', 'connection-path');
    svgElement.appendChild(polyline);

    // ---- Draw‑on animation via stroke‑dasharray / stroke‑dashoffset ----
    const length = polyline.getTotalLength();

    polyline.style.strokeDasharray = length;
    polyline.style.strokeDashoffset = length;

    requestAnimationFrame(() => {
        polyline.style.transition = 'stroke-dashoffset 0.75s linear';
        polyline.style.strokeDashoffset = '0';
    });

    // ---- Remove after animation ----
    const cleanUp = () => {
        if (polyline.parentNode) {
            polyline.parentNode.removeChild(polyline);
        }
        callback();
    };

    // Transition end is reliable for SVG polyline in modern browsers
    polyline.addEventListener('transitionend', cleanUp, { once: true });
    // Fallback timeout in case transitionend is not fired
    setTimeout(() => {
        // Only call cleanUp if still attached (transitionend may have already removed it)
        if (polyline.parentNode) {
            polyline.removeEventListener('transitionend', cleanUp);
            cleanUp();
        }
    }, 900);
}

/**
 * Fade out and shrink a tile, then remove it from the DOM.
 * Calls `callback` after the removal completes.
 */
export function removeTile(row, col, svgElement, callback) {
    const tileEl = svgElement.querySelector(`#tile-${row}-${col}`);
    if (tileEl) {
        const cx = col * CELL_SIZE + CELL_SIZE / 2;
        const cy = row * CELL_SIZE + CELL_SIZE / 2;

        tileEl.style.transformOrigin = `${cx}px ${cy}px`;
        tileEl.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
        tileEl.style.opacity = '0';
        tileEl.style.transform = 'scale(0.4)';

        setTimeout(() => {
            tileEl.remove();
            callback();
        }, 400);
    } else {
        callback();
    }
}

/**
 * Update the score display.
 */
export function drawScore(score, containerElement) {
    containerElement.textContent = `Score: ${score}`;
}
