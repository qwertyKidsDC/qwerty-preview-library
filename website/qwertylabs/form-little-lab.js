/* The Little Lab: visual companion for the existing Kids enrolment preview.
   Local, non-persistent UI only. No network, storage, submission or payment. */
(function () {
  'use strict';
  var app = document.querySelector('[data-qlf-app]');
  var companion = document.querySelector('[data-little-lab]');
  if (!app || !companion) return;

  var bubble = companion.querySelector('[data-lab-speech]');
  var counter = companion.querySelector('[data-lab-counter]');
  var phases = companion.querySelectorAll('[data-led]');
  var traces = companion.querySelectorAll('[data-wire]');
  var glows = companion.querySelectorAll('[data-glow]');

  function previewStage() {
    var done = app.querySelector('.qlf-done');
    if (done && !done.hidden) return 4;
    var current = app.querySelector('.qlf-step:not([hidden])');
    return current ? Number(current.getAttribute('data-step')) : 0;
  }

  function childNames() {
    return Array.from(app.querySelectorAll('.qlf-child input[name$="-first"]'))
      .map(function (field) {
        // Only the children's own first-name fields; never the parent's name.
        return Array.from(field.value.trim().replace(/\s+/g, ' ')).slice(0, 24).join('');
      })
      .filter(Boolean);
  }

  function joinNames(names) {
    if (names.length === 1) return names[0];
    if (names.length === 2) return names[0] + ' and ' + names[1];
    return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  }

  function messageFor(stage, names, siblings) {
    var named = names.length ? joinNames(names) : '';
    if (stage === 4) return 'Circuit complete! Just a test drive, though — no booking has been made.';
    if (stage === 3) return 'One last look. Even robots double-check their wiring.';
    if (stage === 2) return named
      ? 'The details for ' + named + ' are taking shape. So is our little machine.'
      : 'Two connections down. The little machine is waking up.';
    if (stage === 1) {
      if (!named) return 'Who’s the young maker joining the experiment?';
      if (names.length < siblings) return named + '! Who else is joining?';
      return named + '! ' + (names.length === 1 ? 'A new maker to meet.' : ['', '', 'Two', 'Three', 'Four'][names.length] + ' new makers to meet.') + ' Six Pin is intrigued.';
    }
    return 'Psst. There’s a little machine in here.';
  }

  function refresh() {
    var stage = previewStage();
    var names = childNames();
    var siblings = app.querySelectorAll('.qlf-child').length;
    bubble.textContent = messageFor(stage, names, siblings);
    counter.textContent = stage + ' of 4 connections';
    companion.setAttribute('data-phase', String(stage));
    phases.forEach(function (el) {
      el.classList.toggle('is-on', Number(el.getAttribute('data-led')) <= stage);
    });
    traces.forEach(function (el) {
      el.classList.toggle('is-on', Number(el.getAttribute('data-wire')) <= stage);
    });
    glows.forEach(function (el, index) {
      el.classList.toggle('is-on', index < stage);
    });
  }

  app.addEventListener('input', refresh);
  app.addEventListener('change', refresh);
  // The shared form owns step changes. Observe its accessible status updates,
  // rather than modifying the form engine or inserting duplicate progress logic.
  var status = document.getElementById('qlf-status');
  if (status) {
    new MutationObserver(refresh).observe(status, { childList: true, characterData: true, subtree: true });
  }
  // Adding or removing a sibling should update the greeting, too.
  var children = document.getElementById('qlf-children');
  if (children) {
    new MutationObserver(refresh).observe(children, { childList: true });
  }
  refresh();
})();
