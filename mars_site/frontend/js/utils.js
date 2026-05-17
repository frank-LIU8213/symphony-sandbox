export async function fetchMarsData() {
    const res = await fetch('/api/mars/data');
    if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
    return res.json();
}

export async function fetchSounds() {
    const res = await fetch('/api/mars/sounds');
    if (!res.ok) throw new Error(`Failed to fetch sounds: ${res.status}`);
    return res.json();
}

export function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

export function safeQuery(selector, parent = document) {
    return parent.querySelector(selector);
}

export function safeQueryAll(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}
