/**
 * Animation System for Mars Interactive Experience
 * Manages animation states, triggers, and scroll-based effects.
 */

const ANIMATION_STATES = {
    IDLE: 'idle',
    PLAYING: 'playing',
    PAUSED: 'paused'
};

let currentState = ANIMATION_STATES.IDLE;
let animationQueue = [];
let isScrollEnabled = true;

export function initAnimations() {
    console.log('Animation system initialized');
    currentState = ANIMATION_STATES.IDLE;
    setupScrollAnimations();
    triggerHeroEntrance();
}

export function triggerAnimation(selector, type, duration = 1000) {
    const el = document.querySelector(selector);
    if (!el) {
        console.warn(`Element not found for animation: ${selector}`);
        return;
    }

    currentState = ANIMATION_STATES.PLAYING;

    switch (type) {
        case 'fade-in':
            el.style.opacity = '0';
            el.style.transition = `opacity ${duration}ms ease-in-out`;
            requestAnimationFrame(() => {
                el.style.opacity = '1';
            });
            break;
        case 'slide-up':
            el.style.transform = 'translateY(30px)';
            el.style.opacity = '0';
            el.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
            requestAnimationFrame(() => {
                el.style.transform = 'translateY(0)';
                el.style.opacity = '1';
            });
            break;
        case 'scale-in':
            el.style.transform = 'scale(0.8)';
            el.style.opacity = '0';
            el.style.transition = `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${duration}ms ease-out`;
            requestAnimationFrame(() => {
                el.style.transform = 'scale(1)';
                el.style.opacity = '1';
            });
            break;
        case 'pulse':
            el.style.transform = 'scale(1)';
            el.style.transition = `transform ${duration}ms ease-in-out`;
            requestAnimationFrame(() => {
                el.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                }, duration / 2);
            });
            break;
        default:
            console.warn(`Unknown animation type: ${type}`);
            break;
    }

    setTimeout(() => {
        currentState = ANIMATION_STATES.IDLE;
    }, duration);
}

export function setupScrollAnimations() {
    if (!isScrollEnabled) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const type = entry.target.dataset.animation || 'fade-in';
                const duration = parseInt(entry.target.dataset.duration || '800', 10);
                triggerAnimation(`#${entry.target.id}`, type, duration);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('[data-animation]').forEach(el => {
        observer.observe(el);
    });

    console.log('Scroll animations configured');
}

function triggerHeroEntrance() {
    setTimeout(() => {
        triggerAnimation('#mars-hero-svg', 'scale-in', 1500);
    }, 300);
}
