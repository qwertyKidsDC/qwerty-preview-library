/* Retain the approved responsive cardboard scaling and scene fade. */
"use strict";

/* Scale the approved 986px desktop composition without changing its artwork.
   Responsive CSS takes over when the viewport is 760px or narrower. */
(() => {
  const updateScale = () => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const scale = Math.max(0.70, Math.min(1.85, (viewportWidth - 84) / 986));
    document.documentElement.style.setProperty('--ql-cardboard-zoom', String(scale));
    /* The nav starts at viewport y=13px; the wordmark keeps its original y.
       Compensation reverses the 19px removed from the stage's top padding. */
    document.documentElement.style.setProperty('--nav-top-compensation', (19 / scale) + 'px');
  };
  updateScale();
  window.addEventListener('resize', updateScale);
})();

/* Align the photographic fade with the live position of Coolest Projects.
   ResizeObserver handles content reflow; resize/load are safe fallbacks. */
(() => {
  const host = document.querySelector('.site');
  const project = document.getElementById('projects');
  const stage = document.querySelector('.cardboard-stage');
  if (!host || !project || !stage) return;

  const updateFade = () => {
    const relativeTop = project.getBoundingClientRect().top -
      host.getBoundingClientRect().top;
    const viewportWidth = window.innerWidth;
    const mobile = viewportWidth <= 750;
    const originalHeight = Math.max(285, Math.min(740, viewportWidth * .36));
    const photoWidth = mobile
      ? viewportWidth
      : Math.max(viewportWidth, originalHeight * 3.227799);
    const imageHeight = photoWidth * 1169 / 1346;
    const start = Math.max(
      100,
      Math.min(relativeTop - 55, imageHeight - (mobile ? 130 : 250))
    );
    const end = Math.min(start + 360, imageHeight - 2);

    host.style.setProperty('--top-fade-start', `${start}px`);
    host.style.setProperty('--top-fade-end', `${end}px`);

    [0.2, 0.5, 0.8].forEach((fraction, index) => {
      const position = start + (end - start) * fraction;
      host.style.setProperty(`--top-fade-stop${index + 1}`, `${position}px`);
    });
  };

  if ('ResizeObserver' in window) {
    new ResizeObserver(updateFade).observe(stage);
  }
  window.addEventListener('resize', updateFade);
  window.addEventListener('load', updateFade);
  updateFade();
})();

/* Meet the Lab photo rotation: approved QwertyKids website photography.
   One image per page load, with no adjacent repeat when storage is available.
   Keep the original micro:bit photo as the no-script fallback in HTML. */
(() => {
  const photo = document.querySelector('#meet-the-lab .project-photo');
  if (!photo) return;

  const photos = [
    {
      src: 'https://qwertykids.com/wp-content/uploads/coding-for-kids-gift-guide.jpg',
      alt: 'A young maker holds up a micro:bit displaying a glowing red heart'
    },
    {
      src: 'https://qwertykids.com/wp-content/uploads/code-camp-robotics-700.jpg',
      alt: 'Two QwertyKids students showing the robot they have been programming'
    },
    {
      src: 'https://qwertykids.com/wp-content/uploads/code-camp-near-me-apps-700.jpg',
      alt: 'QwertyKids students concentrating on their coding projects at the lab'
    },
    {
      src: 'https://qwertykids.com/wp-content/uploads/coding-camps-apps-700.jpg',
      alt: 'A smiling QwertyKids student working at a coding workstation'
    },
    {
      src: 'https://qwertykids.com/wp-content/uploads/kids-coding-classes-near-me-510.jpg',
      alt: 'A QwertyKids student celebrating a project at the computer'
    }
  ];

  let previous = -1;
  try { previous = Number.parseInt(sessionStorage.getItem('ql-meet-lab-last-photo'), 10); }
  catch (_) { /* Storage might be disabled; randomness still works. */ }
  const fallback = { src: photo.getAttribute('src'), alt: photo.alt };
  const candidates = photos.map((_, i) => i).filter(i => i !== previous);
  const index = candidates[Math.floor(Math.random() * candidates.length)];

  // Keep the original photograph if a rotating external image is unavailable.
  photo.addEventListener('error', () => {
    photo.alt = fallback.alt;
    photo.src = fallback.src;
  }, { once: true });
  photo.alt = photos[index].alt;
  photo.src = photos[index].src;
  try { sessionStorage.setItem('ql-meet-lab-last-photo', String(index)); }
  catch (_) { /* No storage required. */ }
})();

/* Project Code Cloud: one silent scroll play; hover or tap to replay.
   The poster remains visible before and after playback. */
(() => {
  const button = document.querySelector('#projects .cloud-replay');
  const video = button?.querySelector('video');
  if (!button || !video) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let playbackMode = null;
  let attemptId = 0;
  const idleLabel = button.getAttribute('aria-label') || 'Replay the Project Code Cloud video';
  const playingLabel = 'Stop the Project Code Cloud video';

  const reset = () => {
    // Invalidate any outstanding play() promise before hiding the video.
    attemptId += 1;
    video.pause();
    try { video.currentTime = 0; }
    catch (_) { /* Media may not be ready yet. */ }
    button.classList.remove('is-playing');
    button.setAttribute('aria-label', idleLabel);
    playbackMode = null;
  };

  const play = (mode) => {
    if (playbackMode) return;
    playbackMode = mode;
    button.setAttribute('aria-label', playingLabel);
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
  const onMotionChange = (event) => {
    if (event.matches && playbackMode && playbackMode !== 'manual') reset();
  };
  if (prefersReducedMotion.addEventListener) {
    prefersReducedMotion.addEventListener('change', onMotionChange);
  } else {
    prefersReducedMotion.addListener?.(onMotionChange);
  }

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

/* Update the copyright year automatically, retaining the 2026 HTML fallback. */
(() => {
  const year = document.getElementById('copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

/* The Acknowledgement belongs 24 visible px below the lowest footer-card
   text, not a fixed distance below the paper images. This adapts when copy,
   fonts, or the number of rows changes; CSS retains a no-JS fallback. */
(() => {
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
    const gapCorrection = (lowestCopy + 24) - panelTop;
    const zoom = Number.parseFloat(getComputedStyle(page).zoom) || 1;

    // CSS margin is in layout pixels; bounding rectangles are viewport pixels.
    // Avoid needless sub-pixel writes, which can trigger layout jitter.
    if (Math.abs(gapCorrection) > 0.35) {
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
