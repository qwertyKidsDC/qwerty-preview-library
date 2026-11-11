# Qwerty Labs — production staging copy

The deployment root is this directory. Transfer **the contents** of `website/qwertylabs/` to the live web server's document root (not the parent `website/` directory).

## Approved versus draft

- **Approved homepage:** `index.html`, the single `style.css`, `script.js`, `brand.js`, and approved `img/` assets.
- **Approved Kids page (11 November 2026):** `kids.html`, the shared `style.css`, `kids-assets.js`, and approved assets. The last signed-off layout is the source of truth; staging `noindex` stays until launch.
- **Draft, not yet approved:** `adults.html`, `teens.html`, `thelab.html`. These pages remain under review; do not treat them as final production pages.
- The existing design preview under `progress/webdesign/ql-site-v2/` is deliberately untouched.

## Unfinished before retiring qwertykids.com

The homepage now uses the fixed local photo `img/code-camp-robotics-700.jpg` in Meet the Lab. The old rotating photo script has been removed. `img/coding-for-kids-gift-guide.jpg` is also retained locally for future use. No homepage photos depend on the retiring QwertyKids website.

The homepage's **Bookings**, **Contact**, **Child Safety**, **Privacy**, and **Booking Terms** links also still point to qwertykids.com. Those URLs must be replaced with working destinations before the old site is retired.

The homepage has `<meta name="robots" content="noindex,nofollow">` while staging; remove at public launch. The external Google Fonts and Coolest Projects link are intentional third-party references.

## One stylesheet

`style.css` replaces separate brand, homepage, Kids, Tools and Kids Ages-preview styles. All site pages load only this local CSS (with Google Fonts served externally). The old sources remain recoverable through Git history and the backup branch.

Independent design playgrounds keep separate experimental CSS and are not part of the production site's stylesheet contract.

## Structure

All HTML, JavaScript and CSS files are at the top level; the only subdirectory is `img/`. All implemented **internal navigation** is relative, and there is no build step.

## Page-based branding

The page declares its brand in the root HTML element: `data-brand="lab"` (the default blue), `kids` (green), `adults` (pink), or `teens` (orange). **Do not randomise this identity.**

- `style.css` owns the approved six-colour palette, per-page accent mapping, cursor styling, shared layouts and scoped page sections.
- `brand.js` reads `--brand-accent` and applies it to the matching arrow and hand cursors. On touch devices or without JavaScript, native pointers remain.
- Wordmarks are selected as static image sources in each page: `img/wordmark.svg` for Lab, or `img/wordmark-labs-{green,pink,orange}.svg` for audience pages. This avoids a post-load colour swap and works with JavaScript disabled.
- `style.css` is the only local stylesheet loaded by site pages. `script.js` is shared and safely skips interactions not present on a page.
