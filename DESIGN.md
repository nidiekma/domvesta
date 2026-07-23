---
name: Domvesta
description: A warm paper world with tactile, ink-outlined cards — Entlastung made visible
colors:
  warm-paper: "#fbf2e4"
  deep-paper: "#f6e8d3"
  card-white: "#ffffff"
  espresso-ink: "#2a1c10"
  soft-umber: "#6b5742"
  signal-orange: "#e8651b"
  burnt-orange: "#cc4f0c"
  trust-blue: "#1f4e8c"
  powder-blue: "#dbe6f3"
  parchment-line: "#e6d6bf"
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
    backgroundColor: "{colors.burnt-orange}"
  button-wire:
    backgroundColor: "transparent"
    textColor: "{colors.trust-blue}"
    rounded: "{rounded.pill}"
    padding: "0.9rem 1.6rem"
  button-wire-hover:
    backgroundColor: "{colors.trust-blue}"
    textColor: "#ffffff"
  chip:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.espresso-ink}"
    rounded: "{rounded.pill}"
    padding: "0.4rem 1rem"
  card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.espresso-ink}"
    rounded: "{rounded.card}"
    padding: "1.9rem 1.8rem"
  input:
    backgroundColor: "{colors.warm-paper}"
    textColor: "{colors.espresso-ink}"
    rounded: "{rounded.input}"
    padding: "0.85rem 1rem"
  tag:
    backgroundColor: "{colors.powder-blue}"
    textColor: "{colors.trust-blue}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.75rem"
---

# Design System: Domvesta

## Overview

**Creative North Star: "The Cleared Desk"**

Domvesta's site is a warm paper desk on which everything that used to be chaos has been sorted into a few tactile, clearly labeled objects. The page itself is cream paper; content lives on white cards with firm espresso-ink outlines and hard offset shadows, as if each card were a physical thing you could pick up. Numbered section labels (01–05) walk the visitor through the desk in order — the layout performs the Entlastung the product sells.

The mood is warm and inviting: cream instead of white, espresso brown instead of black, a large friendly serif that speaks in short confident lines. Wit appears in small doses (a slight rotation on button hover, a scrolling ticker, emoji as card icons) but never at the expense of B2B credibility. The explicit anti-reference is sterile corporate finance — cold blue-and-white broker templates with handshake stock photos. This system rejects that world with warmth, real photography (the founders, a real Mehrfamilienhaus), and paper-like materiality.

**Key Characteristics:**
- Warm cream paper background; content on white ink-outlined cards
- Hard offset shadows (no blur) as the primary depth cue
- Instrument Serif display voice over Schibsted Grotesk workhorse text
- Two accent voices: orange acts, blue reassures
- Numbered, sequential section rhythm (01–05)

## Colors

A warm paper-and-ink base with two clearly divided accent voices.

