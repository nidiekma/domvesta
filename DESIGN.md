---
name: Domvesta
description: A cream page in orange and dark navy-violet with tactile, outlined cards — Entlastung made visible
colors:
  cream: "#f6f0e6"
  card-white: "#ffffff"
  night-navy: "#191625"
  slate-grey: "#625f64"
  sand-line: "#d9d0c4"
  signal-orange: "#fa641b"
  orange-text: "#d75617"
typography:
  display:
    fontFamily: "Instrument Serif, serif"
    fontSize: "clamp(2.8rem, 6.5vw, 5rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Instrument Serif, serif"
    fontSize: "clamp(2.2rem, 5.5vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.02
  title:
    fontFamily: "Instrument Serif, serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1.1
  body:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 600
    letterSpacing: "0.1em"
rounded:
  input: "12px"
  panel: "14px"
  card: "22px"
  frame: "28px"
  pill: "999px"
spacing:
  xs: "0.6rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.4rem"
  gutter: "clamp(1.2rem, 5vw, 3rem)"
  section-y: "clamp(3.5rem, 8vw, 6rem)"
components:
  button-solid:
    backgroundColor: "{colors.signal-orange}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "0.9rem 1.6rem"
  button-solid-hover:
    backgroundColor: "{colors.orange-text}"
  button-wire:
    backgroundColor: "transparent"
    textColor: "{colors.night-navy}"
    rounded: "{rounded.pill}"
    padding: "0.9rem 1.6rem"
  button-wire-hover:
    backgroundColor: "{colors.night-navy}"
    textColor: "#ffffff"
  chip:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.night-navy}"
    rounded: "{rounded.pill}"
    padding: "0.4rem 1rem"
  card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.night-navy}"
    rounded: "{rounded.card}"
    padding: "1.9rem 1.8rem"
  input:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.night-navy}"
    rounded: "{rounded.input}"
    padding: "0.85rem 1rem"
  tag:
    backgroundColor: "{colors.sand-line}"
    textColor: "{colors.night-navy}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.75rem"
---

# Design System: Domvesta

## Overview

**Creative North Star: "The Cleared Desk"**

Domvesta's site is a cream desk on which everything that used to be chaos has been sorted into a few tactile, clearly labeled objects. The page itself is cream; content lives on white cards with firm night-navy outlines and hard offset shadows, as if each card were a physical thing you could pick up. Numbered section labels (01–05) walk the visitor through the desk in order — the layout performs the Entlastung the product sells.

The mood is warm and inviting: cream instead of white, a dark navy-violet instead of black, warm orange as the spark, a large friendly serif that speaks in short confident lines. Wit appears in small doses (a slight rotation on button hover, a scrolling ticker) but never at the expense of B2B credibility. Iconography is a small set of 2px-stroke line pictograms (shield, bolt, umbrella, mail, phone) colored via currentColor in orange or night navy — never OS emoji. The explicit anti-reference is sterile corporate finance — cold blue-and-white broker templates with handshake stock photos. This system rejects that world with warmth, real photography (the founders, a real Mehrfamilienhaus), and paper-like materiality.

**Status (16.10.2026):** the colors below are the customer's brand palette and the whole site uses them (the former `/lab/domvesta` design is now the homepage; the scroll-world site is gone). The Colors section is current. Typography, Elevation and Components below still describe the earlier one-pager (Instrument Serif headlines, hard offset shadows); the live design uses Archivo Variable (wide, uppercase) for headlines and labels, Schibsted Grotesk for text, soft-bordered white cards and the orb hero; see `src/pages/index.astro`.

**Key Characteristics:**
- Cream background; content on white cards outlined in night navy
- Hard offset shadows (no blur) as the primary depth cue
- Instrument Serif display voice over Schibsted Grotesk workhorse text
- Three main colors: orange, cream, night navy. Orange acts, night navy carries
- Numbered, sequential section rhythm (01–05)

## Colors

The customer's brand palette (October 2026). The three main colors are orange, cream and night navy; grey, sand line and white support them.

