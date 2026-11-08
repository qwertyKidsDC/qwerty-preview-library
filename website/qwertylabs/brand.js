/* Qwerty Labs paired cursors. One CSS theme token selects the colour.
   Wordmarks are static HTML assets; they work even without JavaScript. */
"use strict";

(() => {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const token = name => style.getPropertyValue(name).trim();
  const accent = token('--brand-accent');
  const ivory = token('--color-ivory');
  const ink = token('--color-ink');
  if (!accent || !ivory || !ink) return;

  const arrow = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="32" viewBox="0 0 26 32">
    <path d="M2 1 L2 25 L8 19 L13 29 L18 26 L13 16 L23 16 Z"
      fill="${accent}" stroke="${ivory}" stroke-width="2" stroke-linejoin="round"/>
  </svg>`;
  const hand = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="40" viewBox="0 0 36 40">
    <path d="M11 17V6a3.5 3.5 0 0 1 7 0v10-3a3.25 3.25 0 0 1 6.5 0v3-1a3.25 3.25 0 0 1 6.5 0v5h1.5a3 3 0 0 1 3 3v6.5a8 8 0 0 1-8 8H16a8 8 0 0 1-6.6-3.5L2 23.5a3.25 3.25 0 0 1 5.4-3.6L11 24Z"
      fill="${accent}" stroke="${ink}" stroke-width="2"
      stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
  const cursor = (svg, x, y, fallback) =>
    `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${x} ${y}, ${fallback}`;

  root.style.setProperty('--ql-arrow-cursor', cursor(arrow, 2, 1, 'auto'));
  root.style.setProperty('--ql-hand-cursor', cursor(hand, 15, 3, 'pointer'));
  root.classList.add('ql-brand-cursor');
})();
