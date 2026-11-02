# Qwerty Labs — artwork colour audit

Only the separate colour-test version has been modified. Approved v2 is untouched.
## Exact palette

| Role | Hex |
|---|---|
| Blue | #4C69E3 |
| Pink | #F66DC1 |
| Green | #92D644 |
| Orange | #FF9029 |
| Pale | #F7F4EB |
| Ink | #020020 |

## Actual artwork roles and measured corrections

| Asset | Intended colour | Original median RGB | Corrected median RGB | Target | Recoloured core |
|---|---|---|---|---|---|
| hero-paper.svg | Orange | [252, 132, 17] | [255, 144, 41] | #FF9029 | 70.3% |
| kids-green-panel-untaped.svg | Green | [147, 216, 72] | [146, 214, 68] | #92D644 | 81.5% |
| adults-pink-panel-untaped.svg | Pink | [250, 80, 169] | [246, 109, 193] | #F66DC1 | 83.4% |
| teens-blue-panel-untaped.svg | Blue | [40, 126, 252] | [76, 105, 227] | #4C69E3 | 81.6% |
| project-backboard.svg | Ink | [13, 21, 35] | [2, 0, 32] | #020020 | 91.7% |
| current-project-label.svg | Blue | [16, 106, 252] | [76, 105, 227] | #4C69E3 | 64.2% |
| ideas-panel-untaped.svg | Pink | [251, 83, 167] | [246, 109, 193] | #F66DC1 | 81.5% |
| components-panel-untaped.svg | Blue | [40, 126, 252] | [76, 105, 227] | #4C69E3 | 81.6% |
| projects-panel-untaped.svg | Orange | [251, 137, 23] | [255, 144, 41] | #FF9029 | 82.8% |

## Exclusions

The photographic header/footer, mascots, project photo and photo frame remain untouched and are linked from approved v2.
Paper folds, transparent edges and separately coloured tape remain protected. Text and geometry are untouched.
The wordmark is physically cropped to its approved 2013x460 canvas: no tagline is embedded in its trial asset.
Its original background matte is removed via a letterform alpha mask, retaining exact #F7F4EB and #4C69E3 in fully opaque pixels.
The papers are corrected within their embedded WebP pixels, not with CSS or SVG filters.
Surface texture intentionally means adjacent pixels vary around their brand-colour anchor.
See COLOUR_COMPARISON.png for the before/after contact sheet.
See WORDMARK_QA.svg for the opaque, dark-background rendering check.
