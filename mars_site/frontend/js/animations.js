export function initAnimations() {
    console.log('Animation system initialized');
}

export function triggerAnimation(selector, type, duration = 1000) {
    const el = document.querySelector(selector);
    if (!el) return;
    console.log(`Triggering ${type} animation on ${selector}`);
}

export function setupScrollAnimations() {
    console.log('Scroll animations configured');
}
