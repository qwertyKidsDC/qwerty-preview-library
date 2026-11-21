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

  function firstName() {
    var first = app.querySelector('#child-0-first');
    if (!first) return '';
    // Keep it brief, literal, and entirely local to the page.
    var typed = first.value.trim().replace(/\s+/g, ' ');
    return Array.from(typed).slice(0, 24).join('');
  }

  function messageFor(stage, name, siblings) {
    if (stage === 4) return 'Circuit complete! Just a test drive, though — no booking has been made.';
    if (stage === 3) return 'One last look. Even robots double-check their wiring.';
    if (stage === 2) return name
      ? 'Looking good, ' + name + '. The little machine is waking up.'
      : 'Two connections down. The little machine is waking up.';
    if (stage === 1) return name
      ? 'Hello, ' + name + (siblings > 1 ? ' and crew' : '') + '! We like people who make things.'
      : 'Hello, future maker. What shall we call you?';
    return 'Psst. There’s a little machine in here. Shall we switch it on?';
  }

  function refresh() {
    var stage = previewStage();
    var name = firstName();
    var siblings = app.querySelectorAll('.qlf-child').length;
    bubble.textContent = messageFor(stage, name, siblings);
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
