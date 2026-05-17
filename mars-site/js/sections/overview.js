import { registerSection } from '../engine.js';

/**
 * @returns {import('../engine.js').SectionConfig}
 */
export function createOverviewSection() {
  return {
    id: 'overview',
    /** @returns {void} */
    init() {
      // TODO: Setup Mars overview SVG animations
    },
    /** @returns {void} */
    cleanup() {
      // TODO: Cleanup overview animations
    }
  };
}

registerSection(createOverviewSection());