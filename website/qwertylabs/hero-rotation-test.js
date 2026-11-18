/* TEST ONLY: curated hero rotation; the production site pages are unchanged.
   Each page load uses the next item from a shuffled bag shared by the two test pages.
   CSS and the original fallback <img> remain intact. */
"use strict";
(() => {
  const hero = document.querySelector('.hero img.mascots');
  if (!hero) return;

  const scenes = [
    {
      id: 'robot-workshop',
      src: 'img/hero-rotation-test/robot-workshop.webp',
      alt: 'Q Key, Six Pin and D1 building a cardboard robot together'
    },
    {
      id: 'control-console',
      src: 'img/hero-rotation-test/control-console.webp',
      alt: 'Q Key, Six Pin and D1 operating a handmade electronics control console'
    },
    {
      id: 'smart-speaker',
      src: 'img/hero-rotation-test/smart-speaker.webp',
      alt: 'Q Key, Six Pin and D1 experimenting with a cardboard smart speaker'
    },
    {
      id: 'wind-turbine',
      src: 'img/hero-rotation-test/wind-turbine.webp',
      alt: 'Q Key, Six Pin and D1 making a small wind turbine with electronics'
    },
    {
      id: 'weather-station',
      src: 'img/hero-rotation-test/weather-station.webp',
      alt: 'Q Key, Six Pin and D1 testing a handmade weather station'
    }
  ];
  const storageKey = 'qwertylabs-hero-test-bag-v1';
  const allowed = new Set(scenes.map(scene => scene.id));
  let state = {};
  try {
    state = JSON.parse(sessionStorage.getItem(storageKey) || '{}') || {};
  } catch (_error) {
    state = {};
  }

  let order = Array.isArray(state.order) ? state.order : [];
  let index = Number.isInteger(state.index) ? state.index : 0;
  const valid = order.length === scenes.length &&
    new Set(order).size === scenes.length && order.every(id => allowed.has(id));

  if (!valid || index < 0 || index >= order.length) {
    order = [...allowed];
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    // Avoid showing the previous scene again on a new cycle.
    if (order.length > 1 && order[0] === state.last) {
      [order[0], order[1]] = [order[1], order[0]];
    }
    index = 0;
  }

  const selectedId = order[index];
  const selected = scenes.find(scene => scene.id === selectedId);
  if (!selected) return;
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({
      order, index: index + 1, last: selectedId
    }));
  } catch (_error) {
    // The hero still works if session storage is unavailable.
  }

  const fallbackSrc = hero.getAttribute('src');
  const fallbackAlt = hero.getAttribute('alt');
  hero.onerror = () => {
    hero.onerror = null;
    hero.src = fallbackSrc;
    hero.alt = fallbackAlt;
  };
  hero.src = selected.src;
  hero.alt = selected.alt;
  hero.dataset.heroTest = selectedId;
})();