### Primary
- **Signal Orange** (#e8651b): The action color. Owns every CTA, section-label circle, checkmark, star, highlighted headline line, and hover accent. **Burnt Orange** (#cc4f0c) is its pressed/hover state only.

### Secondary
- **Trust Blue** (#1f4e8c): The reassurance color. Owns trust-adjacent moments — the stat band background, the Schadensmanagement note, process tags, wire buttons, italic emphasis inside body copy. **Powder Blue** (#dbe6f3) is its soft fill for badges and tags.

### Neutral
- **Warm Paper** (#fbf2e4): The page background everywhere; also input fills.
- **Deep Paper** (#f6e8d3): Alternate card fill (offset process rows, video frame backdrop).
- **Card White** (#ffffff): The surface of raised cards, forms, and frames.
- **Espresso Ink** (#2a1c10): All borders, headings, dark bands (ticker, footer), and default shadow color. The system's "black."
- **Soft Umber** (#6b5742): Secondary text — leads, body paragraphs, list items.
- **Parchment Line** (#e6d6bf): Quiet borders — input strokes, dotted dividers, result-panel outlines.

### Named Rules
**The Two Voices Rule.** Orange acts, blue reassures. CTAs, highlights, and progress are always orange; trust, partnership, and process metadata are always blue. Neither color takes the other's job.

**The Warm Paper Rule.** There is no gray and no pure-white page background in this system. Every neutral is warm (cream, parchment, umber, espresso); pure white exists only as the surface of raised cards.

## Typography

**Display Font:** Instrument Serif (with serif fallback)
**Body Font:** Schibsted Grotesk (with sans-serif fallback)

**Character:** A big, warm editorial serif that speaks in short confident lines — always regular weight, with italics as its emphasis gesture — over a sturdy, friendly grotesk that does all the working text.

### Hierarchy
- **Display** (400, clamp(2.8rem, 6.5vw, 5rem), 0.98): Hero headline only; stacked lines, second line color-highlighted.
- **Headline** (400, clamp(2.2rem, 5.5vw, 4rem), 1.02): Section titles, max-width ~20ch; one italic word colored orange.
- **Title** (400, ~1.7–2rem, 1.1): Card and sub-block titles (expert names, service titles, process steps).
- **Body** (400, 17px base, 1.6): All running text in Schibsted Grotesk; secondary text in Soft Umber, ~52–70ch measure.
- **Label** (600–700, 0.72–0.9rem, 0.05–0.12em tracking, uppercase): Section labels, tags, "Das Ergebnis"-style eyebrows.

### Named Rules
**The Serif Speaks Rule.** Instrument Serif appears only at large sizes, only at weight 400, and its emphasis gesture is the italic — never bold. Everything functional (buttons, labels, body, forms) is Schibsted Grotesk.

**The One Italic Rule.** Headlines carry exactly one emphasized word or phrase — italic and/or accent-colored — never more.

## Layout

Single-column flow inside a 1180px container (`--maxw`), with generous vertical rhythm: section padding `clamp(3.5rem, 8vw, 6rem)` vertical and a shared `clamp(1.2rem, 5vw, 3rem)` gutter. Sections are announced by a numbered eyebrow label (orange circle + uppercase label) — the 01–05 sequence is a deliberate navigational rhythm.

Content grids are simple and even: two-column grids for experts, services, and the contact card (1.5rem gaps), a four-column stat band. The process list breaks the grid on purpose: alternating rows indent left (`margin-left: clamp(0px, 6vw, 5rem)`) and swap to Deep Paper, creating a zig-zag path down the page.

Full-bleed bands (ticker, stat band, footer) interrupt the contained sections at deliberate points to reset attention.

**Responsive:** Two breakpoints. At 900px: nav links hide, all two-column grids collapse to one, stat band goes 2×2, process indent resets. At 520px: stat band stacks fully, form rows stack, footer left-aligns.

## Elevation & Depth

Depth is structural, not atmospheric: raised surfaces are declared by a 2px Espresso Ink border plus a hard offset shadow — a solid block of flat color, equal x/y offset, zero blur (`6px 6px 0 var(--ink)` on cards, `3px 3px 0` on chips, `10px 10px 0` on hero-level frames). Hover states physically lift the object (`translate(-3px, -3px)`) and grow the shadow, often switching its color to an accent (blue or orange) — elevation doubles as a color moment. The single exception is the solid button's soft orange glow (`0 12px 28px -12px rgba(232,101,27,0.8)`), which reads as warmth radiating from the primary action, not as ambient depth.

### Shadow Vocabulary
- **Chip offset** (`box-shadow: 3px 3px 0 #2a1c10`): Small tactile elements (chips).
- **Card offset** (`box-shadow: 6px 6px 0 #2a1c10`): Default raised card; hover grows to `10px 10px 0` in blue or orange.
- **Frame offset** (`box-shadow: 10px 10px 0 <ink|orange|blue>`): Hero-level frames (contact card, Calendly, video).
- **CTA glow** (`box-shadow: 0 12px 28px -12px rgba(232,101,27,0.8)`): Solid buttons only.

### Named Rules
**The Hard Shadow Rule.** Shadows are solid offset blocks — equal x/y, zero blur, flat color (ink by default, accent on hover). The only blurred shadow in the system is the CTA glow.

## Shapes

Two shape families coexist: **pills** (999px) for everything interactive-small — buttons, chips, badges, tags — and **soft rectangles** for containers, on a radius ladder that grows with importance: inputs 12px, inner panels 14px, process rows 20px, cards 22px, hero frames 24–28px. Borders are load-bearing: 2px solid Espresso Ink declares a raised object; 1.5px Parchment Line or Trust Blue declares a quiet inner panel. Circles appear as small punctuation (section-number dots, the badge dot, the success checkmark). The hero's background blob (blurred radial gradients in both accent colors) is the one soft organic shape in the system.

## Components

### Buttons
- **Shape:** Pill (999px), 600 weight Schibsted Grotesk, 0.9rem × 1.6rem padding (lg: 1.05rem × 2rem).
- **Primary (solid):** Signal Orange fill, white text, orange CTA glow. Hover: Burnt Orange, lifts `translateY(-3px)` with a −1° rotation — the system's signature wink.
- **Secondary (wire):** Transparent with 2px Trust Blue border and blue text. Hover: fills blue, text white, lifts 2px.
- **Full-width variant** for form submission.

### Chips
- **Style:** White fill, 2px Espresso Ink border, pill shape, 600 weight, `3px 3px 0` ink shadow. Static labels (keyword summaries), not interactive filters.
- **Tag variant:** Powder Blue fill, Trust Blue uppercase text, no border or shadow — metadata, one level quieter than chips.

### Cards / Containers
- **Corner Style:** 22px (cards), 20px (process rows), 28px (contact frame).
- **Background:** Card White; Deep Paper for alternating process rows.
- **Shadow Strategy:** Card offset per Elevation; hover lifts and recolors the shadow (experts → blue, services → orange).
- **Border:** Always 2px Espresso Ink.
- **Internal Padding:** ~1.9rem × 1.8rem; inner panels (notes, results) use 14px radius with 1.5px quiet borders.

### Inputs / Fields
- **Style:** Warm Paper fill, 2px Parchment Line border, 12px radius, labels above in 600 weight 0.9rem.
- **Focus:** Border turns Signal Orange with a soft orange ring (`0 0 0 3px rgba(232,101,27,0.15)`); no default outline.
- **Success state:** Form swaps to a centered confirmation with an orange circle checkmark.

### Navigation
- **Style:** Sticky translucent cream bar (82% cream via color-mix, 8px backdrop blur) with a 2px ink bottom border. Links are 500 weight; hover draws a 2px orange underline from the left. Brand is logo + 700 weight name. Links hide below 900px (CTA button remains).

### Section Label (signature)
An orange circled number (1.9rem) plus uppercase tracked label, preceding every section headline. On dark surfaces it inverts (white circle, orange number). This is the system's wayfinding signature — new sections must join the numbered sequence.

### Ticker (signature)
A full-bleed Espresso Ink band with cream Instrument Serif phrases separated by orange ✦ stars, scrolling in a 30s linear loop. Pure brand texture; content is decorative (aria-hidden).

## Do's and Don'ts

### Do:
- **Do** give every raised surface the pair: 2px Espresso Ink border + hard offset shadow (equal x/y, zero blur).
- **Do** keep CTAs exclusively Signal Orange pills; blue never calls to action.
- **Do** set headlines in Instrument Serif 400 with exactly one italic/colored emphasis word.
- **Do** announce new sections with the numbered orange circle label, continuing the 01–05 sequence.
- **Do** use real photography (founders, buildings) — the humans are the trust strategy.
- **Do** respect `prefers-reduced-motion` (global.css already zeroes animations).

### Don't:
- **Don't** introduce gray neutrals or a pure-white page background — every neutral stays warm.
- **Don't** use soft blurred shadows on cards; the only glow allowed is the CTA glow.
- **Don't** use Instrument Serif at small sizes, in bold, or for functional UI text.
- **Don't** swap the accent roles: no blue CTAs, no orange trust-metadata tags.
- **Don't** add stock imagery or corporate-finance clichés (handshakes, glass towers, suit photos).
- **Don't** rewrite client-approved copy while styling — wording changes are proposed, never silent.
