# Qwerty Labs — production staging copy

The deployment root is this directory. Transfer **the contents** of `website/qwertylabs/` to the live web server's document root (not the parent `website/` directory).

## Approved versus draft

- **Approved homepage:** `index.html`, the shared `style.css` and mobile-only `mobile.css`, `script.js`, `brand.js`, and approved `img/` assets.
- **Approved Kids page (11 November 2026):** `kids.html`, the shared `style.css`, `script.js`, and approved assets. The last signed-off layout is the source of truth; staging `noindex` stays until launch.
- **Draft, not yet approved:** `adults.html`, `teens.html`, `thelab.html`. These pages remain under review; do not treat them as final production pages.
- The existing design preview under `progress/webdesign/ql-site-v2/` is deliberately untouched.

## Unfinished before retiring qwertykids.com

The homepage now uses the fixed local photo `img/code-camp-robotics-700.jpg` in Meet the Lab. The old rotating photo script has been removed. `img/coding-for-kids-gift-guide.jpg` is also retained locally for future use. No homepage photos depend on the retiring QwertyKids website.

The homepage's **Bookings**, **Contact**, **Child Safety**, **Privacy**, and **Booking Terms** links also still point to qwertykids.com. Those URLs must be replaced with working destinations before the old site is retired.

The homepage has `<meta name="robots" content="noindex,nofollow">` while staging; remove at public launch. The external Google Fonts and Coolest Projects link are intentional third-party references.

## Two clear CSS responsibilities

`style.css` owns the approved design system, shared components and desktop geometry. `mobile.css` contains the original mobile rules (consolidated from scattered media queries) plus deliberate phone-width adjustments. All site pages link both files in the same order, with `mobile.css` loaded only at widths up to 760px. Do not duplicate shared component styling inside the mobile file. The abandoned Kids Ages experiment and old styles remain recoverable through Git history and the backup branch.

Independent design playgrounds keep separate experimental CSS and are not part of the production site's stylesheet contract.

## Structure

All HTML, JavaScript and CSS files are at the top level; the only subdirectory is `img/`. All implemented **internal navigation** is relative, and there is no build step.

## Page-based branding

Each page declares its **colour** in the root HTML element: `data-brand="lab"` (the default blue), `kids` (green), `adults` (pink), or `teens` (orange). **Do not randomise this identity.**

- `style.css` owns the approved six-colour palette, per-page accent mapping, cursor styling, shared layouts and scoped page sections; `mobile.css` owns the responsive adjustments. Subpages reuse `.subpage-intro`, `.subpage-board`, `.subpage-section`, `.subpage-art`, and `.subpage-callout` rather than creating page-specific versions.
- `brand.js` reads `--brand-accent` and applies it to the matching arrow and hand cursors. On touch devices or without JavaScript, native pointers remain.
- Wordmarks are selected as static image sources in each page: `img/wordmark.svg` for Lab, or `img/wordmark-labs-{green,pink,orange}.svg` for audience pages. This avoids a post-load colour swap and works with JavaScript disabled.
- All site pages link `style.css` and `mobile.css` for narrow viewports. `script.js` also builds the accessible mobile Menu button in the shared header, without duplicating HTML across pages. The former `kids-assets.js` has been consolidated into `script.js`; its unnecessary image fallback code has been removed because the existing repository files are present.

## Website continuity — clone gate

The canonical subpage layout is the current `kids.html` and its existing components in `style.css`; it uses `data-layout="subpage"` independently of `data-brand`. The homepage uses `data-layout="site"`. The approved homepage is `index.html`. Do not redesign or replace them when cloning a page.

1. **Find and inspect** the current source page, its linked assets, shared stylesheet, and scripts before editing. A newly cloned page changes **copy, URLs, image sources, alt text and page identity**; it must not gain a new layout or link style.
2. **Reuse existing classes.** Do not create page-specific CSS selectors, scripts, inline overrides, or duplicate component rules for a simple copy/image swap. Tools and Tiarna reuse those same subpage components, but correctly declare the blue `data-brand="lab"` (no inline colour override).
3. **Use the same link contract** across all pages: navigation and policy links show the blue squiggle on hover/focus; text links use the approved ivory squiggle by default and blue on hover/focus, with wrapping handled by background decoration. Footer cards keep their approved paper-card variant.
4. **Check all site pages together** if a shared file truly must change. Only edit `style.css` or JavaScript for a demonstrated shared-component defect; document the reason and review the exact diff before merging. A content/image change alone is never grounds to edit them.
5. **Verify before publishing:** HTML landmarks and heading order; unique IDs and their `aria-labelledby` references; meaningful image alternatives; relative assets and navigation; keyboard focus and wrapped links; desktop and mobile layouts; console/network errors. Keep preview experiments separate from published page styles.

All completed site pages importing `style.css` use the same cache version. The source files, not cached browser views or generated substitutes, are the source of truth. Git history retains prior versions.

## November 17 archive and hero contract

The exact pre-cleanup website (pages, scripts and image assets) is preserved at `archive/2026-11-17-pre-cleanup/website/qwertylabs/` and on the independent `archive/2026-11-17-pre-cleanup` branch. Clone `kids.html` for new subpages, change `data-brand` for the approved palette, and do not change layout CSS for a content/image swap.

Approved hero trio exports are 1240 × 955 px transparent WebP files. They should share the existing `.hero .mascots` CSS unchanged, using only a different `src` and accurate `alt` text. Do not reference a new file from HTML until the binary has been uploaded and verified at the exact repository path. Keep originals in the archive.

## Source audit, 17 November 2026

The active HTML pages share the same header and footer component markup shape. The stylesheet groups matching rules for headings, focus rings, link underlines, and editorial sections rather than reimplementing them per page. Reusable variants (`.subpage-section--plain`, `.subpage-art--raised`, `.subpage-art--centered`) replace positioning hacks tied to page IDs. The Project Code Cloud iframe uses its own `.project-video` component rather than borrowing and undoing testimonial styles. The production CSS no longer includes the abandoned Kids Ages preview rules. No extra page-specific styles are allowed for content-only clones.

**Hero asset contract:** The three approved 1240 × 955 transparent WebPs are installed at `img/qwerty-labs-mascots-led-electronics.webp`, `img/qwerty-labs-mascots-robot-car.webp` and `img/qwerty-labs-mascots-cardboard-rocket.webp`. Home uses Home; Kids, Weekly Classes and Holiday Camps use Kids; Kit & Code and A Kid's POV use Tools. Every complete page uses the same `.hero .mascots` CSS rule and explicit 1240 × 955 HTML dimensions. No page-specific hero CSS is permitted. Binary files were compared with the source uploads using Git blob SHA-1 before publishing. Visual checks against the published site remain necessary.
