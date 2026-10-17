# Qwerty Labs — Homepage v2 (approved-design reconstruction)

**Visual source of truth:** `progress/webdesign/ql-workshop-two-images-approved-top/?v=raspberry-shift-1` and the reference workshop page behind it.

This is **not another design direction**. The actual reference HTML structure, card geometry, real photographic paper panels, brand image, mascots, project collage, backdrop geometry, responsive scaling and top/footer fades are reused.

Approved preview controls baked into `style.css`:
- Mode: Together
- Scene: C · Real tech
- Page length: Full page
- Top dim: 70%
- Middle dim: 100%
- Bottom dim: 80%
- Vignette: 60%
- Content shield: 0%

## File structure

- `index.html`: short existing homepage content and real image references.
- `style.css`: the existing approved workshop styling, with final approved treatment rules together at its end.
- `script.js`: only the existing cross-browser cardboard scale and project-position-aware fade calculations.
- `img/`: original approved art, self-contained, with descriptive names.

The preview used 9 MB of embedded image data and multiple iframe wrappers. To make v2 a standalone page, graphics have been extracted into individual SVG image containers with their **original WebP pixels retained**. This is a publishing workaround, not replacement art: connected text-file writes cannot upload binary WebP directly. Before the final FTP release, export the native WebP files into `img/` and change the extensions in the HTML and CSS for smaller transfers.

The large existing CSS stylesheet still contains earlier experimental overrides. This is intentionally a fidelity-first reconstruction. Consolidate redundant rules only *after* checking that the standalone page matches the approved composition at the relevant browser sizes.

The comparison toolbar and its associated JS have been removed. The footer study placeholder was replaced by a minimal copyright line without changing the page composition. Links to Kids, Adults, Teens and The Lab intentionally target the existing approved copy-review pages until their final sibling pages are built.

Keep this v2 preview separate from the source-of-truth reference; do not modify that reference.
