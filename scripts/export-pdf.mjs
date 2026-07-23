// PDF-Export der Desktop-Ansicht (zum Verschicken an den Kunden).
//
// Methode: Voll-Seiten-Screenshot bei 1440px-Viewport (vh-Einheiten bleiben
// korrekt) und Einbettung in EINE PDF-Seite voller Länge. Der Platzhalter-
// Calendly ("Page not found") wird durch eine gebrandete Buchungs-Kachel ersetzt.
//
// Voraussetzung: Dev-Server läuft (npm run dev) + einmalig:  npm i --no-save puppeteer-core
// Aufruf:  node scripts/export-pdf.mjs     Output: ./pdf/Domvesta-Website-Desktop.pdf

import puppeteer from "puppeteer-core";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
];
const executablePath =
  process.env.CHROME_PATH || CHROME_CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error("Kein Chrome/Chromium/Edge gefunden. CHROME_PATH setzen.");
  process.exit(1);
}

const BASE = process.env.BASE_URL || "http://localhost:4321";
const WIDTH = 1440;
const SCALE = 2;
const OUT_DIR = "pdf";
const OUT_FILE = "Domvesta-Website-Desktop.pdf";

await mkdir(OUT_DIR, { recursive: true });
const TMP = join(tmpdir(), "domvesta-pdf");
await mkdir(TMP, { recursive: true });

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--hide-scrollbars"],
});

const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: 1200, deviceScaleFactor: SCALE });
await page.goto(BASE, { waitUntil: "load", timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1800)); // Reveal-Animationen ausspielen

// Platzhalter-Calendly durch gebrandete Buchungs-Kachel ersetzen.
await page.evaluate(() => {
  document.querySelectorAll(".calendly-inline-widget").forEach((box) => {
    box.style.height = "660px";
    box.innerHTML =
      '<div style="display:flex;flex-direction:column;height:100%;font-family:\'Schibsted Grotesk\',sans-serif;">' +
      '<div style="padding:20px 26px;border-bottom:1px solid #efe3cf;font-weight:700;color:#2a1c10;font-size:18px;display:flex;align-items:center;gap:10px;">' +
      '<span style="font-size:22px;">📅</span> Terminbuchung</div>' +
      '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:2rem;">' +
      '<div style="font-size:3.2rem;line-height:1;">🗓️</div>' +
      '<div style="font-family:\'Instrument Serif\',serif;font-size:2rem;color:#e8651b;">Live-Kalender (Calendly)</div>' +
      '<div style="color:#6b5742;max-width:36ch;font-size:1.02rem;line-height:1.5;">Hier wählen Ihre Kunden direkt einen freien Termin. Die interaktive Buchung erscheint an dieser Stelle auf der fertigen Website.</div>' +
      "</div></div>";
  });
});

// Astro-Dev-Toolbar aus dem PDF entfernen (nur im Dev-Modus vorhanden)
await page.evaluate(() => {
  document.querySelectorAll("astro-dev-toolbar").forEach((el) => el.remove());
});

// sicherstellen, dass alle Bilder (inkl. der beiden Personen) dekodiert sind
await page.evaluate(() =>
  Promise.all(
    [...document.images].map((img) =>
      img.complete
        ? null
        : new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          }),
    ),
  ),
);
await new Promise((r) => setTimeout(r, 300));

const dims = await page.evaluate(() => ({
  w: document.documentElement.clientWidth,
  h: Math.ceil(
    Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
  ),
}));

const pngPath = join(TMP, "page.png");
await page.screenshot({ path: pngPath, fullPage: true, type: "png" });
await page.close();

// PNG in eine einzelne PDF-Seite passender Größe einbetten.
const htmlPath = join(TMP, "page.html");
await writeFile(
  htmlPath,
  "<!doctype html><html><head><style>html,body{margin:0;padding:0}" +
    `img{display:block;width:${dims.w}px;height:${dims.h}px}</style></head>` +
    '<body><img src="page.png"></body></html>',
);
const pdfPage = await browser.newPage();
await pdfPage.goto(`file://${htmlPath}`, { waitUntil: "load" });
await pdfPage.evaluate(() => {
  const img = document.images[0];
  if (img && !img.complete)
    return new Promise((res) => {
      img.onload = res;
      img.onerror = res;
    });
});
await pdfPage.pdf({
  path: `${OUT_DIR}/${OUT_FILE}`,
  width: `${dims.w}px`,
  height: `${dims.h}px`,
  printBackground: true,
  pageRanges: "1",
});
await pdfPage.close();

await browser.close();
await rm(TMP, { recursive: true, force: true });
console.log(`✓ ${OUT_DIR}/${OUT_FILE}  (${dims.w}×${dims.h}px)`);
