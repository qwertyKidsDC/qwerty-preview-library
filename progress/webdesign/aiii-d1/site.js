(() => {
  const button = document.querySelector(".theme-toggle");
  if(!button) return;

  button.addEventListener("click", () => {
    const light = !document.body.classList.contains("light-mode");
    document.body.classList.toggle("light-mode", light);
    button.textContent = light ? "Dark" : "Light";
    button.setAttribute("aria-pressed", String(light));
    button.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
  });
})();