/* Retain the approved responsive cardboard scaling and scene fade. */
"use strict";

/* Scale the approved 986px desktop composition without changing its artwork.
   Responsive CSS takes over when the viewport is 760px or narrower. */
(() => {
  const updateScale = () => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    // The homepage messenger gets its own rail; never scale it over the artwork.
    const messengerReserve = document.querySelector('.site.has-messenger-rail') ? 260 : 0;
    const scale = Math.max(0.70, Math.min(1.85, (viewportWidth - 84 - messengerReserve) / 986));
    document.documentElement.style.setProperty('--ql-cardboard-zoom', String(scale));
    /* The nav starts at viewport y=13px; the wordmark keeps its original y.
       Compensation reverses the 19px removed from the stage's top padding. */
    document.documentElement.style.setProperty('--nav-top-compensation', (19 / scale) + 'px');
  };
  updateScale();
  window.addEventListener('resize', updateScale);
})();



/* One shared dropdown pattern for keyboard, mouse and touch navigation.
   Create the mobile Menu button here rather than copying it into every page.
   Without JavaScript, the top-level links remain visible on mobile. */
(() => {
  const nav = document.querySelector('.navigation');
  if (!nav) return;

  // One shared Enrol menu for the two dedicated form pages.
  const enrol = document.createElement('div');
  enrol.className = 'navigation-group navigation-group--enrol';
  enrol.innerHTML =
    '<button class="navigation-menu-label" type="button" aria-expanded="false" aria-controls="nav-enrol">Enrol</button>' +
    '<button class="navigation-toggle" type="button" aria-label="Show Enrol pages" aria-expanded="false" aria-controls="nav-enrol"></button>' +
    '<div class="navigation-submenu" id="nav-enrol"><div class="navigation-submenu__links">' +
      '<a href="form-classes.html">Weekly classes</a>' +
      '<a href="form-camps.html">Holiday camps</a>' +
    '</div></div>';
  nav.appendChild(enrol);

  const about = {
    'Kids overview': 'About Kids',
    'Adults overview': 'About Adults',
    'Teens overview': 'About Teens',
    'The Lab overview': 'About the Lab'
  };
  nav.querySelectorAll('.navigation-submenu__links a').forEach(link => {
    const label = link.textContent.trim();
    if (about[label]) link.textContent = about[label];
  });
  const adultInterest = nav.querySelector('.navigation-group--adults .navigation-submenu__links a:last-child');
  if (adultInterest) adultInterest.setAttribute('href', 'adults.html#form-adult');

  if (/(form-classes|form-camps)\.html$/.test(location.pathname)) {
    nav.querySelectorAll('.navigation-current, [aria-current="page"]').forEach(el => {
      el.classList.remove('navigation-current');
      el.removeAttribute('aria-current');
    });
    enrol.querySelector('.navigation-menu-label').classList.add('navigation-current');
  }
  const groups = [...nav.querySelectorAll('.navigation-group')];

  const menuButton = document.createElement('button');
  menuButton.type = 'button';
  menuButton.className = 'mobile-menu-toggle';
  menuButton.textContent = 'Menu';
  menuButton.setAttribute('aria-controls', 'site-navigation');
  menuButton.setAttribute('aria-expanded', 'false');
  nav.id = 'site-navigation';
  nav.before(menuButton);
  document.documentElement.classList.add('has-mobile-menu');

  const mobileViewport = window.matchMedia('(max-width: 760px)');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const setOpen = (activeGroup, show) => {
    for (const group of groups) {
      const expanded = group === activeGroup && show;
      group.classList.toggle('is-open', expanded);
      group.querySelector('.navigation-toggle')
        .setAttribute('aria-expanded', String(expanded));
      group.querySelector('.navigation-mobile-heading')
        .setAttribute('aria-expanded', String(expanded));
      const label = group.querySelector('.navigation-menu-label');
      if (label) label.setAttribute('aria-expanded', String(expanded));
    }
  };
  const setMenuOpen = show => {
    const expanded = show && mobileViewport.matches;
    nav.classList.toggle('is-menu-open', expanded);
    menuButton.setAttribute('aria-expanded', String(expanded));
    if (!expanded) setOpen(null, false);
  };

  menuButton.addEventListener('click', () => {
    setMenuOpen(!nav.classList.contains('is-menu-open'));
  });

  for (const group of groups) {
    const toggle = group.querySelector('.navigation-toggle');
    const parent = group.querySelector(':scope > a, :scope > .navigation-menu-label');
    if (!parent || !toggle) continue;
    const mobileHeading = document.createElement('button');
    mobileHeading.type = 'button';
    mobileHeading.className = 'navigation-mobile-heading';
    if (parent.classList.contains('navigation-current')) {
      mobileHeading.classList.add('navigation-current');
    }
    mobileHeading.textContent = parent.textContent.trim();
    mobileHeading.setAttribute('aria-controls', toggle.getAttribute('aria-controls'));
    mobileHeading.setAttribute('aria-expanded', 'false');
    group.insertBefore(mobileHeading, parent);
    mobileHeading.addEventListener('click', () => {
      setOpen(group, !group.classList.contains('is-open'));
    });
    toggle.addEventListener('click', () => {
      setOpen(group, !group.classList.contains('is-open'));
    });
    if (parent.matches('.navigation-menu-label')) {
      parent.addEventListener('click', () => {
        if (!mobileViewport.matches) setOpen(group, true);
      });
    }
    group.addEventListener('focusin', () => {
      if (!mobileViewport.matches) setOpen(group, true);
    });
    group.addEventListener('mouseenter', () => {
      if (!mobileViewport.matches && canHover.matches) setOpen(group, true);
    });
    group.addEventListener('mouseleave', () => {
      if (!mobileViewport.matches && canHover.matches &&
          !group.contains(document.activeElement)) {
        setOpen(null, false);
      }
    });
    group.addEventListener('focusout', event => {
      if (!group.contains(event.relatedTarget)) setOpen(null, false);
    });
  }

  document.addEventListener('pointerdown', event => {
    if (!nav.contains(event.target) && !menuButton.contains(event.target)) {
      setOpen(null, false);
      if (mobileViewport.matches) setMenuOpen(false);
    } else if (!event.target.closest('.navigation-group')) {
      setOpen(null, false);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const opened = groups.find(group => group.classList.contains('is-open'));
    if (opened) {
      opened.querySelector(mobileViewport.matches
        ? '.navigation-mobile-heading' : ':scope > a, :scope > .navigation-menu-label').focus();
      setOpen(null, false);
    } else if (nav.classList.contains('is-menu-open')) {
      setMenuOpen(false);
      menuButton.focus();
    }
  });
  mobileViewport.addEventListener('change', () => setMenuOpen(false));
})();

/* Home audience cards: preserve the existing accessible heading/arrow links,
   and let pointer users click anywhere on the paper. */
(() => {
  document.querySelectorAll('.feature-cards .feature').forEach(card => {
    const link = card.querySelector('h2 a');
    if (!link) return;
    card.addEventListener('click', event => {
      if (!event.target.closest('a')) link.click();
    });
  });
})();

/* The approved framed artwork varies slightly in tilt. Other frames stay fixed.
   This is shared by every subpage and needs no page-specific script. */
(() => {
  for (const [selector, minimum, maximum] of [
    ['.subpage-art--clockwise', 3, 10],
    ['.subpage-art--landscape', 2, 9]
  ]) {
    document.querySelectorAll(selector).forEach(frame => {
      const angle = minimum + Math.random() * (maximum - minimum);
      frame.style.setProperty('--tool-tilt', angle.toFixed(1) + 'deg');
    });
  }
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

/* Framed replay: one silent scroll play, silent rollover, explicit sound on supported clips.
   The poster remains visible before and after playback. */
(() => {
  const button = document.querySelector('.cloud-replay');
  const video = button?.querySelector('video');
  if (!button || !video) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let playbackMode = null;
  let attemptId = 0;
  const idleLabel = button.getAttribute('aria-label') || 'Replay the Project Code Cloud video';
  const hasSound = button.hasAttribute('data-replay-sound');
  const playingLabel = button.dataset.stopLabel || 'Stop the Project Code Cloud video';
  const poster = button.querySelector('[data-replay-poster]');
  if (poster) {
    const next = new Image();
    next.onload = () => { poster.src = next.src; poster.alt = poster.dataset.replayAlt || poster.alt; };
    next.src = poster.dataset.replayPoster;
  }

  const reset = () => {
    // Invalidate any outstanding play() promise before hiding the video.
    attemptId += 1;
    video.pause();
    video.muted = true;
    try { video.currentTime = 0; }
    catch (_) { /* Media may not be ready yet. */ }
    button.classList.remove('is-playing', 'is-sound-playing');
    button.setAttribute('aria-label', idleLabel);
    playbackMode = null;
  };

  const play = (mode) => {
    if (playbackMode) return;
    playbackMode = mode;
    video.muted = !(hasSound && mode === 'manual');
    button.setAttribute('aria-label', hasSound && mode !== 'manual' ? idleLabel : playingLabel);
    button.classList.toggle('is-sound-playing', hasSound && mode === 'manual');
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
    // An intentional click on a silent preview starts the sound-enabled replay.
    if (hasSound && playbackMode && playbackMode !== 'manual') {
      reset();
      play('manual');
      return;
    }
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

/* Newsletter design preview: no data is stored or sent. */
document.querySelectorAll('.footer-newsletter').forEach(form => {
  const output = form.querySelector('output');
  const name = form.querySelector('input[type="text"]');
  const email = form.querySelector('input[type="email"]');
  if (!output || !name || !email) return;
  form.noValidate = true;
  let attempted = false;
  const validate = () => {
    const bad = !name.value.trim() ? name : !email.value.trim() || !email.validity.valid ? email : null;
    name.removeAttribute('aria-invalid');
    email.removeAttribute('aria-invalid');
    if (bad) {
      bad.setAttribute('aria-invalid', 'true');
      output.textContent = bad === name ? 'Please enter your name.' : 'Please check your email address.';
    } else output.textContent = '';
    return bad;
  };
  form.addEventListener('input', () => {
    if (attempted) validate();
    else output.textContent = '';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    attempted = true;
    const bad = validate();
    if (bad) { bad.focus(); return; }
    output.textContent = 'Thanks, ' + name.value.trim() + '! Email: ' + email.value.trim() + '. Preview only — nothing sent.';
    attempted = false;
  });
  form.querySelector('button').disabled = false;
});

/* Keep the Acknowledgement 24 visible px below the footer-card copy,
   rather than below the paper images. This accommodates differing link lengths. */
(() => {
  const footer = document.querySelector('.cardboard-page > .lab-footer');
  const country = footer?.querySelector('.country-ack');
  const page = document.querySelector('.cardboard-page');
  const cards = document.querySelector('.footer-nav-cards');
  if (!footer || !country || !page || !cards) return;

  const copySelector = '.footer-nav-card h2, .footer-nav-card .footer-card-links, .footer-nav-card .footer-card-address, .footer-newsletter';
  let pending = false;
  const update = () => {
    pending = false;
    const copy = [...cards.querySelectorAll(copySelector)];
    if (!copy.length) return;
    const lowestCopy = Math.max(...copy.map(el => el.getBoundingClientRect().bottom));
    const panelTop = country.getBoundingClientRect().top;
    const correction = (lowestCopy + 24) - panelTop;
    const zoom = Number.parseFloat(getComputedStyle(page).zoom) || 1;
    if (Math.abs(correction) > 0.35) {
      const current = Number.parseFloat(getComputedStyle(footer).marginTop) || 0;
      footer.style.marginTop = (current + correction / zoom) + 'px';
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

/* Hero rotation: desktop uses every approved scene, while mobile rotates
   medium-height compositions that share a similar visual footprint. */
(() => {
  // Keep the independently approved test pages isolated from production behaviour.
  if (document.documentElement.hasAttribute('data-hero-rotation-experiment')) return;
  const hero = document.querySelector('.hero img.mascots');
  if (!hero) return;

  const allScenes = [
    { id: 'S05-R1C1-robot-workshop', src: 'img/hero-rotation-v2/S05-R1C1-robot-workshop.webp', alt: 'Q Key, Six Pin and D1 building a cardboard robot in their workshop' },
    { id: 'S05-R1C2-weather-station', src: 'img/hero-rotation-v2/S05-R1C2-weather-station.webp', alt: 'Q Key, Six Pin and D1 testing a handmade weather station' },
    { id: 'S05-R1C4-control-console', src: 'img/hero-rotation-v2/S05-R1C4-control-console.webp', alt: 'Q Key, Six Pin and D1 operating a cardboard control console' },
    { id: 'S05-R2C1-submarine-controls', src: 'img/hero-rotation-v2/S05-R2C1-submarine-controls.webp', alt: 'Q Key, Six Pin and D1 using a cardboard submarine control station' },
    { id: 'S05-R2C2-smart-speaker', src: 'img/hero-rotation-v2/S05-R2C2-smart-speaker.webp', alt: 'Q Key, Six Pin and D1 making a smart speaker' },
    { id: 'S05-R2C3-virtual-reality', src: 'img/hero-rotation-v2/S05-R2C3-virtual-reality.webp', alt: 'Q Key, Six Pin and D1 experimenting with virtual reality' },
    { id: 'S05-R3C1-robot-arm', src: 'img/hero-rotation-v2/S05-R3C1-robot-arm.webp', alt: 'Q Key, Six Pin and D1 building a cardboard robotic arm' },
    { id: 'S05-R3C2-drawing-tablet', src: 'img/hero-rotation-v2/S05-R3C2-drawing-tablet.webp', alt: 'Q Key, Six Pin and D1 drawing on a tablet' },
    { id: 'S05-R4C1-colourful-pinball', src: 'img/hero-rotation-v2/S05-R4C1-colourful-pinball.webp', alt: 'Q Key, Six Pin and D1 playing a colourful pinball game' },
    { id: 'S07-R1C1-workshop-device', src: 'img/hero-rotation-v2/S07-R1C1-workshop-device.webp', alt: 'Q Key, Six Pin and D1 making an electronic workshop device' },
    { id: 'S07-R4C1-satellite-link', src: 'img/hero-rotation-v2/S07-R4C1-satellite-link.webp', alt: 'Q Key, Six Pin and D1 testing a satellite link' },
    { id: 'S07-R5C2-rocket-control', src: 'img/hero-rotation-v2/S07-R5C2-rocket-control.webp', alt: 'Q Key, Six Pin and D1 using a rocket control console' },
    { id: 'S02-R1C2-virtual-reality', src: 'img/hero-rotation-v2/S02-R1C2-virtual-reality.webp', alt: 'Q Key, Six Pin and D1 trying a virtual reality headset' },
    { id: 'S02-R2C1-solar-rover', src: 'img/hero-rotation-v2/S02-R2C1-solar-rover.webp', alt: 'Q Key, Six Pin and D1 testing a solar-powered rover' },
    { id: 'S02-R2C2-drawing-plotter', src: 'img/hero-rotation-v2/S02-R2C2-drawing-plotter.webp', alt: 'Q Key, Six Pin and D1 operating a drawing plotter' },
    { id: 'S02-R2C3-keyboard-synthesiser', src: 'img/hero-rotation-v2/S02-R2C3-keyboard-synthesiser.webp', alt: 'Q Key, Six Pin and D1 playing an electronic keyboard synthesiser' },
    { id: 'S02-R3C3-arcade-machine', src: 'img/hero-rotation-v2/S02-R3C3-arcade-machine.webp', alt: 'Q Key, Six Pin and D1 playing a cardboard arcade machine' },
    { id: 'S02-R3C4-shadow-theatre', src: 'img/hero-rotation-v2/S02-R3C4-shadow-theatre.webp', alt: 'Q Key, Six Pin and D1 making a cardboard shadow theatre' },
    { id: 'S04-R1C1-computer-game', src: 'img/hero-rotation-v2/S04-R1C1-computer-game.webp', alt: 'Q Key, Six Pin and D1 working on a computer game' },
    { id: 'S04-R2C1-robot-car', src: 'img/hero-rotation-v2/S04-R2C1-robot-car.webp', alt: 'Q Key, Six Pin and D1 making a robot car' },
    { id: 'S04-R2C2-led-circuit', src: 'img/hero-rotation-v2/S04-R2C2-led-circuit.webp', alt: 'Q Key, Six Pin and D1 testing a colourful LED circuit' },
    { id: 'S04-R4C1-music-speaker', src: 'img/hero-rotation-v2/S04-R4C1-music-speaker.webp', alt: 'Q Key, Six Pin and D1 making music with a cardboard speaker' }
  ];
  // Keep tall silhouettes (rocket, submarine, weather tower) and short,
  // low-sitting scenes (including musical notes) in the desktop rotation.
  const mobileSceneIds = new Set([
    'S05-R1C1-robot-workshop',
    'S05-R1C4-control-console',
    'S05-R2C2-smart-speaker',
    'S05-R2C3-virtual-reality',
    'S05-R3C1-robot-arm',
    'S05-R3C2-drawing-tablet',
    'S05-R4C1-colourful-pinball',
    'S07-R1C1-workshop-device'
  ]);
  const mobileViewport = window.matchMedia('(max-width: 760px)');
  const isMobile = mobileViewport.matches;
  const mobileScenes = allScenes.filter(scene => mobileSceneIds.has(scene.id));
  const scenes = isMobile ? mobileScenes : allScenes;
  // Separate shuffle bags so switching viewport size does not reset desktop.
  const storageKey = isMobile
    ? 'qwertylabs-hero-production-bag-v6-mobile'
    : 'qwertylabs-hero-production-bag-v5';
  const ids = scenes.map(scene => scene.id);
  const allowed = new Set(ids);
  let previous = {};
  try {
    previous = JSON.parse(sessionStorage.getItem(storageKey) || '{}') || {};
  } catch (_error) {
    // Browsers blocking storage can still display one randomly selected hero.
  }

  let order = Array.isArray(previous.order) ? previous.order : [];
  let index = Number.isInteger(previous.index) ? previous.index : 0;
  const valid = order.length === scenes.length &&
    new Set(order).size === scenes.length && order.every(id => allowed.has(id));

  if (!valid || index < 0 || index >= order.length) {
    order = [...ids];
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    if (order.length > 1 && order[0] === previous.last) {
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
    // No persistent shuffle if storage is blocked, but the image still works.
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
  hero.dataset.heroScene = selected.id;

  // Narrowing a desktop window should not leave a tall desktop-only scene
  // in the mobile layout. The normal shuffle applies again on the next load.
  mobileViewport.addEventListener('change', () => {
    if (!mobileViewport.matches || mobileSceneIds.has(hero.dataset.heroScene)) return;
    const replacement = mobileScenes[Math.floor(Math.random() * mobileScenes.length)];
    hero.src = replacement.src;
    hero.alt = replacement.alt;
    hero.dataset.heroScene = replacement.id;
  });
})();

/* Footer fun: rotate approved no-tech mascot cut-outs without repeats. */
(() => {
  const mascot = document.querySelector('.lab-footer .country-ack__mascot');
  if (!mascot) return;

  const choices = [
    '01_Q_skateboard',
    '02_Q_beanbag',
    '04_Six_D1_sitting_around',
    '07_Six_D1_popcorn',
    '11_Q_Six_skateboards',
    '13_Six_D1_wagon',
    '15_Q_cardboard_blocks',
    '18_D1_cardboard_tent',
    '19_Six_lying_on_tummy',
    '21_Q_paper_nest'
  ];
  const storageKey = 'qwertylabs-footer-fun-bag-v1';
  let saved = {};
  try {
    saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}') || {};
  } catch (_error) {
    // Private browsing can still show a random mascot.
  }

  let order = saved.order;
  let index = saved.index;
  const valid = Array.isArray(order) &&
    order.length === choices.length &&
    new Set(order).size === choices.length &&
    order.every(choice => choices.includes(choice));

  if (!valid || !Number.isInteger(index) || index < 0 || index >= choices.length) {
    order = [...choices];
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    if (order.length > 1 && order[0] === saved.last) {
      [order[0], order[1]] = [order[1], order[0]];
    }
    index = 0;
  }

  const selected = order[index];
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({
      order, index: index + 1, last: selected
    }));
  } catch (_error) {
    // Keep the rotation working even when storage is disabled.
  }

  const fallback = mascot.getAttribute('src');
  mascot.addEventListener('error', () => {
    mascot.src = fallback;
  }, { once: true });
  mascot.src = 'img/footer-rotation/' + selected + '.svg';
})();

