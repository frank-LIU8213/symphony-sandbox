export function renderContentSection(containerId, data) {
    console.log(`Rendering section ${containerId}`);
}

export function createFactCard(fact) {
    console.log(`Creating fact card: ${fact.title}`);
    return document.createElement('div');
}

export function bindDataToElements(data) {
    console.log('Binding data to DOM elements');
}
