/**
 * Apply a warm, Airbnb-inspired background to the game container.
 * Uses the generated static/bg.jpg image and adds a subtle gradient overlay.
 */
export function applyBackground(container) {
    // Set the background image
    container.style.backgroundImage = "url('static/bg.jpg')";
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';
    container.style.backgroundRepeat = 'no-repeat';

    // Ensure the container is positioned so the overlay stays inside it
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }

    // Create a warm gradient overlay for added depth (Airbnb-style)
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg,
            rgba(255,245,238,0.25) 0%,
            rgba(214,190,170,0.30) 100%);
        pointer-events: none;
        z-index: 1;
    `;
    container.appendChild(overlay);
}
