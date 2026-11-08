/* Ephemeral design review control. Production copy exists once in HTML.
   The live homepage already links to kids.html; no homepage changes needed. */
"use strict";
(() => {
  const allowed = new Set(["field-guide","question-wall","studio-manual"]);
  const query = new URLSearchParams(window.location.search);
  const selected = allowed.has(query.get("layout")) ? query.get("layout") : "field-guide";
  document.documentElement.dataset.layout = selected;
  document.querySelectorAll(".design-chooser a[data-preview]").forEach(link => {
    if (link.dataset.preview === selected) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
})();
