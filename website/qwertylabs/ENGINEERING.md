# Qwerty Labs website — engineering standard

Status: working static site undergoing a quality-gate review.

## Source of truth

- Home: index.html (its own deliberate layout).
- Subpages: kids.html is the approved reusable layout reference.
- Shared stylesheet: style.css, the only local stylesheet for actual pages.
- Behaviour: script.js plus brand.js for theme-coloured cursors.
- Approved heroes: img/hero-home.webp, img/hero-kids.webp and
  img/hero-tools.webp, all 1240 × 955 transparent WebP.
- Adults, Teens and The Lab are draft content, not finished subpage templates.
- Experimental tools (subpage-studio and freeform-assets) are not site templates.
- Rollback: archive/2026-11-17-approved-before-quality-gate branch. Do not edit.

## One component, one implementation

The root HTML attribute data-layout="subpage" selects the shared subpage
architecture; data-brand selects colour independently:

- lab = approved blue #4C69E3
- kids = approved green #92D644
- adults = approved pink #F66DC1
- teens = approved orange #FF9029

Reuse the existing hero, projects--subpage, subpage-intro, subpage-board,
subpage-section, subpage-art, subpage-callout and footer components. A
named variant on an existing component is valid only for a genuine structural
difference, never to patch one page's ID.

To create another page, clone kids.html. Change page copy, metadata,
links, theme, image paths and alt text. Switch matching paper/wordmark art
when changing theme. Do not duplicate CSS, invent a link treatment,
introduce inline styles or alter hero geometry. All heroes share the same
mascots class and 1240 × 955 intrinsic dimensions.

## Responsive and accessibility contract

- Desktop artwork scales as one composition; mobile layout uses 760 px.
- The deliberate card-to-cardboard overlap must survive every page and width.
- One main landmark and h1, followed by meaningful heading order.
- Decorative images use alt="" and meaningful images describe the subject.
- Interactive controls have accessible names and visible keyboard focus.
- Text links remain legible when they wrap; colour alone conveys no state.
- Respect reduced-motion preferences. Automated axe checks alone cannot
  establish full WCAG compliance.

## Quality gate

The current-site workflow is:
.github/workflows/ql-current-site-quality.yml

It validates completed pages against HTML5, checks local files, ARIA/ID
references, shared CSS and JS syntax, and runs real Chromium screenshots
at desktop (1440 px) and mobile (390 px) plus axe-core WCAG checks.

Run the read-only audit locally (Python 3.11+, Node 22+, Playwright and
axe-core installed):

    python website/qwertylabs/_tools/check_site.py --static-only
    python website/qwertylabs/_tools/check_site.py --out site-quality-report

Every code-only change needs a screenshot comparison against the approved
site, plus a manual keyboard and screen-reader review. Don't publish an
unreviewed visual change under the name of cleanup.

## Asset and experiment policy

The preview workspace deliberately includes original artwork and design
tools. Not all unreferenced files are rubbish: audit the gallery and
cross-repository references before removing or relocating any file.

For eventual production transfer, stage only approved pages and their
verified dependencies. Keep artwork originals and experimentation separate.

## Sign-off

Green automated checks are necessary but not sufficient. Human review
must verify desktop/mobile appearance, content accuracy, keyboard
behaviour, focus treatment, wrapped links, accessibility, and code clarity.
