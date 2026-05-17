export async function fetchMarsData() {
    const res = await fetch('/api/mars/data');
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
}

export async function fetchSounds() {
    const res = await fetch('/api/mars/sounds');
    if (!res.ok) throw new Error('Failed to fetch sounds');
    return res.json();
}

export function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
