/* The Lab Messengers: one announcement, one link, one expiry.
   The same element moves between the inline slot and its own desktop rail.
   Nothing floats over the site, and there is no scroll animation. */
"use strict";
(() => {
  const note = document.querySelector('[data-home-messenger]');
  const inline = document.querySelector('[data-messenger-inline]');
  const rail = document.querySelector('[data-messenger-rail]');
  const site = document.querySelector('.site');
  if (!note || !inline || !rail || !site) return;

  const expires = Date.parse(note.dataset.expires || '');
  const wide = window.matchMedia('(min-width:1200px) and (min-height:420px)');
  const update = () => {
    const enabled = note.dataset.enabled === 'true' &&
      (!Number.isFinite(expires) || Date.now() < expires);
    note.hidden = !enabled;
    const useRail = enabled && wide.matches;
    site.classList.toggle('has-messenger-rail', useRail);
    const destination = useRail ? rail : inline;
    if (note.parentElement !== destination) destination.appendChild(note);
  };
  // This script runs before script.js, which reads the rail state when scaling.
  update();
  window.addEventListener('resize', update);
  window.addEventListener('pageshow', () => {
    update();
    window.dispatchEvent(new Event('resize'));
  });
})();
