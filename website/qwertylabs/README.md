# Qwerty Labs — production staging copy

The deployment root is this directory. Transfer **the contents** of `website/qwertylabs/` to the live web server's document root (not the parent `website/` directory).

## Approved versus draft

- **Approved homepage:** `index.html`, `style-home.css`, `script.js`, shared `brand.css` and `brand.js`, and the required assets in `img/`.
- **Approved Kids page (11 November 2026):** `kids.html`, `style-kids.css`, `kids-assets.js`, and the assets they use. Design and copy signed off after reverting the mascot-placement experiment. The staging `noindex` remains until public launch.
- **Draft, not yet approved:** `adults.html`, `teens.html`, `thelab.html`. These pages remain under review; do not treat them as final production pages.
- The existing design preview under `progress/webdesign/ql-site-v2/` is deliberately untouched.

## Unfinished before retiring qwertykids.com

The homepage now uses the fixed local photo `img/code-camp-robotics-700.jpg` in Meet the Lab. The old rotating photo script has been removed. `img/coding-for-kids-gift-guide.jpg` is also retained locally for future use. No homepage photos depend on the retiring QwertyKids website.

The homepage's **Bookings**, **Contact**, **Child Safety**, **Privacy**, and **Booking Terms** links also still point to qwertykids.com. Those URLs must be replaced with working destinations before the old site is retired.

The homepage has `<meta name="robots" content="noindex,nofollow">` while staging; remove at public launch. The external Google Fonts and Coolest Projects link are intentional third-party references.

## Structure

All HTML, JavaScript and CSS files are at the top level; the only subdirectory is `img/`. All implemented **internal navigation** is relative, and there is no build step.

## Page-based branding

The page declares its brand in the root HTML element: `data-brand="lab"` (the default blue), `kids` (green), `adults` (pink), or `teens` (orange). **Do not randomise this identity.**

- `brand.css` owns the six approved colour tokens, per-page accent mapping, and cursor styling.
- `brand.js` reads `--brand-accent` and applies it to the matching arrow and hand cursors. On touch devices or without JavaScript, native pointers remain.
- Wordmarks are selected as static image sources in each page: `img/wordmark.svg` for Lab, or `img/wordmark-labs-{green,pink,orange}.svg` for audience pages. This avoids a post-load colour swap and works with JavaScript disabled.
- `style-home.css` and `script.js` contain only homepage-specific layout and interactions; other pages do not need those files until their designs are approved.
