# Qwerty Labs — homepage build

Static, hand-maintainable HTML/CSS. No CMS, framework, JavaScript, build command or deployment dependency.

## Files

- \`index.html\` — semantic homepage and public-facing copy.
- \`style.css\` — one stylesheet: palette, layout, components, workshop scenes and breakpoints.
- \`img/\` — approved wordmark, mascot artwork, project image, paper tape, components and workshop top/footer artwork.

The art is kept separate from the HTML so text and styles remain editable. During this GitHub preview build, the original WebP files are packaged inside standalone SVG image containers because the connected repository writer supports text files. These render as normal images and keep the preview self-contained. **For final production, replace those containers with the native WebP originals and update the matching \`img/*.svg\` references to \`img/*.webp\`.** This removes base64 overhead and reduces transferred bytes.

## Useful CSS controls

The six locked palette variables are at the top of \`style.css\`.

- \`--rail\`: maximum content width.
- \`--gutter\`: spacing at the browser edge.
- \`--top-scene-dim\`: darkness of the top workshop image (0 = none).
- \`--bottom-scene-dim\`: darkness of the footer image (0 = none).

The top and footer scenes use separate files and independent fades. They do not affect the page content.

## Preview navigation

While the other site pages are being built, the homepage's Kids, Adults, Teens, Projects and The Lab links intentionally point to their approved copy-review pages at \`../ql-page-kit-v1/\`. These links all resolve inside the existing preview library.

When those pages are built alongside \`index.html\`, switch these links to:

- \`kids.html\`
- \`adults.html\`
- \`teens.html\`
- \`projects.html\`
- \`the-lab.html\`

Contact, Bookings and policy links currently route to their existing QwertyKids pages. Replace them when Qwerty Labs' equivalents are ready; do not publish placeholder policies or unfinished booking flows.

## Launch

1. Replace SVG-contained artwork with the original native WebP/PNG files in \`img/\`.
2. Bring the other pages into this folder, with their final internal links.
3. Review the live contact, booking and policy destinations.
4. Remove \`<meta name="robots" content="noindex, nofollow">\` from the page for launch.
5. Upload the folder's files to your web server. \`index.html\`, \`style.css\` and \`img/\` are sufficient for this homepage; no compiling or app server required.
