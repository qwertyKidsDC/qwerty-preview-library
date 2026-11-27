# Qwerty Labs — source standards

The website is plain HTML, CSS and JavaScript. Keep the approved visual design, content, and artwork intact when changing code.

## Shared foundations

- Use semantic HTML and descriptive component names. The homepage is its own layout; the Kids page defines the reusable subpage layout.
- The root `data-brand` selects the accent: Lab blue #0F6DFC, Kids green #92D644, Adults pink #F66DC1, Teens orange #FF9029. Shared ivory and ink are CSS variables.
- Keep shared rules in style.css. Phone layout adjustments belong in mobile.css. Repeated selectors in different media conditions may be necessary; remove duplication only after checking cascade and computed styles.
- Keep common behaviour in script.js and form-specific behaviour in forms.js. No inline styling or page-specific hacks where a shared component is appropriate.
- Keep descriptive lowercase filenames, relative internal URLs, appropriate alt text, and keyboard-accessible controls. No cache-busting development parameters in HTML. External service parameters are intentional.

## Checks before deployment

Run the read-only source and browser checks in `_tools`. Review desktop and mobile screenshots, links, images, videos, navigation, form validation, keyboard focus, reduced motion, and accessibility. Noindex remains until public launch. Forms are local-only and do not submit; connect and test the secure backend before accepting personal data. Preserve the privately shared PWYW page and the old tools.html redirect.

The Git history is the archive, not the public website directory.
