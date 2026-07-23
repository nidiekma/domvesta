---
target: homepage (src/pages/index.astro)
total_score: 21
max_score: 36
na_heuristics: 10
p0_count: 2
p1_count: 3
timestamp: 2026-07-23T21-23-07Z
slug: src-pages-index-astro
---
# Critique — Domvesta Homepage (src/pages/index.astro)

Method: dual-agent (A: isolated design review · B: isolated detector scan). Browser overlay skipped: no browser automation available without installing packages.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Form feedback solid; nav has no active-section state; Calendly frame silent when slow/blocked |
| 2 | Match System / Real World | 3 | Excellent domain German; but AI hero image with gibberish sign "MUILORTAN'S" and a stat band whose "Kennzahlen" are the numbers 1 and 2 |
| 3 | User Control and Freedom | 2 | Below 900px nav links vanish with no burger menu — mobile can't jump to Kontakt; errors are blocking alert(); no scroll-margin-top under sticky nav |
| 4 | Consistency and Standards | 3 | Internally disciplined; hero H1 breaks own One Italic Rule (3 colors); Schadensmanagement/Schadenmanager/Schadenfälle drift; em/en dash mix |
| 5 | Error Prevention | 1 | Demo mode: empty endpoint → fake "Danke, das ging raus!" while the message is discarded; no privacy hint at form; error path points to placeholder phone |
| 6 | Recognition Rather Than Recall | 3 | Good chips/tags/numbered wayfinding; but dual 01–05 numbering (sections AND process steps) collide |
| 7 | Flexibility and Efficiency | 2 | Multiple contact channels exist; no Calendly fallback link; mobile has only the nav CTA as accelerator |
| 8 | Aesthetic and Minimalist Design | 3 | Coherent, charming; service cards stack 6–7 typographic registers; stat band is filler dressed as proof |
| 9 | Error Recovery | 1 | Native alert() with dead placeholder number; JS-off submit GETs personal data into URL and loses it |
| 10 | Help and Documentation | n/a | Landing page; the Ablauf section does the expectation-setting |
| **Total** | | **21/36** | **Acceptable (58%)** |

## Design Specificity Verdict

**LLM assessment:** An authored skin on a template skeleton — with three rented parts leaking through. The design *system* ("Cleared Desk" tactile cards, two-voice color rule, Instrument Serif German confidence) is genuinely authored for this product; the layout performs the Entlastung the copy sells. But the *structure* is the standard SaaS landing skeleton (split hero → ticker → stat band → service cards → process → contact split → calendar embed) — swap the copy and a payroll startup could ship it. Three assets fight the system: (1) the hero image is visibly AI-generated — the building carries the gibberish sign "MUILORTAN'S" and reads as a hotel, not a Mehrfamilienhaus, directly contradicting the "only real proof" trust strategy; (2) the glossy 3D blue/gold logo belongs to a different brand universe than the flat warm paper world; (3) emoji-as-iconography (⚡🛡🤝) reads consumer-grade for B2B Geschäftsführerinnen and renders inconsistently per OS. Missed character opportunities: the digitales Lieferstellenportal (the actual product artifact) is never shown; the stat band wastes its full-bleed moment; the desk metaphor never escalates into the "ten Ansprechpartner become one" moment the hero claims.

**Deterministic scan:** 50 findings, all in src/layouts/DomvestaSite.astro. 14× overused-font on "Instrument Serif" — false positive for this project: DESIGN.md pins Instrument Serif as a deliberate brand commitment (candidate for `hooks ignore-value`). 31× font sizes off the DESIGN.md type ramp + 3× radii off the rounded scale — mechanically correct; reflects that the documented 5-step ramp is a simplification of the incumbent's many literal sizes (documentation granularity, not new drift). 1× layout-transition: nav underline animates `width` (real, small perf nit — animate transform/scale instead). 1× marquee: the ticker's infinite auto-scroll — detector flags it on principle; Assessment A judged it earned brand texture (aria-hidden, reduced-motion handled); tension noted, kept as a deliberate choice.

**Visual overlays:** not available — no browser automation without installing packages; CLI scan is the deterministic evidence for this run.

## Overall Impression

The system is better than the substance it currently carries. The visual language is disciplined, rhetorical, and genuinely product-specific — but the page's two highest-stakes moments (submitting the form, booking the call) are both broken in the current state (fake success on submit; Calendly placeholder renders an error), and the single most-viewed pixel area (hero image) undermines the "only real proof" strategy. The single biggest opportunity: make the trust chain airtight — real endpoint behavior, real imagery, verifiable identity — because the skeptical 54-year-old Geschäftsführerin the site must win notices exactly these things.

## What's Working

1. **The tactile card system is rhetoric, not decoration.** Hard offset shadows + ink borders make content read as sorted physical objects — the page demonstrates Entlastung. Hover lifts recolor shadows within the two-voice rule (experts → blue, services → orange).
2. **Reassurance is placed where fear lives.** Rating beside the hero CTA; "Unverbindlich" on step 01; "Wir antworten schnell" at the form; named lawyers in the Schadensmanagement note.
3. **The copy voice survives into microcopy.** "Wie heißen Sie?", "Worum geht's?", "Danke, das ging raus!" — same direct, lightly playful Sie-register everywhere.

## Priority Issues

