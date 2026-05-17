import { registerSection } from '../engine.js';

/**
 * @returns {import('../engine.js').SectionConfig}
 */
export function createOrbitSection() {
  return {
    id: 'orbit',
    /** @returns {void} */
    init() {
      // TODO: Setup solar system orbit animations
    },
    /** @returns {void} */
    cleanup() {
      // TODO: Cleanup orbit animations
    }
  };
}

registerSection(createOrbitSection());