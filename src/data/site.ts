// ============================================================================
// Zentrale Daten der Domvesta-Website: Abschnittsindex, Kontaktwege,
// Gründer und Rechtliches. Seitentexte stehen in src/pages/index.astro
// (Textstand: docs/copy_v4.md).
// ============================================================================

// --- Abschnitte -------------------------------------------------------------
// Zähler wie "03 / 09 · Strom & Gas" und das mobile Menü lesen von hier.
export const sections = [
  { id: "top", label: "Überblick" },
  { id: "leistungen", label: "Ihre Vorteile" },
  { id: "strom-gas", label: "Strom & Gas" },
  { id: "versicherungen", label: "Versicherungen" },
  { id: "entscheidung", label: "Klar entscheiden" },
  { id: "team", label: "Ihr Team" },
  { id: "ablauf", label: "So starten wir" },
  { id: "stimmen", label: "Kundenstimmen" },
  { id: "faq", label: "Häufige Fragen" },
  { id: "kontakt", label: "Kontakt" },
] as const;

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** "03 / 09 · Strom & Gas" for section number n (1-based). */
export const counter = (n: number) => `${pad2(n)} / ${pad2(sections.length)} · ${sections[n - 1].label}`;

// --- Kontakt ----------------------------------------------------------------
export const mail = "info@domvesta.de";
export const phone = { label: "0176 45179132", href: "tel:+4917645179132" } as const;
/** WhatsApp Business: the number from the Impressum (Kundenvorgabe 29.10.2026). */
export const whatsapp = { label: "0172 7856681", href: "https://wa.me/491727856681" } as const;
export const instagram = "https://www.instagram.com/domvesta.de/";
/** Every "Erstgespräch vereinbaren" button: Calendly in a new tab. */
export const ctaLink = {
  href: "https://calendly.com/finanzen-bensiefkes/treffen-mit-domvesta-1",
  target: "_blank",
  rel: "noopener",
} as const;

// --- Rechtliches (Impressum + verantwortliche Stelle im Datenschutz) ---------
// Anschrift, Tätigkeit und E-Mail nach Kundenvorgabe (Oktober 2026); Telefon
// und Registerangaben weiterhin aus bensiefkes.de/impressum. Der
// Unternehmensberater ist extern und steht nur im Impressum als "Beraten
// durch" (Kundenvorgabe Oktober 2026).
export const legal = {
  owners: ["Ben Siefkes", "Joshua de Buhr"],
  business: "Energie- und Versicherungsmakler",
  consultant: { name: "Frank Willers", role: "Unternehmensberater" },
  street: "Hermann-Allmers-Weg 3",
  city: "26122 Oldenburg",
  phone: "+49 172 7856681",
  phoneHref: "+491727856681",
  email: "info@domvesta.de",
} as const;

// --- Gründer ----------------------------------------------------------------
// Aufklappbare Personen-Karten im Team-Abschnitt (Vorname, Rolle, Stichpunkte).
export const founders = [
  {
    name: "Joshua de Buhr",
    role: "Strom, Gas & Energieprojekte",
    points: [
      "Seit 2021 in der Energiebranche",
      "Spezialist für Strom & Gas",
      "Planung und Optimierung von Energieverträgen",
      "Photovoltaik- und Wärmepumpenprojekte",
    ],
  },
  {
    name: "Ben Siefkes",
    role: "Versicherungen & Rahmenverträge",
    points: [
      "Seit 2019 in der Finanz- und Versicherungsbranche",
      "Fokus Hausverwaltungen",
      "Spezialist für Rahmenverträge",
      "Wohngebäude- und Grundbesitzerhaftpflicht",
      "Gewerbeversicherungen",
    ],
  },
] as const;
