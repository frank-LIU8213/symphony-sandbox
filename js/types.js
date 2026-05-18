/** @typedef {Object} AnimationState */
/** @property {string} id */
/** @property {number} duration */
/** @property {string[]} keyframes */

/** @typedef {Object} AudioAsset */
/** @property {string} id */
/** @property {string} src */
/** @property {'sfx'|'ambient'} type */

/** @typedef {Object} SectionData */
/** @property {string} id */
/** @property {string} title */
/** @property {string} content */
/** @property {string} svgId */
/** @property {string} audioCue */
/** @property {string} [highlightLayer] */

/** @typedef {Object} PlutoModelConfig */
/** @property {number} radius */
/** @property {number} rotationSpeed */
/** @property {string[]} layers */
/** @property {Record<string, string>} metadata */

export {};