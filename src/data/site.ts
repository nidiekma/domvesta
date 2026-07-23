// ============================================================================
// Zentrale Inhalts- & Konfigurationsdatei für die Domvesta-Website (Konzept C)
// ----------------------------------------------------------------------------
// Markenneutraler Dateiname (site.ts), damit ein möglicher Namenswechsel nur
// eine Zeile (site.name) betrifft.
//
// Texte "Wer wir sind" und "Ablauf" basieren auf docs/copy.md.
// Hero und "Was wir machen" basieren auf docs/copy_v2.md (Juli 2026).
// Nach Kundenfeedback (Juli 2026) angepasst:
//   - Nur noch 2 Leistungsbereiche (Energie + Versicherung); Schadenmanagement
//     ist als Unterpunkt in der Versicherungs-Karte integriert.
//   - Leistungstexte zu Stichpunkten zusammengefasst, Stichwort-Tags ergänzt.
//
// >>> PLATZHALTER sind mit "PLATZHALTER" markiert.
// ============================================================================

export const site = {
  // --- Marke -----------------------------------------------------------------
  name: "Domvesta", // <- Firmenname. Hier tauschen, wirkt überall.
  logo: "/logo.png",
  claim: "Mehr Zeit für Hausverwaltungen.",
  claimAccent: "Energie & Versicherung – aus einer Hand.",

  // --- Kontakt ---------------------------------------------------------------
  email: "kontakt@domvesta.de", // PLATZHALTER
  phone: "+49 000 0000000", // PLATZHALTER
  phoneHref: "+490000000000", // PLATZHALTER

  // --- Externe Links (PLATZHALTER) -------------------------------------------
  provenExpertUrl: "https://www.provenexpert.com/ben-siefkes-finanz-und-versicherungsmakler/",
  calendlyUrl: "https://calendly.com/domvesta-beispiel/erstgespraech",
  // Optionaler Form-Endpunkt (z. B. Formspree). Leer = Demo-Modus.
  contactEndpoint: "",

  rating: { score: "4,9", max: "5", count: "55+", platform: "ProvenExpert" },
} as const;

// --- Rechtliches (Daten aus bensiefkes.de/impressum) -------------------------
export const legal = {
  owners: ["Ben Siefkes", "Joshua de Buhr"],
  business: "Finanzdienstleistungen",
  street: "Raiffeisenstraße 23",
  city: "26122 Oldenburg",
  phone: "+49 172 7856681",
  phoneHref: "+491727856681",
  email: "finanzen@bensiefkes.de",
} as const;

// --- Gründer ----------------------------------------------------------------
// Nach Kundenfeedback (Juli 2026): Statt langem Fließtext kompakte
// Experten-Karten mit Stichpunkten unter dem Teamfoto.
export const founders = [
  {
    initials: "BS",
    name: "Ben Siefkes",
    label: "Versicherungs-Experte",
    icon: "shield",
    role: "Versicherungen & Rahmenverträge",
    points: [
      "Seit 2019 in der Finanz- und Versicherungsbranche",
      "Fokus Hausverwaltungen",
      "Spezialist für Rahmenverträge",
      "Wohngebäude- und Grundbesitzerhaftpflicht",
      "Gewerbeversicherungen",
    ],
  },
  {
    initials: "JB",
    name: "Joshua de Buhr",
    label: "Energie-Experte",
    icon: "bolt",
    role: "Strom, Gas & Energieprojekte",
    points: [
      "Seit 2021 in der Energiebranche",
      "Spezialist für Strom & Gas",
      "Planung und Optimierung von Energieverträgen",
      "Photovoltaik- und Wärmepumpenprojekte",
    ],
  },
] as const;

// --- Kennzahlen (ProvenExpert bleibt, "~7 Jahre" ersetzt) -------------------
export const stats = [
  { value: "4,9 / 5", label: "auf ProvenExpert", sub: "über 55 Bewertungen" },
  { value: "2", label: "Experten an Ihrer Seite", sub: "Ben Siefkes & Joshua de Buhr" },
  { value: "1", label: "Ansprechpartner", sub: "für Energie & Versicherung" },
  { value: "2", label: "Bereiche gebündelt", sub: "an einem Ort betreut" },
] as const;

