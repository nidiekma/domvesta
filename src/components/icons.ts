// Line icons for the homepage, after the customer's mobile mockups (Oct 2026):
// strokes in currentColor (night navy), parts with class "a" in orange.
// Shapes with fill="#fff" sit on white cards and hide the strokes behind them.
// Styling (.ic, .ic-lg, .ic-sm, .a) lives in the page's global style block,
// because markup injected with set:html doesn't get Astro's scope attribute.

const LG = {
  // Vorteile
  docCheck: `<path d="M17 7h21l11 11v36a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3z"/><path d="M38 7v11h11"/><path d="M22 27h16M22 34h19M22 41h11"/><circle class="a" cx="47" cy="50" r="7" fill="#fff"/>`,
  chartSearch: `<rect x="7" y="34" width="9" height="22" rx="2"/><rect x="21" y="24" width="9" height="32" rx="2"/><rect x="35" y="10" width="9" height="46" rx="2"/><circle class="a" cx="45" cy="40" r="9" fill="#fff"/><path class="a" d="M51.5 46.5 59 54"/>`,
  personSignal: `<circle cx="25" cy="20" r="9"/><path d="M9 56c0-9.4 7.2-17 16-17s16 7.6 16 17"/><path class="a" d="M45 31a9 9 0 0 1 0 12"/><path class="a" d="M50.5 26a16 16 0 0 1 0 22"/>`,
  // Versicherungen
  shieldCheck: `<path d="M32 7l19 7v15c0 12.5-8.2 22.4-19 27-10.8-4.6-19-14.5-19-27V14z"/><path class="a" d="M23 32l6.5 6.5L42 26"/>`,
  docsStack: `<path d="M13 19v33a3 3 0 0 0 3 3h26"/><rect x="20" y="9" width="31" height="38" rx="3" fill="#fff"/><path class="a" d="M27 21h17M27 28h17M27 35h11"/>`,
  // Portal dashboard (desktop): support agent with headset behind a laptop.
  support: `<circle cx="32" cy="17" r="7.5"/><path d="M22.5 18a9.5 9.5 0 0 1 19 0"/><rect x="20.5" y="16.5" width="4" height="7" rx="2"/><rect x="39.5" y="16.5" width="4" height="7" rx="2"/><path d="M41.5 23.5c0 3.5-3 5.5-6.5 5.5h-2"/><path d="M14 50c0-9.5 8-16.5 18-16.5S50 40.5 50 50"/><rect x="17" y="37" width="30" height="18" rx="2" fill="#fff"/><path d="M10 57h44"/><path class="a" d="M29.5 45.5h5"/>`,
  building: `<path d="M7 56h50"/><path d="M13 56V20l22-9v45"/><path d="M35 26h12a3 3 0 0 1 3 3v27"/><path d="M41 35h3"/><rect class="a" x="18" y="27" width="5" height="5" rx="1"/><rect class="a" x="27" y="27" width="5" height="5" rx="1"/><rect class="a" x="18" y="37" width="5" height="5" rx="1"/><rect class="a" x="27" y="37" width="5" height="5" rx="1"/>`,
};

const SM = {
  doc: `<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M9 12.5h6M9 16h6"/>`,
  list: `<path d="M10 6h10M10 12h10M10 18h10"/><circle cx="5" cy="6" r="1.2" fill="currentColor"/><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="5" cy="18" r="1.2" fill="currentColor"/>`,
  person: `<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>`,
  // Strom & Gas: the three rows next to the portal
  fileSearch: `<path d="M12.5 21H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7l5 5v3"/><path d="M14 3v5h5"/><path d="M9 11h5M9 14.5h2.5"/><circle cx="16" cy="16.5" r="3"/><path d="m18.2 18.7 2.3 2.3"/>`,
  calendarCheck: `<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="m9.2 15 2 2 3.8-3.8"/>`,
  gauge: `<path d="M5.6 18.4a9 9 0 1 1 12.8 0"/><path d="M11.4 13 14.5 7.7"/><path d="M12 5.2v1.3M7.2 7.2l.9.9M16.8 7.2l-.9.9M5.2 12h1.3M17.5 12h1.3"/>`,
  bars: `<path d="M4.5 20v-4.5M8.5 20v-7M12.5 20V4.5M16.5 20v-6M20.5 20v-9.5"/>`,
  bank: `<path d="M3 9.5 12 4l9 5.5"/><path d="M4 9.5h16"/><path d="M6.5 9.5V17M10.5 9.5V17M13.5 9.5V17M17.5 9.5V17"/><path d="M4 17h16M3 20.5h18"/>`,
  filePen: `<path d="M12.5 21H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7l5 5v2.5"/><path d="M14 3v5h5"/><path d="M9 11h5M9 14.5h2.5"/><path d="m14.5 21 .7-2.8 4.6-4.6a1.4 1.4 0 0 1 2 2l-4.6 4.6z"/>`,
  circleX: `<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>`,
  download: `<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5"/><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"/>`,
  housePlus: `<path d="M3 11 12 3.5l9 7.5"/><path d="M5 9.4v10.1a1 1 0 0 0 1 1h8"/><path d="M19 9.4V13"/><path d="M9.5 20.5v-3.5a2 2 0 0 1 4 0v3.5"/><path d="M18.5 15.5v6M15.5 18.5h6"/>`,
  filePlus: `<path d="M12 21H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7l5 5v4"/><path d="M14 3v5h5"/><path d="M18 15v6M15 18h6"/>`,
  // Portal dashboard (desktop)
  homeFill: `<path d="M12 3.5 3.5 11h2.3v9h4.7v-5.5h3V20h4.7v-9h2.3z" fill="currentColor"/>`,
  mail: `<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>`,
  help: `<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.7"/><circle cx="12" cy="17" r=".9" fill="currentColor"/>`,
  bolt: `<path d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12z"/>`,
  flame: `<path d="M12 21c-3.3 0-5.8-2.3-5.8-5.5 0-2.6 1.6-4.3 2.9-6 .3 1.4 1 2.4 2 3 .2-3.2 1.7-5.8 3.6-7.5.3 2.8 1.7 4.6 2.6 6.1.7 1.2 1 2.4 1 3.9 0 3.4-2.6 6-6.3 6z"/><path d="M12 21c-1.5 0-2.6-1.1-2.6-2.6 0-1.5 1.2-2.5 2.6-4 1.4 1.5 2.6 2.5 2.6 4 0 1.5-1.1 2.6-2.6 2.6z"/>`,
  phone: `<path d="M5 4h3.5l1.5 4-2 1.3a11 11 0 0 0 6.7 6.7L16 14l4 1.5V19a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4z"/>`,
  mobile: `<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18h2"/>`,
  chevron: `<path d="M9 6l6 6-6 6"/>`,
  arrow: `<path d="M4 12h16M14 6l6 6-6 6"/>`,
};

export type LgIcon = keyof typeof LG;
export type SmIcon = keyof typeof SM;

const svg = (box: number, size: string, body: string, cls: string) =>
  `<svg class="ic ic-${size}${cls ? ` ${cls}` : ""}" viewBox="0 0 ${box} ${box}" aria-hidden="true" focusable="false">${body}</svg>`;

/** Large two-tone card icon (64 grid). */
export const lg = (name: LgIcon, cls = "") => svg(64, "lg", LG[name], cls);
/** Small single-tone UI icon (24 grid). */
export const sm = (name: SmIcon, cls = "") => svg(24, "sm", SM[name], cls);
