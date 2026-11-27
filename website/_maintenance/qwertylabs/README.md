# Qwerty Labs website

Static HTML, CSS and JavaScript. The deployment root is the contents of this directory, which contains only website runtime files.

- Top-level HTML: content pages.
- forms/: standalone enrolment pages. Enquiry and interest forms remain embedded in the relevant content pages.
- img/: photographs; design/, hero-mascots/, framed-mascots/, holler-mascots/ and footer-mascots/ group artwork by purpose.
- media/: video files.
- style.css: shared design and layout. mobile.css: responsive adjustments.
- script.js: shared site behaviour, favicons, hero/footer rotations and the homepage holler mascot. forms.js: form fields, validation and holler mascots.

Form pages use a base URL pointing to the site root so shared relative URLs work both on GitHub Pages and on a production domain. The teen camp page selects the teen audience through its HTML data attribute.

## Before deployment

The forms currently validate locally only. No backend, actual enrolment, notification or payment submission exists. Connect and test a secure submission workflow before accepting personal data. Staging noindex remains until public launch. Keep the privately shared PWYW page unlisted. Check all asset paths, desktop/mobile visuals, keyboard accessibility and forms; do not deploy the cleanup without browser checks. The development checks live alongside this document, outside the deployment directory.

Git history preserves removed prototypes and unused artwork. No version suffixes are required in public asset URLs.
