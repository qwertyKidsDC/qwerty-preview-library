/* Display existing approved mascots only if the new Kids PNG is not yet deployed. */
"use strict";
(() => {
  const fallbacks = [
    ['.hero .mascots', 'img/mascot-making-led-crisp.svg?v=full-res-20261106'],
    ['.country-ack__mascot', 'img/d1-country-lounging.svg']
  ];
  for (const [selector, fallback] of fallbacks) {
    const image = document.querySelector(selector);
    if (!image) continue;
    image.addEventListener('error', () => {
      if (!image.dataset.fallbackApplied) {
        image.dataset.fallbackApplied = 'true';
        image.src = fallback;
      }
    });
    if (image.complete && image.naturalWidth === 0) {
      image.dispatchEvent(new Event('error'));
    }
  }
})();

/* Keep the equipment casually scattered: angles change on each page load.
   Rotation changes only a CSS variable; size and alignment remain stable. */
(() => {
  const tilts = [
    ['codey', 3, 10],
    ['gamego', -12, -4],
    ['microbit', -5, 7],
    ['raspberry', -9, -2]
  ];
  for (const [name, minimum, maximum] of tilts) {
    const frame = document.querySelector('.kids-tool--' + name);
    if (!frame) continue;
    const angle = minimum + Math.random() * (maximum - minimum);
    frame.style.setProperty('--tool-tilt', angle.toFixed(1) + 'deg');
  }
})();
