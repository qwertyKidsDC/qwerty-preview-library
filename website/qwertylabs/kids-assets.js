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
