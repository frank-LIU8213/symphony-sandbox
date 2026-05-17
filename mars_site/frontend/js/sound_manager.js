export function loadSoundManifest(url) {
    console.log(`Loading sound manifest from ${url}`);
    return Promise.resolve([]);
}

export function registerSoundTrigger(eventId, soundUrl) {
    console.log(`Registered trigger ${eventId} -> ${soundUrl}`);
}

export function playAmbientLoop(loopId) {
    console.log(`Playing ambient loop: ${loopId}`);
}
