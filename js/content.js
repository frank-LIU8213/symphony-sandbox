import { SectionData, PlutoModelConfig } from './types.js';

const SECTIONS_DATA = [
  {
    id: 'overview',
    title: 'Overview',
    content: 'Pluto is a dwarf planet in the Kuiper belt, a ring of bodies beyond the orbit of Neptune.',
    svgId: 'pluto-model-container',
    audioCue: 'sfx-overview'
  },
  {
    id: 'structure',
    title: 'Structure',
    content: 'Pluto has a differentiated structure with a rocky core and an icy mantle.',
    svgId: 'pluto-model-container',
    audioCue: 'sfx-structure'
  },
  {
    id: 'orbit',
    title: 'Orbit',
    content: 'Pluto orbits the Sun every 248 years, sometimes coming closer than Neptune.',
    svgId: 'pluto-model-container',
    audioCue: 'sfx-orbit'
  }
];

/**
 * @returns {Promise<SectionData[]>}
 */
export async function loadSections() {
  return SECTIONS_DATA;
}

/**
 * @returns {PlutoModelConfig}
 */
export function loadPlutoData() {
  return {
    radius: 1188.3,
    rotationSpeed: 0.0001,
    layers: ["crust", "mantle", "core"],
    metadata: {
      diameter: "2376.6 km",
      mass: "1.303 × 10^22 kg",
      orbitalPeriod: "248 years"
    }
  };
}
