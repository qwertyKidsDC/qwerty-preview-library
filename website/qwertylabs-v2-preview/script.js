"use strict";

(() => {

/* Numbers that must agree with the stylesheets. Change them together.

   DESKTOP_MIN_WIDTH  matches the (width >= 1070px) / (width < 1070px) queries in
                      src/css/site/. From here up the 986px cardboard page is
                      scaled to fit; below it the stacked layout is shown at 1:1.
   SCENE_NARROW_MAX   matches (width <= 750px) in src/css/site/20-scene.css, where
                      the workshop photograph is cropped differently.
   The build check (_tools/check_site.py) fails if these drift from the CSS. */
const DESKTOP_MIN_WIDTH = 1070;
const SCENE_NARROW_MAX = 750;

/* Scale the approved 986px desktop composition without changing its artwork.
   The stylesheet reads --ql-cardboard-zoom only from DESKTOP_MIN_WIDTH upwards, and
   the scale never drops below 1, so text is never rendered smaller than its
   designed size. 84px = 2 x 34px of stage padding plus 16px spare. */
(() => {
  const PAGE_WIDTH = 986;
  const SIDE_ALLOWANCE = 84;
  const MAX_SCALE = 1.85;

  const updateScale = () => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const scale = Math.max(1, Math.min(MAX_SCALE, (viewportWidth - SIDE_ALLOWANCE) / PAGE_WIDTH));
    document.documentElement.style.setProperty('--ql-cardboard-zoom', String(scale));
  };
  updateScale();
  window.addEventListener('resize', updateScale);
})();

/* Align the photographic fade with the live position of the page's scene anchor
   (the element marked data-scene-anchor). Pages without one keep the CSS defaults.
   ResizeObserver handles content reflow; resize/load are safe fallbacks.

   The geometry mirrors 20-scene.css: the top photo is sized from the viewport, and
   the fade must start just above the anchor but never below the photo's own edge. */
(() => {
  const PHOTO_ASPECT = 3.227799;          /* width / height multiplier of the top crop */
  const IMAGE_RATIO = 1169 / 1346;        /* intrinsic height / width of workshop-top.webp */
  const FADE_LENGTH = 360;
  const LEAD_IN = 55;                     /* fade begins this far above the anchor */
  const MIN_START = 100;
  const FADE_STOPS = [0.2, 0.5, 0.8];     /* the three soft mid-points in 20-scene.css */

  const host = document.querySelector('.site');
  const anchor = document.querySelector('[data-scene-anchor]');
  const stage = document.querySelector('.cardboard-stage');
  if (!host || !anchor || !stage) return;

  const updateFade = () => {
    const relativeTop = anchor.getBoundingClientRect().top - host.getBoundingClientRect().top;
    const viewportWidth = window.innerWidth;
    const narrow = viewportWidth <= SCENE_NARROW_MAX;
    const originalHeight = Math.max(285, Math.min(740, viewportWidth * .36));
    const photoWidth = narrow
      ? viewportWidth
      : Math.max(viewportWidth, originalHeight * PHOTO_ASPECT);
    const imageHeight = photoWidth * IMAGE_RATIO;
    const start = Math.max(
      MIN_START,
      Math.min(relativeTop - LEAD_IN, imageHeight - (narrow ? 130 : 250))
    );
    const end = Math.min(start + FADE_LENGTH, imageHeight - 2);

    host.style.setProperty('--top-fade-start', `${start}px`);
    host.style.setProperty('--top-fade-end', `${end}px`);
    FADE_STOPS.forEach((fraction, index) => {
      host.style.setProperty(`--top-fade-stop${index + 1}`, `${start + (end - start) * fraction}px`);
    });
  };

  if ('ResizeObserver' in window) {
    new ResizeObserver(updateFade).observe(stage);
  }
  window.addEventListener('resize', updateFade);
  window.addEventListener('load', updateFade);
  updateFade();
})();

/* Project Code Cloud: one silent scroll play; hover or tap to replay.
   The poster stays visible before and after playback.
   The button keeps one name ("Play the Project Code Cloud video") and reports
   whether it is playing with aria-pressed, so screen readers hear a toggle. */
(() => {
  const button = document.querySelector('.cloud-replay');
  const video = button?.querySelector('video');
  if (!button || !video) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let playbackMode = null;   /* null | 'intro' | 'hover' | 'manual' */
  let attemptId = 0;

  const setPressed = (isPlaying) => button.setAttribute('aria-pressed', String(isPlaying));

  const reset = () => {
    // Invalidate any outstanding play() promise before hiding the video.
    attemptId += 1;
    video.pause();
    try { video.currentTime = 0; }
    catch (_) { /* Media may not be ready yet. */ }
    button.classList.remove('is-playing');
    setPressed(false);
    playbackMode = null;
  };

  const play = (mode) => {
    if (playbackMode) return;
    playbackMode = mode;
    setPressed(true);
    const currentAttempt = ++attemptId;
    try { video.currentTime = 0; }
    catch (_) { /* Playback will still start from the beginning. */ }
    try {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        // A late rejection must not interrupt a newer manual replay.
        attempt.catch(() => {
          if (currentAttempt === attemptId) reset();
        });
      }
    } catch (_) {
      // Older media implementations may throw instead of rejecting.
      if (currentAttempt === attemptId) reset();
    }
  };

  video.addEventListener('playing', () => {
    // Ignore a delayed media event after the viewer stops playback.
    if (!playbackMode) { video.pause(); return; }
    button.classList.add('is-playing');
  });
  video.addEventListener('ended', reset);
  video.addEventListener('error', reset);

  button.addEventListener('mouseenter', () => {
    if (canHover.matches && !prefersReducedMotion.matches) play('hover');
  });
  button.addEventListener('mouseleave', () => {
    if (playbackMode === 'hover') reset();
  });
  button.addEventListener('click', () => {
    // Click while playing means stop, not restart.
    if (playbackMode) { reset(); return; }
    play('manual');
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playbackMode) reset();
  });
  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches && playbackMode && playbackMode !== 'manual') reset();
  });

  // Only one automatic attempt per page load, after enough of the image is visible.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.45)) return;
      observer.disconnect();
      if (!prefersReducedMotion.matches) play('intro');
    }, { threshold: 0.45 });
    observer.observe(button);
  }
})();

