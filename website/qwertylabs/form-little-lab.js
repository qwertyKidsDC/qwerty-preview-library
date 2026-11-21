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

  function messageFor(stage, names, siblings, returning) {
    var named = names.length ? joinNames(names) : '';
    if (stage === 4) return 'Looking good from here!';
    if (stage === 3) return 'Almost there!';
    if (stage === 2) {
      if (!named) return returning
        ? 'Excitement! Your family is back for more making.'
        : 'Excitement! New makers are on their way.';
      return 'Excitement! ' + named + (names.length === 1 ? ' is' : ' are') +
        ' on the way.' + (returning ? ' Back for more making!' : '');
    }
    if (stage === 1) {
      if (!named) return returning
        ? 'Who’s making things with us this time?'
        : 'Who’s the young maker joining us?';
      if (names.length < siblings) return named + '! Who else is joining?';
      var cheers = { 2: 'Double yay', 3: 'Triple yay', 4: 'Quadruple yay' };
      if (returning) {
        return (names.length === 1 ? 'It’s ' : '') + named + '! ' +
          (names.length === 1 ? 'Yay' : cheers[names.length]) +
          ', lovely to see your family again.';
      }
      if (names.length === 1) return 'It’s ' + named + '! Yay, a new maker to meet.';
      var counts = { 2: 'two', 3: 'three', 4: 'four' };
      return named + '! ' + cheers[names.length] + ', ' + counts[names.length] + ' new makers to meet.';
    }
    return returning
      ? 'Ooh, a familiar family! Welcome back.'
      : 'Ooh, someone’s about to enrol.';
  }

  function refresh() {
    var stage = previewStage();
    var names = childNames();
    var siblings = app.querySelectorAll('.qlf-child').length;
    var familySelect = app.querySelector('#family-type');
    var returning = familySelect && familySelect.value === 'returning';
    bubble.textContent = messageFor(stage, names, siblings, returning);
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
