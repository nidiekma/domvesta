// Click-to-load-Fassade für das Calendly-Widget.
// Vor dem Klick wird keine Verbindung zu assets.calendly.com aufgebaut
// (Datenschutz); schlägt das Laden fehl, bleibt der Direktlink als Ausweg.

const CALENDLY_SRC = "https://assets.calendly.com/assets/external/widget.js";

function initGate(frame: HTMLElement) {
  const url = frame.dataset.url?.trim();
  const gate = frame.querySelector<HTMLElement>("[data-calendly-gate]");
  const loadButton = frame.querySelector<HTMLButtonElement>("[data-calendly-load]");
  const errorHint = frame.querySelector<HTMLElement>("[data-calendly-error]");
  if (!url || !gate || !loadButton) return;

  loadButton.addEventListener("click", () => {
    if (loadButton.disabled) return;
    loadButton.disabled = true;
    loadButton.textContent = "Kalender wird geladen …";
    if (errorHint) errorHint.hidden = true;

    const widget = document.createElement("div");
    widget.className = "calendly-inline-widget";
    widget.dataset.url = url;

    const script = document.createElement("script");
    script.src = CALENDLY_SRC;
    script.async = true;
    script.onload = () => gate.remove();
    script.onerror = () => {
      widget.remove();
      script.remove();
      loadButton.disabled = false;
      loadButton.textContent = "Terminkalender laden";
      if (errorHint) errorHint.hidden = false;
    };

    frame.append(widget);
    document.head.append(script);
  });
}

document
  .querySelectorAll<HTMLElement>("[data-calendly]")
  .forEach(initGate);
