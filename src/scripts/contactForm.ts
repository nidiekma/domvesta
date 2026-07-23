// Wiederverwendbarer Kontaktformular-Handler für alle Konzepte.
// - Liest den Ziel-Endpunkt aus [data-endpoint] (z. B. Formspree).
// - Ohne Endpunkt: Demo-Modus mit clientseitiger Erfolgsmeldung.
// - Schaltet den umgebenden [data-contact-wrapper] auf .is-sent.

function handleForm(form: HTMLFormElement) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const wrapper = form.closest<HTMLElement>("[data-contact-wrapper]");
    const button = form.querySelector<HTMLButtonElement>("[type=submit]");
    const endpoint = form.dataset.endpoint?.trim();
    const originalLabel = button?.textContent ?? "Senden";

    if (button) {
      button.disabled = true;
      button.textContent = "Wird gesendet …";
    }

    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Request failed");
      } else {
        // Demo-Modus: kurze künstliche Latenz für realistisches Feedback.
        await new Promise((resolve) => setTimeout(resolve, 650));
      }
      form.reset();
      wrapper?.classList.add("is-sent");
      wrapper?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      alert(
        "Das Senden hat leider nicht geklappt. Bitte versuchen Sie es später erneut oder rufen Sie uns direkt an.",
      );
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
