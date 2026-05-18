/** @type {Map<string, AnimationState>} */
const animationRegistry = new Map();

/**
 * @param {AnimationState} config
 */
export function registerAnimation(config) {
  animationRegistry.set(config.id, config);
}

/**
 * @param {string} id
 */
export function trigger(id) {
  const config = animationRegistry.get(id);
  if (!config) return;

  const elements = document.querySelectorAll(`[data-anim-id="${id}"]`);
  if (elements.length === 0) return;

  elements.forEach(el => {
    el.classList.remove('anim-active');
    void el.offsetWidth;
    el.classList.add('anim-active');

    const stepDuration = config.duration / config.keyframes.length;
    config.keyframes.forEach((kf, index) => {
      setTimeout(() => {
        el.classList.add(kf);
        setTimeout(() => {
          el.classList.remove(kf);
        }, stepDuration);
      }, index * stepDuration);
    });
  });
}

export function cleanup() {
  animationRegistry.clear();
  document.querySelectorAll('.anim-active').forEach(el => {
    el.classList.remove('anim-active');
  });
}
