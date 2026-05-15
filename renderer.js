export function createBoardSvg(board, svgElement) {
    svgElement.innerHTML = '';
    const cellSize = 60;
    for (let r = 0; r < board.height; r++) {
        for (let c = 0; c < board.width; c++) {
            const tile = board.getTile(r, c);
            const x = c * cellSize;
            const y = r * cellSize;
            if (tile) {
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', x);
                rect.setAttribute('y', y);
                rect.setAttribute('width', cellSize);
                rect.setAttribute('height', cellSize);
                rect.setAttribute('class', `tile tile-type-${tile.type}`);
                rect.setAttribute('id', `tile-${r}-${c}`);
                svgElement.appendChild(rect);
            }
        }
    }
}

export function animatePath(path, svgElement, callback) {
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    const points = path.map(p => `${p.col * 60 + 30},${p.row * 60 + 30}`).join(' ');
    polyline.setAttribute('points', points);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', 'gold');
    polyline.setAttribute('stroke-width', 4);
    polyline.setAttribute('id', 'connection-path');
    svgElement.appendChild(polyline);
    setTimeout(() => {
        svgElement.removeChild(polyline);
        callback();
    }, 800);
}

export function removeTile(row, col, svgElement, callback) {
    const tileEl = svgElement.querySelector(`#tile-${row}-${col}`);
    if (tileEl) {
        tileEl.setAttribute('opacity', 0);
        setTimeout(() => {
            tileEl.remove();
            callback();
        }, 400);
    } else {
        callback();
    }
}

export function drawScore(score, containerElement) {
    containerElement.textContent = `Score: ${score}`;
}
