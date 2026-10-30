// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://domvesta.de',
  // CSS goes into the HTML instead of separate files that block the first
  // paint. GitHub Pages caches every file for only 10 minutes, so separate
  // stylesheets hardly gained anything from the browser cache anyway.
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      // Astro builds for "esnext", so the CSS minifier adds no vendor prefixes
      // (e.g. -webkit-backdrop-filter for the frosted nav in Safari < 18).
      // Vite's own default browser baseline:
      cssTarget: ['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4'],
    },
  },
});
