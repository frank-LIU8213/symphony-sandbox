import { registerSection } from '../engine.js';

/**
 * @returns {import('../engine.js').SectionConfig}
 */
export function createSurfaceSection() {
  return {
    id: 'surface',
    /** @returns {void} */
    init() {
      // TODO: Setup surface parallax & audio triggers
    },
    /** @returns {void} */
    cleanup() {
      // TODO: Cleanup surface animations & audio
    }
  };
}

registerSection(createSurfaceSection());