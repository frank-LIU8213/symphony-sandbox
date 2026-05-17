export function createFactCard(fact) {
    const card = document.createElement('div');
    card.className = 'fact-card';
    card.setAttribute('data-fact-id', fact.id);

    // Title
    const title = document.createElement('h2');
    title.className = 'fact-card__title';
    title.textContent = fact.title;
    card.appendChild(title);

    // Description
    const description = document.createElement('p');
    description.className = 'fact-card__description';
    description.textContent = fact.description;
    card.appendChild(description);

    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'fact-card__image';
    const img = document.createElement('img');
    img.src = fact.image_url;
    img.alt = fact.title;
    img.loading = 'lazy';
    imageContainer.appendChild(img);
    card.appendChild(imageContainer);

    // Facts list
    const factsList = document.createElement('ul');
    factsList.className = 'fact-card__list';
    fact.facts.forEach(factItem => {
        const li = document.createElement('li');
        li.textContent = factItem;
        factsList.appendChild(li);
    });
    card.appendChild(factsList);

    return card;
}

export function renderContentSection(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Create section wrapper
    const section = document.createElement('section');
    section.className = 'content-section';
    section.setAttribute('data-section-id', data.id);

    // Render fact card
    const card = createFactCard(data);
    section.appendChild(card);

    container.appendChild(section);
}

export function bindDataToElements(data) {
    const container = document.getElementById('content-area');
    if (!container) {
        console.error('Content area container not found');
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Create grid wrapper
    const grid = document.createElement('div');
    grid.className = 'content-grid';

    // Render each data item as a section
    data.forEach(item => {
        const section = document.createElement('section');
        section.className = 'content-section';
        section.setAttribute('data-section-id', item.id);

        const card = createFactCard(item);
        section.appendChild(card);
        grid.appendChild(section);
    });

    container.appendChild(grid);
}
