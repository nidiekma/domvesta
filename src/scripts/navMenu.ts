// Mobiles Nav-Menü (<details>): schließt nach Link-Klick, bei Klick
// außerhalb und mit Escape. Ohne JS bleibt es ein funktionierendes
// Auf-/Zuklapp-Element.

const menu = document.querySelector<HTMLDetailsElement>("details[data-nav-menu]");

if (menu) {
  menu.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      menu.open = false;
    }),
  );
  document.addEventListener("click", (event) => {
    if (menu.open && event.target instanceof Node && !menu.contains(event.target)) {
      menu.open = false;
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") menu.open = false;
  });
}
