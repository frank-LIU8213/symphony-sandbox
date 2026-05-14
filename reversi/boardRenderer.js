export class BoardRenderer {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.onCellClick = options.onCellClick || (() => {});
    this._buildDOM();
  }

  _buildDOM() {
    // Create board element with id="board" and append to container
    // Each cell gets class "cell"
    // Leaves implementation to worker
    throw new Error('Not implemented');
  }

  render(board, validMoves = []) {
    // Update cell classes and disc elements to reflect board state
    throw new Error('Not implemented');
  }

  highlightFlipping(cells) {
    // Add class 'disc--flipping' to discs at given positions, remove after 300ms
    throw new Error('Not implemented');
  }

  destroy() {
    throw new Error('Not implemented');
  }
}
