# Baterdene — Creative Coding Studio
## Tutor-only source audit · 10 November 2026

**Primary student artefact:** `progress/learning/baterdene-processing/index.html`

**Audience:** Baterdene, 13. Completed Hack Club *Animated 3D Models (Zdog)* and *Geometric Pattern (p5.js)* last week. Processing desktop application is already installed. This is a new deck; the existing `resident-processing-expert` deck has been preserved unchanged.

## Audit outcome

The 20-slide student deck has been reviewed against QK/Lessons lesson-build requirements.

- **Source fidelity:** 20 student slides retained. The two completed Hack Club workshops are marked completed; eight new workshop choices remain.
- **Setup:** First task starts immediately in Processing's default Java Mode. No installation instructions.
- **Code sequence:** setup → circle → position/colour → save → row of nine → grid of 81 → colour by coordinate → size by coordinate → animation → mouse follower → click-and-drag painting → randomness → C to clear → S to save.
- **Discrete checks:** Each code stage has a described visible result. The 9-to-6-circles experiment now has its own check and a restore instruction; both grid increments are reset before colour work.
- **Code-edit precision:** Explicit find/change/keep instructions. Painting code stays inside `draw()`; keyboard handling is a separate function. The final save stage **replaces** the earlier `keyPressed()` function instead of introducing a duplicate.
- **UI:** 20-slide navigation, chapter dropdown, previous/next controls, keyboard arrow navigation, source links. HTML section and pre/code tags balanced.
- **Reference verification:** Processing's official `size()`, `circle()`, `fill()`, `sin()`, `random()`, `mousePressed` (boolean variable), `keyPressed()`, `saveFrame()` and its Environment documentation were checked. All ten Hack Club workshop pages and three official Processing example pages resolve in web checks.

## Technical validation performed

Reconstructed the expected complete Processing Java Mode programs at steps 01, 06, 07, 08, 09, 10, 11, 12, 13, 14, and 15, then compiled them using `javac -Xlint:all` against a small, locally written Processing API **stub**. All 11 stage programs compiled with **zero javac diagnostics**.

**Limit:** This establishes Java syntax/API-signature consistency in the reconstructed stage programs; it is **not** an execution test in the actual Processing desktop application, a rendering test, or a classroom test. Before first classroom release, the tutor should run steps 01, 06, 09, 10, 12, 14 and 15 in Processing on the target studio machine. Confirm C and S key focus, file permissions and resulting PNGs.

## Pedagogical reasons behind revisions

1. The first version drew continually with `draw()`, which produced accumulating dots while the mouse was stationary and used clicking to erase the work. Revised to paint only when `mousePressed` is true, with **C** clearing and **S** saving.
2. Split the row exercise into separate observe/change/observe/restore steps. Confirm nine circles at increment 60 and six at 90.
3. Normalised position-driven RGB colour values (`x / 3` and `y / 3`) so tested values remain within 0–255.
4. Explained `frameCount`, `sin()` and the `f` suffix used in the motion sketch; speed modification remains optional.
5. Kept instructor-level explanation out of the student slides, but added specific troubleshooting at likely stumbling points.

## Flashing-content and old-workshop cautions

- **Geometric Pattern:** warning about flashing colours appears in the Hack Club workshop. Baterdene has already completed this workshop, but a flashing demonstration should not be casually reused.
- **Splatter Paint:** the Hack Club author explicitly warns about flashing colours and epilepsy. Do not use the original flashing output without a planned non-flashing adaptation.
- **Thunderstorm:** contains flashing lightning effects. Tutor check before use.
- **Sound Galaxy:** may need microphone permission and browser support.
- **Dodge:** may need updated p5.play setup.
- Several workshops link to old Replit templates or demos. The tutorial **pages** were verified as available, not every linked starter template or example. Tutor to check chosen starter before a session.
- The Hack Club pages use browser-based JavaScript, **not** Processing Java Mode. Do not paste their code into the desktop Processing editor.

## Classroom observation checklist

- Can Baterdene create the first circle without prompts?
- Does he find changing one number more engaging than following many steps?
- Can he predict row counts / explain one loop?
- Does moving `background()` from `draw()` to `setup()` make sense?
- Can he confidently drag to paint, press C to clear and S to export?
- Which direction does he *choose*: maths/pattern, particles, 3D, interactive art or games?

**Status:** Source reviewed and revised, Processing APIs cross-checked, syntax checks passed. **Pending classroom execution and learner testing.**

## Publishing

The GitHub source is committed and linked from the learning-library `index.html`. The GitHub Pages route is expected at:
`https://qwertykidsdc.github.io/qwerty-preview-library/progress/learning/baterdene-processing/`

Do not mark Netlify production publishing verified until a deployment containing the latest commit is confirmed. The last Netlify deploy reported by its API predated this deck.