### Primary
- **Signal Orange** (#fa641b): Accents, symbols/icons and contact surfaces. Owns every CTA, section-label dot, progress line, glow and highlighted headline line. White text on it reaches 3.0:1, accepted for the brand CTA.
- **Orange Text** (#d75617): Derived, not a brand color. Use it wherever orange is *type* (a highlighted headline line, link hover): Signal Orange only reaches 2.7:1 on Cream, Orange Text 3.5:1, so it is for large text only. Also the pressed/hover state of solid buttons.

### Secondary
- **Night Navy** (#191625, dark blue with a violet tint): Headlines, numbering, outlines and dark surfaces (dark bands, the trust box, footer). On it, text is white (17.8:1) or Signal Orange (5.8:1), never Slate Grey (2.8:1).

### Neutral
- **Cream** (#f6f0e6): The page background everywhere; also input fills.
- **Card White** (#ffffff): Light cards, forms and frames, and text on dark surfaces.
- **Slate Grey** (#625f64): Supporting text: leads, body paragraphs, list items (5.6:1 on Cream).
- **Sand Line** (#d9d0c4): Subtle markings: dividers, card borders, input strokes, side navigation.

### Named Rules
**The Three Colors Rule.** Orange, cream and night navy carry the brand; grey, sand line and white only support. No other hues: no mid blues, no browns, no extra greys.

**The Orange Acts Rule.** CTAs, highlights and progress are always orange; headlines, structure and trust surfaces are night navy. Night navy never calls to action as a solid fill on a cream page; orange is never running body text.

**The Cream Page Rule.** The page background is always Cream; pure white exists only as the surface of cards and as text on dark surfaces.

## Typography

**Display Font:** Instrument Serif (with serif fallback)
**Body Font:** Schibsted Grotesk (with sans-serif fallback)

**Character:** A big, warm editorial serif that speaks in short confident lines — always regular weight, with italics as its emphasis gesture — over a sturdy, friendly grotesk that does all the working text.

### Hierarchy
- **Display** (400, clamp(2.8rem, 6.5vw, 5rem), 0.98): Hero headline only; stacked lines, second line color-highlighted.
- **Headline** (400, clamp(2.2rem, 5.5vw, 4rem), 1.02): Section titles, max-width ~20ch; one italic word colored orange.
- **Title** (400, ~1.7–2rem, 1.1): Card and sub-block titles (expert names, service titles, process steps).
- **Body** (400, 17px base, 1.6): All running text in Schibsted Grotesk; secondary text in Slate Grey, ~52–70ch measure.
- **Label** (600–700, 0.72–0.9rem, 0.05–0.12em tracking, uppercase): Section labels, tags, "Das Ergebnis"-style eyebrows.

### Named Rules
**The Serif Speaks Rule.** Instrument Serif appears only at large sizes, only at weight 400, and its emphasis gesture is the italic — never bold. Everything functional (buttons, labels, body, forms) is Schibsted Grotesk.

**The One Italic Rule.** Headlines carry exactly one emphasized word or phrase — italic and/or accent-colored — never more.

## Layout

Single-column flow inside a 1180px container (`--maxw`), with generous vertical rhythm: section padding `clamp(3.5rem, 8vw, 6rem)` vertical and a shared `clamp(1.2rem, 5vw, 3rem)` gutter. Sections are announced by a numbered eyebrow label (orange circle + uppercase label) — the 01–05 sequence is a deliberate navigational rhythm.

Content grids are simple and even: two-column grids for experts, services, and the contact card (1.5rem gaps), a four-column stat band. The process list breaks the grid on purpose: alternating rows indent left (`margin-left: clamp(0px, 6vw, 5rem)`) and swap to Card White, creating a zig-zag path down the page.

Full-bleed bands (ticker, stat band, footer) interrupt the contained sections at deliberate points to reset attention.

**Responsive:** Two breakpoints. At 900px: nav links hide, all two-column grids collapse to one, stat band goes 2×2, process indent resets. At 520px: stat band stacks fully, form rows stack, footer left-aligns.

## Elevation & Depth

Depth is structural, not atmospheric: raised surfaces are declared by a 2px Night Navy border plus a hard offset shadow — a solid block of flat color, equal x/y offset, zero blur (`6px 6px 0 var(--ink)` on cards, `3px 3px 0` on chips, `10px 10px 0` on hero-level frames). Hover states physically lift the object (`translate(-3px, -3px)`) and grow the shadow, switching its color to Signal Orange — elevation doubles as a color moment. The single exception is the solid button's soft orange glow (`0 12px 28px -12px rgba(250,100,27,0.8)`), which reads as warmth radiating from the primary action, not as ambient depth.

### Shadow Vocabulary
- **Chip offset** (`box-shadow: 3px 3px 0 #191625`): Small tactile elements (chips).
- **Card offset** (`box-shadow: 6px 6px 0 #191625`): Default raised card; hover grows to `10px 10px 0` in Signal Orange.
- **Frame offset** (`box-shadow: 10px 10px 0 <navy|orange>`): Hero-level frames (contact card, Calendly, video).
- **CTA glow** (`box-shadow: 0 12px 28px -12px rgba(250,100,27,0.8)`): Solid buttons only.

### Named Rules
**The Hard Shadow Rule.** Shadows are solid offset blocks — equal x/y, zero blur, flat color (ink by default, accent on hover). The only blurred shadow in the system is the CTA glow.

## Shapes

Two shape families coexist: **pills** (999px) for everything interactive-small — buttons, chips, badges, tags — and **soft rectangles** for containers, on a radius ladder that grows with importance: inputs 12px, inner panels 14px, process rows 20px, cards 22px, hero frames 24–28px. Borders are load-bearing: 2px solid Night Navy declares a raised object; 1.5px Sand Line declares a quiet inner panel. Circles appear as small punctuation (section-number dots, the badge dot, the success checkmark). The hero's background blob (blurred radial gradients in orange) is the one soft organic shape in the system.

## Components

### Buttons
- **Shape:** Pill (999px), 600 weight Schibsted Grotesk, 0.9rem × 1.6rem padding (lg: 1.05rem × 2rem).
- **Primary (solid):** Signal Orange fill, white text, orange CTA glow. Hover: Orange Text, lifts `translateY(-3px)` with a −1° rotation — the system's signature wink.
- **Secondary (wire):** Transparent with 2px Night Navy border and navy text. Hover: fills navy, text white, lifts 2px. On dark surfaces it inverts (white border and text, hover fills white).
- **Full-width variant** for form submission.

### Chips
- **Style:** White fill, 2px Night Navy border, pill shape, 600 weight, `3px 3px 0` ink shadow. Static labels (keyword summaries), not interactive filters.
- **Tag variant:** Sand Line fill, Night Navy uppercase text, no border or shadow — metadata, one level quieter than chips.

### Cards / Containers
- **Corner Style:** 22px (cards), 20px (process rows), 28px (contact frame).
- **Background:** Card White; Cream for alternating process rows.
- **Shadow Strategy:** Card offset per Elevation; hover lifts and recolors the shadow to Signal Orange.
- **Border:** Always 2px Night Navy.
- **Internal Padding:** ~1.9rem × 1.8rem; inner panels (notes, results) use 14px radius with 1.5px quiet borders.

### Inputs / Fields
- **Style:** Cream fill, 2px Sand Line border, 12px radius, labels above in 600 weight 0.9rem.
- **Focus:** Border turns Signal Orange with a soft orange ring (`0 0 0 3px rgba(250,100,27,0.15)`); no default outline.
- **Success state:** Form swaps to a centered confirmation with an orange circle checkmark.

### Navigation
- **Style:** Sticky translucent cream bar (82% cream via color-mix, 8px backdrop blur) with a 2px Night Navy bottom border. Links are 500 weight; hover draws a 2px orange underline from the left. Brand is logo + 700 weight name. Links hide below 900px (CTA button remains).

### Section Label (signature)
An orange circled number (1.9rem) plus uppercase tracked label, preceding every section headline. On dark surfaces it inverts (white circle, orange number). This is the system's wayfinding signature — new sections must join the numbered sequence.

### Ticker (signature)
A full-bleed Night Navy band with cream Instrument Serif phrases separated by orange ✦ stars, scrolling in a 30s linear loop. Pure brand texture; content is decorative (aria-hidden).

## Do's and Don'ts

### Do:
- **Do** give every raised surface the pair: 2px Night Navy border + hard offset shadow (equal x/y, zero blur).
- **Do** keep CTAs exclusively Signal Orange pills; night navy is for secondary (wire) actions only.
- **Do** set headlines in Instrument Serif 400 with exactly one italic/colored emphasis word.
- **Do** announce new sections with the numbered orange circle label, continuing the 01–05 sequence.
- **Do** use real photography (founders, buildings) — the humans are the trust strategy.
- **Do** draw icons as 2px-stroke line pictograms (24px grid, currentColor) matching the 2px border language.
- **Do** respect `prefers-reduced-motion` (global.css already zeroes animations).

### Don't:
- **Don't** introduce colors outside the palette (no mid blues, browns or extra greys) or a pure-white page background.
- **Don't** use soft blurred shadows on cards; the only glow allowed is the CTA glow.
- **Don't** use Instrument Serif at small sizes, in bold, or for functional UI text.
- **Don't** swap the roles: no navy CTAs, no orange body text, no Slate Grey text on Night Navy.
- **Don't** add stock imagery or corporate-finance clichés (handshakes, glass towers, suit photos).
- **Don't** use OS emoji as interface iconography — they render inconsistently and read consumer-grade.
- **Don't** rewrite client-approved copy while styling — wording changes are proposed, never silent.
