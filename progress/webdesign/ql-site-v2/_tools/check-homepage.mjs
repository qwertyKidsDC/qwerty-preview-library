/**
 * Qwerty Labs v2 — dependency-free source quality checks.
 *
 * This is a static check, not a substitute for a browser, CSS validator or
 * accessibility audit. Run from any directory with Node.js 20 or later:
 *   node progress/webdesign/ql-site-v2/_tools/check-homepage.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'style-home.css'), 'utf8');
const js = readFileSync(join(root, 'script.js'), 'utf8');
const errors = [];

const matches = (source, pattern) =>
  [...source.matchAll(pattern)].map(match => match[1]);

const htmlClasses = new Set(
  matches(html, /\bclass\s*=\s*"([^"]+)"/g)
    .flatMap(value => value.trim().split(/\s+/))
);
const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
const cssRules = [...cssWithoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(match => ({ selector: match[1].trim(), declarations: match[2] }))
  .filter(rule => rule.selector && !rule.selector.startsWith('@'));
const cssClasses = new Set(
  cssRules.flatMap(rule => matches(rule.selector, /\.([a-zA-Z_][\w-]*)/g))
);

for (const name of cssClasses) {
  if (!htmlClasses.has(name)) errors.push('Unused CSS class: .' + name);
}
for (const name of htmlClasses) {
  if (!cssClasses.has(name) && !js.includes('.' + name)) {
    errors.push('Unstyled and unreferenced HTML class: .' + name);
  }
}

for (const rule of cssRules) {
  const properties = new Set();
  for (const declaration of rule.declarations.split(';')) {
    const property = declaration.match(/^\s*([\w-]+)\s*:/)?.[1];
    if (!property) continue;
    if (properties.has(property)) {
      errors.push('Duplicate property in ' + rule.selector + ': ' + property);
    }
    properties.add(property);
  }
}

const ids = matches(html, /\bid="([^"]+)"/g);
const idSet = new Set(ids);
if (idSet.size !== ids.length) errors.push('Duplicate HTML id');
for (const id of matches(html, /\baria-labelledby="([^"]+)"/g)
  .flatMap(value => value.split(/\s+/))) {
  if (!idSet.has(id)) errors.push('Missing aria-labelledby target: #' + id);
}

const links = matches(html, /\bhref="([^"]+)"/g);
for (const link of links) {
  if (link.startsWith('#') && !idSet.has(link.slice(1))) {
    errors.push('Broken in-page link: ' + link);
  }
}

const relativeFiles = new Set([
  ...matches(html, /\b(?:src|href)="((?!https?:|#|mailto:|tel:)[^"]+)"/g),
  ...matches(css, /url\(\s*["']?(img\/[^"')?]+)["']?\s*\)/g),
  // The three JS-selected SVG variants are runtime asset references.
  'img/wordmark-labs-pink.svg',
  'img/wordmark-labs-orange.svg',
  'img/wordmark-labs-green.svg'
]);
for (const reference of relativeFiles) {
  const clean = reference.split('?')[0].split('#')[0];
  const target = join(root, clean.endsWith('/') ? clean + 'index.html' : clean);
  if (!existsSync(target)) errors.push('Missing local resource: ' + reference);
}

for (const tag of html.match(/<img\b[^>]*>/g) || []) {
  if (!/\balt\s*=/.test(tag)) errors.push('Image missing alt attribute: ' + tag);
}
if ((html.match(/<h1\b/g) || []).length !== 1) errors.push('Expected one H1');
if ((html.match(/<main\b/g) || []).length !== 1) errors.push('Expected one main landmark');
if (/\bstyle="/.test(html)) errors.push('Inline styles found: keep presentation in CSS');
if (/role="heading"/.test(html)) errors.push('Use semantic heading elements');

if (errors.length) {
  for (const error of errors) console.error('FAIL ' + error);
  process.exitCode = 1;
} else {
  console.log('PASS — homepage source checks');
  console.log('  HTML classes: ' + htmlClasses.size);
  console.log('  CSS rules checked: ' + cssRules.length);
  console.log('  Local resource references: ' + relativeFiles.size);
  console.log('  Duplicate ids, missing assets, dead CSS classes: none');
}
