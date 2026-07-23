// Kontaktformular-Handler.
// - Mit [data-endpoint] (z. B. Formspree): echter POST-Versand.
// - Ohne Endpunkt: KEIN vorgetäuschter Erfolg — ehrlicher Hinweis mit
//   vorbefüllter E-Mail als Ausweg, Eingaben bleiben erhalten.
// - Fehler erscheinen inline ([data-form-message], role="alert") statt alert().

function buildMailto(form: HTMLFormElement, email: string): string {
  const data = new FormData(form);
  const get = (key: string) => String(data.get(key) ?? "").trim();
  const subject = `Anfrage über die Website – ${get("firma") || get("name") || "Hausverwaltung"}`;
  const body = [
    `Name: ${get("name")}`,
    `Hausverwaltung: ${get("firma")}`,
    `E-Mail: ${get("email")}`,
    `Telefon: ${get("telefon") || "–"}`,
    `Bereich: ${get("bereich")}`,
    "",
    get("nachricht"),
  ].join("\n");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function showMessage(el: HTMLElement, html: string) {
  el.innerHTML = html;
  el.hidden = false;
}

function handleForm(form: HTMLFormElement) {
  const wrapper = form.closest<HTMLElement>("[data-contact-wrapper]");
  const button = form.querySelector<HTMLButtonElement>("[type=submit]");
  const message = form.querySelector<HTMLElement>("[data-form-message]");
  const endpoint = form.dataset.endpoint?.trim();
  const email = form.dataset.email?.trim() ?? "";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (message) message.hidden = true;

    if (!endpoint) {
      // Kein Versand-Endpunkt konfiguriert: nichts vortäuschen, Eingaben behalten.
      if (message) {
        showMessage(
          message,
          `Das Formular ist noch nicht angeschlossen – Ihre Nachricht wurde <strong>nicht</strong> übertragen. ` +
            `Schicken Sie sie stattdessen per <a href="${buildMailto(form, email)}">E-Mail an ${email}</a> – Ihre Eingaben werden übernommen.`,
        );
      }
      return;
    }

    const originalLabel = button?.textContent ?? "Senden";
    if (button) {
      button.disabled = true;
      button.textContent = "Wird gesendet …";
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      form.reset();
      wrapper?.classList.add("is-sent");
      wrapper?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      if (message) {
        showMessage(
          message,
          `⚠ Das Senden hat leider nicht geklappt. Ihre Eingaben sind noch da – ` +
            `versuchen Sie es gleich erneut oder senden Sie Ihre Nachricht per <a href="${buildMailto(form, email)}">E-Mail an ${email}</a>.`,
        );
      }
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    }
  });
}

document
  .querySelectorAll<HTMLFormElement>("form[data-contact-form]")
  .forEach(handleForm);
