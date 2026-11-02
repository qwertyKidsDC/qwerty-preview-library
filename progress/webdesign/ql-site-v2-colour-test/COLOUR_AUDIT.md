# Qwerty Labs — homepage colour audit (isolated trial)

**Source of truth:** `progress/webdesign/ql-site-v2/`, preserved unchanged.
**Trial:** `progress/webdesign/ql-site-v2-colour-test/` (this directory).

## Authoritative brand colours

| Role | Colour |
| --- | --- |
| Blue | `#4C69E3` |
| Pink | `#F66DC1` |
| Green | `#92D644` |
| Orange | `#FF9029` |
| Pale / Warm ivory | `#F7F4EB` |
| Dark / Ink | `#020020` |

## Explicit exclusions

- Large workshop background artwork: `workshop-top.svg`, `workshop-footer.svg` (shared original assets)
- Mascots: `mascot-trio.svg` (shared original asset)
- Background photographic light, shadow, vignette and ambient colours
- The existing footer typography and treatment
- Project Code Cloud photograph and picture-frame artwork (shared originals)

## Scoped implementation

- Replaced former `#F1F8F8` pale CSS token with `#F7F4EB`.
- The `--paper` token now points to `var(--pale)` instead of separately defining another hex.
- Navigation, featured project copy, button border and hover derive their light tone from that token.
- The wordmark's light lettering uses an exact `#F7F4EB` fill and its blue lettering uses an exact `#4C69E3` fill, both retaining the existing embedded alpha silhouette.
- No sizes, spacing, positioning or typography were changed.
- The original v2 and its SVG assets were not changed.

## Raster artwork — intentional colour variation

The following *SVG* files each contain an embedded raster WebP, not flat vector fills:

- `hero-paper.svg` — textured orange paper
- `kids-green-panel-untaped.svg` — textured green paper
- `adults-pink-panel-untaped.svg` — textured pink paper
- `teens-blue-panel-untaped.svg` — textured blue paper
- `project-backboard.svg` — textured featured project backing
- `current-project-label.svg` — textured blue label
- `ideas-panel-untaped.svg` — textured coloured paper
- `components-panel-untaped.svg` — textured blue paper
- `projects-panel-untaped.svg` — textured coloured paper

These remain **pixel-for-pixel unchanged** within the test copy. Solid areas and texture variation cannot be identified or validated merely by reading the XML wrapper; an exact per-pixel colour correction would require sampling and selectively recolouring the underlying raster while preserving grain, edges, tape and shadows. Do not apply blanket CSS filters or global replacement to these pieces.

## QA before adopting

1. Compare trial against source at desktop and mobile widths.
2. Confirm exact flat-colour wordmark fills and retained alpha texture.
3. Confirm existing artwork is unchanged and foreground readability remains sound.
4. Only after visual approval, consider whether any individual raster asset requires selective pixel corrections.
5. Keep CSS consolidation as a separate later step.
