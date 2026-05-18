import { SectionData, PlutoModelConfig } from './types.js';

const SECTIONS_DATA = [
  {
    id: 'overview',
    title: '冥王星概览',
    content: '<p>冥王星是柯伊伯带中的一颗矮行星，直径约2376.6公里。它是太阳系第九大天体，也是海王星轨道外众多冰质天体中最著名的一个。</p><p>冥王星的质量约为1.303 × 10^22千克，约为月球质量的1/6。</p>',
    svgId: 'pluto-model-container',
    audioCue: 'sfx-overview'
  },
  {
    id: 'structure',
    title: '内部结构',
    content: '<p>冥王星具有分异结构，由岩石核心和冰质地幔组成。</p><ul><li><strong>地壳</strong>：厚度约100–170公里，由水冰和岩石组成</li><li><strong>地幔</strong>：厚度约170公里，由水冰和氨水合物组成</li><li><strong>核心</strong>：厚度约350公里，由岩石和金属组成</li></ul>',
    svgId: 'pluto-model-container',
    audioCue: 'sfx-structure',
    highlightLayer: 'crust'
  },
  {
    id: 'orbit',
    title: '轨道特征',
    content: '<p>冥王星绕太阳公转周期为248年，有时比海王星更靠近太阳。</p><p>冥王星的轨道是高度椭圆的，离心率约为0.25，倾角约为17度。</p>',
    svgId: 'pluto-model-container',
    audioCue: 'sfx-orbit'
  },
  {
    id: 'atmosphere',
    title: '大气层',
    content: '<p>冥王星的大气层非常稀薄，主要由氮、甲烷和一氧化碳组成。</p><p>表面温度约为−230°C，大气层在冥王星远离太阳时会部分冻结并降落。</p>',
    svgId: 'pluto-model-container',
    audioCue: 'sfx-structure',
    highlightLayer: 'mantle'
  },
  {
    id: 'moons',
    title: '卫星系统',
    content: '<p>冥王星有5颗已知的卫星：卡戎（Charon）、尼克斯（Nix）、许德拉（Hydra）、科伯罗斯（Kerberos）和斯堤克斯（Styx）。</p><p>其中卡戎最大，直径约1212公里，约为冥王星的一半大小。</p>',
    svgId: 'pluto-model-container',
    audioCue: 'sfx-orbit'
  },
  {
    id: 'discovery',
    title: '发现历史',
    content: '<p>冥王星于1930年由克莱德·汤博（Clyde Tombaugh）发现。</p><p>2006年，国际天文学联合会将冥王星重新分类为矮行星。</p>',
    svgId: 'pluto-model-container',
    audioCue: 'sfx-overview'
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
    layers: ['crust', 'mantle', 'core'],
    metadata: {
      diameter: '2376.6 km',
      mass: '1.303 × 10^22 kg',
      orbitalPeriod: '248 years'
    }
  };
}
