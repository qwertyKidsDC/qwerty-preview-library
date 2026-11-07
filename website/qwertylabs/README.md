# Qwerty Labs — production staging copy

The deployment root is this directory. Transfer **the contents** of `website/qwertylabs/` to the live web server's document root (not the parent `website/` directory).

## Approved versus draft

- **Approved:** `index.html`, `style-home.css`, `script.js`, and the 23 required copied assets in `img/`.
- **Draft, not yet approved:** `kids.html`, `adults.html`, `teens.html`, `thelab.html`. The draft pages still carry visible review notices and their own noindex tags. Do not treat them as final production pages.
- The existing design preview under `progress/webdesign/ql-site-v2/` is deliberately untouched.

## Unfinished before retiring qwertykids.com

The five photos below are currently hotlinked from the old QwertyKids website by the approved homepage and its random-photo script. Download the original files and add them to `img/`, then replace the corresponding absolute references in `index.html` and `script.js` with local `img/filename.jpg` paths:

- `img/coding-for-kids-gift-guide.jpg`
- `img/code-camp-robotics-700.jpg`
- `img/code-camp-near-me-apps-700.jpg`
- `img/coding-camps-apps-700.jpg`
- `img/kids-coding-classes-near-me-510.jpg`

The homepage's **Bookings**, **Contact**, **Child Safety**, **Privacy**, and **Booking Terms** links also still point to qwertykids.com. Those URLs must be replaced with working destinations before the old site is retired.

The homepage has `<meta name="robots" content="noindex,nofollow">` while staging; remove at public launch. The external Google Fonts and Coolest Projects link are intentional third-party references.

## Structure

All HTML, JavaScript and CSS files are at the top level; the only subdirectory is `img/`. All implemented **internal navigation** is relative, and there is no build step.
