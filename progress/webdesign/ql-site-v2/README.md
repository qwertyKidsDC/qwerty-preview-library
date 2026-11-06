# Qwerty Labs — homepage v2

**Status:** Working visual source of truth, audited 6 November 2026. This is a
GitHub Pages preview, not a production launch. The homepage deliberately uses
`noindex,nofollow`; the four linked copy-review subpages remain drafts.

[Open the homepage preview](https://qwertykidsdc.github.io/qwerty-preview-library/progress/webdesign/ql-site-v2/)

## Authoritative files

| File | Responsibility |
| --- | --- |
| `index.html` | Homepage content, document structure, semantics, accessible text and asset references. |
| `style-home.css` | **The only local stylesheet loaded by the homepage.** Foundations, typography, responsive art placement, the closing scene and link treatments. |
| `script.js` | Small progressive enhancements: desktop scale, photographic fade positioning, wordmark colour, rotating studio photography, year and footer-copy alignment. |
| `img/` | Approved imagery and its retained source/experimental variants. |
| `_tools/check-homepage.mjs` | Dependency-free static checks for selectors, markup references and assets. |
| `_tools/spacing_audit.py` | Optional Playwright screenshot/geometry audit; requires its separate Python and browser dependencies. |

Do not edit `style.css`, `style-clean.css`, `style-refactor.css`,
`footer-home.css` or the dated experiment HTML files expecting to change
the homepage. Those are historical experiments, not imported styles.
Keep them available until their public preview links and asset dependencies
have been inventoried. Likewise, `copy-originals-20261103/` contains review
history, not production copy.

The children, adults, teens and lab subdirectories currently contain
**unstyled copy-review drafts**. Their HTML does not import the homepage CSS;
that is intentional until their layouts are approved.

## Design invariants

- Keep the approved handmade art, original dimensions, alpha trims and
  cardboard composition. Content changes must not silently reshape assets.
- Brand tokens are defined in `style-home.css`: blue `#4C69E3`, pink
  `#F66DC1`, green `#92D644`, orange `#FF9029`, ivory `#F7F4EB`
  and ink `#020020`. Photographic lighting and physical cardboard textures
  have their own material colours.
- Desktop layout preserves the original **986px composition** and scales it
  with a CSS custom property set by JavaScript. At 760px and below, CSS stacks
  the components. The source photography uses a related 750px breakpoint;
  do not merge those breakpoints without visual comparison.
- Decoration belongs in images, CSS backgrounds or empty-alt artwork.
  Actual content uses text, semantic headings, links and alternative text.
- Only link affordances animate; reduced-motion users receive static lines.
- The Acknowledgement of Country follows the lowest blue-card text by
  24 *visible* pixels where supported. CSS provides the no-script margin.

## Asset control

The homepage currently refers to **19 individual local image paths** in its
HTML/CSS, plus **three JavaScript-selected coloured wordmark variants**.
Several of the 53 items in `img/` are previous art, source versions or
assets used by experiments and tooling. **Do not delete the remainder just
because the homepage does not reference them.** The trimmed assets are
documented in `img/trim-manifest.json`.

The Meet the Lab photograph rotates through images hosted at
`qwertykids.com`. This is an external availability dependency; for a final
self-contained release, obtain approved local originals and update their
individual alt text. The default HTML photo remains as a no-JavaScript
fallback. The proposed `create@qwertylabs.com.au` address is plain text
until the mailbox is confirmed operational.

## Quality gates

From the repository root, with Node.js 20+:

```sh
node --check progress/webdesign/ql-site-v2/script.js
node progress/webdesign/ql-site-v2/_tools/check-homepage.mjs
```

The fast, dependency-free source check also runs on pull requests via
`.github/workflows/ql-v2-source-quality.yml`. It verifies missing local
resources, duplicate IDs/declarations, orphan CSS class selectors, markup
classes with no defined purpose, accessibility references and basic page
structure. **It does not validate every CSS property or prove pixel parity.**

For a visual audit, run the manually dispatched
`Qwerty Labs v2 spacing audit` GitHub Action. Review its screenshots and
measurement report for 390px, 1024px, 1604px and 2005px viewports.
Also check 760/761px and 750/751px boundaries, keyboard navigation,
no-JavaScript rendering, 100/125% browser zoom, and genuine mobile browsers
before moving changes to the public homepage.

## Known publication checks

- **Colour contrast:** approved blue `#4C69E3` against ink `#020020`
  is approximately **4.34:1**, slightly below 4.5:1 for ordinary text.
  Hover colours need an approved WCAG 2.2 AA solution before claiming
  full conformance.
- Complete the mobile/desktop *visual* regression comparison for the audit
  branch. Source-only cleanup cannot establish a pixel-perfect match.
- Confirm all five rotating external photographs still resolve and their
  descriptions match their subjects.
- Finish and approve the four copy-review subpages before public launch.

### Editing rule

Change the **active** homepage files, run the static checks, inspect at the
defined breakpoints, then update the CSS/JS cache-busting query strings on
`index.html`. Keep dated experiments and original imagery separate from the
active implementation. Prefer a small, reviewable commit to a new override
at the bottom of the stylesheet.
