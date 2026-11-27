# Qwerty Labs website

The deployment root is `website/qwertylabs/`. It contains only the static site.

- Root HTML pages: main content and programmes.
- `enrol/`: one classes form and one camps form.
- `info/`: practical information, policies and the unlisted PWYW page.
- `assets/css/`: shared style.css and mobile.css.
- `assets/js/`: shared script.js and forms.js.
- `assets/photos/`, `assets/video/`, `assets/design/`, `assets/mascots/`: media and artwork.
- `robots.txt` and `sitemap.xml`: search-engine discovery at the site root.

Nested HTML pages use `<base href="../">` to share site-root relative links. CSS image URLs are relative to the CSS file itself. JavaScript-generated URLs resolve against the document base. Keep filenames lowercase and descriptive.

## Before deployment

Forms validate locally only. Connect and test a secure submission workflow before accepting personal data or payment. Staging noindex remains until launch. Keep PWYW unlisted; its path is not an access-control mechanism. Configure the legacy redirects listed in `redirects.md` on the production server, rather than keeping obsolete HTML pages. Run the source and browser checks in this maintenance directory; review desktop and mobile screenshots. Git history preserves removed files.