// --- "Wer sind wir?" (Text 1:1 aus copy.md, Hervorhebungen als Markup) ------
export const about = {
  label: "Wer wir sind",
  headlineHtml: "Zwei Experten. Ein Ziel. <em>Mehr Zeit</em> für Hausverwaltungen.",
  // Festgeschriebene Stichwörter — fassen den Fließtext scanbar zusammen.
  keywords: [
    "Spezialisiert auf Hausverwaltungen",
    "Energie & Versicherung aus einer Hand",
    "Langfristige Partnerschaft",
    "Digital & persönlich",
  ],
  // Kurzintro (Kundenfeedback Juli 2026: knapper Text, Details in den
  // Experten-Karten darunter).
  bodyHtml: [
    "Wir sind <strong>Ben Siefkes</strong> und <strong>Joshua de Buhr</strong> – gemeinsam haben wir <em>Domvesta</em> gegründet, um Hausverwaltungen nachhaltig zu entlasten. Sie verwalten Immobilien, wir übernehmen Strom &amp; Gas sowie Versicherungen: persönlich, digital und als <em>langfristige Partnerschaft</em>.",
  ],
} as const;

// --- "Was wir machen" (Texte aus docs/copy_v2.md, als Stichpunkte gegliedert)
export const services = [
  {
    id: "energie",
    icon: "bolt",
    title: "Strom & Gas",
    claim: "Verwalten war gestern.",
    intro:
      "Unterschiedliche Energieversorger, unübersichtliche Verträge und fehlerhafte Abrechnungen kosten Hausverwaltungen täglich Zeit und Nerven.",
    points: [
      {
        k: "Preisprüfung & Rahmenverträge",
        v: "Wir prüfen Arbeitspreise für Strom und Gas und bilden Rahmen- und Bündelverträge ab.",
      },
      {
        k: "Alles an einem Ort",
        v: "Unser digitales Lieferstellenportal bündelt sämtliche Strom- und Gasverträge Ihrer Liegenschaften.",
      },
      {
        k: "Automatisch aktuell",
        v: "Neue Objekte werden automatisch ergänzt, bestehende Verträge laufend überprüft und Optimierungspotenziale kontinuierlich genutzt.",
      },
      {
        k: "Persönliche Beratung",
        v: "Wir stehen Ihnen bei allen Fragen rund um Energieverträge, Lieferanten und Vertragswechsel persönlich zur Seite.",
      },
    ],
    result:
      "Mehr Übersicht, weniger Verwaltungsaufwand und dauerhaft ein kompetenter Ansprechpartner für Ihre Energieversorgung.",
  },
  {
    id: "versicherung",
    icon: "shield",
    title: "Versicherungen",
    claim: "Papierkram war gestern.",
    intro:
      "Versicherungen gehören zu jeder Immobilie – aber nicht zu Ihrem Kerngeschäft. Deshalb übernehmen wir die Betreuung Ihrer Wohngebäude- und Grundbesitzerhaftpflichtversicherungen:",
    points: [
      {
        k: "Rahmenverträge",
        v: "Attraktive Konditionen für Ihre Liegenschaften.",
      },
      {
        k: "Vertragsmanagement",
        v: "Verwaltung aller Versicherungsunterlagen sowie laufende Prüfung auf Wechsel- und Optimierungsmöglichkeiten.",
      },
      {
        k: "Kommunikation",
        v: "Wir übernehmen die Abstimmung mit Versicherern und stehen Ihnen als persönlicher Ansprechpartner zur Seite.",
      },
    ],
    // Schadensmanagement ist bewusst kein eigener Bereich, sondern
    // Bestandteil der Versicherungsbetreuung (Kundenfeedback Juli 2026).
    note: {
      icon: "umbrella",
      title: "Inklusive Schadensmanagement",
      body: "Ein Schadensfall kostet vor allem Zeit. Deshalb begleiten wir Sie von der Schadensmeldung bis zur Regulierung: Gemeinsam mit Wirth Rechtsanwälte und dem digitalen Schadenmanager unseres Versicherungspartners sorgen wir für eine strukturierte, schnelle und rechtssichere Schadensabwicklung – mit möglichst geringem Aufwand für Ihre Hausverwaltung.",
    },
    result:
      "Mehr Zeit, weniger Verwaltungsaufwand und ein kompetenter Ansprechpartner für Versicherungen und Schadensmanagement.",
  },
] as const;