**[P0] Demo mode ships a lie.** `contactForm.ts` with empty endpoint fakes 650ms latency then shows "Danke, das ging raus!" while discarding the message. Real inquiries silently destroyed with false confirmation — worst failure for a trust-selling site. Fix: gate on empty endpoint (visible demo badge, mailto fallback with real copy, or build-time failure). → $impeccable harden

**[P0] The hero image sabotages the trust strategy.** AI-generated building with gibberish signage "MUILORTAN'S", hotel-like storefront, alt text claiming "Mehrfamilienhaus." The exact skeptical persona this site must win notices generated text first. Fix: client must supply a real photo; interim, crop/reframe so no fake text is visible. → client asset + $impeccable polish

**[P1] Orange text fails WCAG AA repeatedly.** #e8651b is ~3.3:1 on white, ~3.0:1 on cream. Failing: white text on the solid-orange kontakt panel, orange section labels on cream, expert labels, result-label eyebrows. Audience skews 45+. Fix: text-safe darker orange (≥4.5:1) for sub-large type; rework kontakt panel contrast. → $impeccable polish

**[P1] ~9MB of unoptimized PNGs, including a 4.2MB logo used as favicon.** logo.png (4.2MB @38px + favicon link), team.png (2.9MB), mfh_background.png (2.0MB); no srcset, no modern formats; favicon.svg exists unused. Fix: resize + WebP/AVIF, srcset, point icon at favicon.svg. → $impeccable optimize

**[P1] No Datenschutz context at the form; Calendly loads unconditionally; mobile loses navigation.** No privacy sentence near submit (DSGVO expectation of exactly this audience); assets.calendly.com script loads for every visitor while the video was self-hosted specifically to avoid third parties; below 900px nav links vanish with no menu. Fix: privacy line + link at submit; click-to-load Calendly facade with direct link fallback; minimal mobile menu. → $impeccable harden + $impeccable adapt

**[P2] Dual 01–05 numbering collision.** Section wayfinding (01–05) vs process steps (01–05 at 3–5rem, visually dominant). Fix: differentiate one counter ("Schritt 1–5", or drop leading zeros). → $impeccable layout

## Persona Red Flags

**Jordan (first-timer):** Nav "Termin buchen" jumps straight to the currently-broken Calendly widget past all persuasion; three CTA labels ("Termin buchen" / "Kostenloses Erstgespräch" / "Anfrage abschicken") for two actions, nothing connects form and Calendly sections; required "Ihre Hausverwaltung" field blocks non-company prospects with no escape.

**Riley (stress tester):** Fake success on submit (demo branch), discovers deception on second visit. JS off: novalidate + no action → GET dumps personal data into the URL and loses it. Third-party blocked: Calendly frame is an empty white box, no href fallback anywhere. Failure path: alert() says "rufen Sie uns direkt an" — the only phone is the dead placeholder +49 000 0000000. Reduced motion: genuinely handled (pass).

**Casey (distracted mobile):** ~9MB of images on 3G; no nav below 900px → seven screens of thumb-scrolling to Kontakt; the 680px Calendly iframe becomes a scroll-trap; tappable tel: link dials the dead placeholder.

**Petra (54, Geschäftsführerin, 800 Einheiten, skeptical):** Reads "MUILORTAN'S" → files under "junge Makler mit KI-Template"; green cut-out halo on team.png reinforces "billig gemacht." Stat band offers nothing at her scale ("2 Experten" next to "1 Ansprechpartner" reads contradictory). The only proof link (ProvenExpert) and the Impressum both lead to bensiefkes.de, not Domvesta — "is Domvesta a company or a landing page?" is never answered. No Datenschutz sentence at the form; can't verify kontakt@domvesta.de exists. Closes tab, asks her network instead.

## Minor Observations

- Hardcoded `const year = 2026` will go stale.
- Hover lifts on non-interactive cards and process rows are false affordances.
- No scroll-margin-top on anchor targets (sections tuck under sticky nav).
- "Worum geht's?" preselects "Strom & Gas" — mislabeled inquiries; use "Bitte wählen".
- Dash inconsistency (em vs en); Schadensmanagement/Schadenmanager/Schadenfälle terminology drift; "Gasthemen" parses as "Gast-Themen" — propose changes to client, copy is approved wording.
- Hero H1 uses three colors — breaks the system's One Italic Rule at the most visible spot.
- `object-fit: cover` will crop a real video; `contain` on deep-paper is safer.
- No Open Graph/social meta — shared links unfurl bare.
- `role="status"` on success panel is genuinely good; but `.btn` and nav links lack system-styled `:focus-visible` (default outlines clash with pills).
- Detector: nav underline animates `width` (layout thrash — use transform); ticker marquee flagged on principle, kept as deliberate aria-hidden brand texture.

## Questions to Consider

1. Does "Alter Verwalter" charm Petra or insult her? The pun is good — but the surface reading addresses a 54-year-old Verwalterin as an "old administrator." Tested on anyone over 50?
2. If the promise is "ein Ansprechpartner," why does every verifiable trail (rating, Impressum, legal email) lead to bensiefkes.de instead of Domvesta? Would leading with the founders and introducing Domvesta as their joint venture be more credible until Domvesta has its own footprint?
3. The site sells Entlastung — why must the visitor traverse ~1,400 words to reach booking at position 05, below the secondary conversion? What would the page look like if booking were the second thing on it?