/* Keep the copyright year current. The built HTML carries a fallback year
   (copyright_year in site.config.json) for visitors without JavaScript. */
(() => {
  const year = document.getElementById('copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

/* The Acknowledgement panel sits FOOTER_GAP visible pixels below the lowest
   footer-card text, not a fixed distance below the paper images. That adapts to
   copy, fonts and row count. CSS keeps a no-JS fallback (--country-overlap). */
(() => {
  const FOOTER_GAP = 24;       /* visible px between card text and the panel */
  const TOLERANCE = 0.35;      /* ignore sub-pixel noise; it causes layout jitter */

  const footer = document.querySelector('.cardboard-page > .lab-footer');
  const country = footer?.querySelector('.country-ack');
  const page = document.querySelector('.cardboard-page');
  const cards = document.querySelector('.footer-nav-cards');
  if (!footer || !country || !page || !cards) return;

  const copySelector = '.footer-nav-card h2, .footer-nav-card .footer-card-links, .footer-nav-card .footer-card-address';
  let pending = false;

  const update = () => {
    pending = false;
    const copy = [...cards.querySelectorAll(copySelector)];
    if (!copy.length) return;
    const lowestCopy = Math.max(...copy.map(el => el.getBoundingClientRect().bottom));
    const panelTop = country.getBoundingClientRect().top;
    const gapCorrection = (lowestCopy + FOOTER_GAP) - panelTop;
    const zoom = Number.parseFloat(getComputedStyle(page).zoom) || 1;

    // CSS margin is in layout pixels; bounding rectangles are viewport pixels.
    if (Math.abs(gapCorrection) > TOLERANCE) {
      const current = Number.parseFloat(getComputedStyle(footer).marginTop) || 0;
      footer.style.marginTop = (current + gapCorrection / zoom) + 'px';
    }
  };

  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(update);
  };

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    observer.observe(cards);
    cards.querySelectorAll(copySelector).forEach(el => observer.observe(el));
  }
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  document.fonts?.ready?.then(schedule);
  schedule();
})();

})();