// --- Video unter "Was wir machen" -------------------------------------------
// Selbst gehostet (public/video/) — kein Drittanbieter, kein Datenschutz-Thema.
export const video = {
  src: "/video/domvesta.mp4", // PLATZHALTER — echte Videodatei hier ablegen
  poster: "/video/poster.svg", // PLATZHALTER — echtes Standbild hinterlegen
  title: "Domvesta in 90 Sekunden",
  lead: "Lieber anschauen statt lesen? Hier erklären wir kurz, wie wir Hausverwaltungen entlasten.",
} as const;

// --- "Ablauf" (Text 1:1 aus copy.md, Stichwort-Tags ergänzt) -----------------
export const processIntroHtml = "In 5 Schritten zu mehr Zeit für <em>das Wesentliche.</em>";
export const process = [
  {
    step: "01",
    title: "Unverbindliches Kennenlernen",
    tags: ["Kurzes Telefonat", "Erste Fragen klären", "Unverbindlich"],
    body: "In einem kurzen Telefonat lernen wir Ihre Hausverwaltung, Ihre aktuellen Abläufe sowie Ihre Herausforderungen rund um Versicherungen, Strom & Gas kennen. Gleichzeitig beantworten wir erste Fragen und prüfen gemeinsam, ob eine Zusammenarbeit für beide Seiten sinnvoll ist.",
  },
  {
    step: "02",
    title: "Persönlicher Termin oder Videocall",
    tags: ["Vor Ort oder digital", "Bestandsaufnahme", "Potenziale erkennen"],
    body: "Im nächsten Schritt besuchen wir Sie direkt in Ihrer Hausverwaltung oder führen einen Videocall durch. Gemeinsam verschaffen wir uns einen Überblick über Ihre bestehenden Versicherungs-, Strom- und Gasverträge sowie Ihre aktuellen Prozesse. So erkennen wir Optimierungs- und Einsparpotenziale.",
  },
  {
    step: "03",
    title: "Analyse & individuelles Konzept",
    tags: ["Individuelles Konzept", "Transparente Analyse"],
    body: "Auf Basis der Bestandsaufnahme entwickeln wir ein individuelles Betreuungskonzept für Ihre Hausverwaltung. Dabei zeigen wir Ihnen transparent auf, wie wir Verwaltungsaufwand reduzieren, Prozesse vereinfachen und bestehende Verträge optimieren können.",
  },
  {
    step: "04",
    title: "Umsetzung",
    tags: ["Wir koordinieren alles", "Kein Aufwand für Sie"],
    body: "Nach Ihrer Freigabe übernehmen wir die komplette Umsetzung. Wir koordinieren Vertragswechsel, stimmen uns mit Versicherern und Energieversorgern ab und richten die zukünftige Betreuung Ihrer Verträge ein – für Sie so einfach und unkompliziert wie möglich.",
  },
  {
    step: "05",
    title: "Langfristige Betreuung",
    tags: ["Fester Ansprechpartner", "Laufende Optimierung", "Dauerhaft entlastet"],
    body: "Auch nach der Umsetzung bleiben wir Ihr persönlicher Ansprechpartner. Wir begleiten Schadenfälle, beantworten Fachfragen, prüfen regelmäßig Optimierungsmöglichkeiten und kümmern uns um Ihre Versicherungs-, Strom- und Gasthemen. So sparen Sie dauerhaft Zeit und können sich auf Ihr Kerngeschäft konzentrieren.",
  },
] as const;

// --- Hero-Texte (aus docs/copy_v2.md) ----------------------------------------
export const hero = {
  // Zeile mit Index 1 wird farbig hervorgehoben.
  lines: ["Alter Verwalter,", "ist das <em>einfach!</em>"],
  lead:
    "Keine zehn Ansprechpartner mehr für Energie & Versicherung. Nur noch einer — persönlich, digital und zuverlässig.",
} as const;

// --- Laufband ---------------------------------------------------------------
export const ticker = [
  "Strom & Gas", "Versicherungen", "Ein Ansprechpartner", "Persönlich & digital",
  "4,9 / 5 auf ProvenExpert", "Für Hausverwaltungen", "Mehr Zeit fürs Wesentliche",
] as const;

// --- Auswahl im Kontaktformular ---------------------------------------------
export const interessensbereiche = [
  "Strom & Gas", "Versicherungen & Schadenfälle", "Alles aus einer Hand",
] as const;
