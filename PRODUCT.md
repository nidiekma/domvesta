# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Decision-makers at German Hausverwaltungen (property management companies) — owners and managing staff who juggle many Versorger, insurers, and contract documents across their Liegenschaften. They arrive via referral or the founders' outreach, evaluating whether to hand over their energy and insurance administration. Secondary audience: the founders' existing network (bensiefkes.de clients, ProvenExpert reviewers) checking credibility.

## Product Purpose

Domvesta is a two-person consultancy that takes energy (Strom & Gas) and insurance administration off Hausverwaltungen's plates. This site is its marketing presence: a German-language one-pager whose job is to earn trust and convert visitors into booked Erstgespräche. Success = a visitor books a first call via Calendly (primary conversion); the contact form is a secondary channel.

## Positioning

"Mehr Zeit für Hausverwaltungen. Energie & Versicherung – aus einer Hand." One Ansprechpartner instead of ten: Domvesta uniquely bundles both energy contracts and insurance (including Schadensmanagement) for property managers, combining a digital Lieferstellenportal with personal advice. Neighboring competitors do either insurance brokerage or energy consulting; the bundle plus Hausverwaltung specialization is the claim.

## Operating Context

- Client project: the site is built freelance for the founders (repo "joshua"); copy and structure went through client feedback rounds in July 2026 (docs/feedback.md, comments in src/data/site.ts).
- Content sources of truth: docs/copy.md (Wer wir sind, Ablauf) and docs/copy_v2.md (Hero, Was wir machen). Copy is client-approved wording — do not rewrite it silently.
- Client feedback (July 2026) already applied: only 2 service areas (Energie + Versicherung, Schadensmanagement folded into Versicherung as a note); services as scannable bullet points with keyword tags; compact expert cards under the team photo instead of long prose; Mehrfamilienhaus background image in the hero.
- A desktop PDF export (scripts/export-pdf.mjs → pdf/Domvesta-Website-Desktop.pdf) exists for client review rounds.
- Site structure: single landing page (index.astro) plus Impressum and Datenschutz legal pages. Impressum data mirrors bensiefkes.de/impressum (legal review flagged by client).

## Capabilities and Constraints

- Astro 7 + Tailwind CSS 4 static site, no backend. Contact form posts to a configurable endpoint (site.contactEndpoint, e.g. Formspree); empty endpoint = demo mode.
- Video is self-hosted (public/video/) deliberately — no third-party embed, to avoid Datenschutz issues.
- All content and configuration is centralized in src/data/site.ts; the brand name is a single field there.
- Placeholders (marked PLATZHALTER in site.ts): real email, phone, Calendly URL, contact endpoint, video file + poster. **The client will deliver all of these — never invent substitutes or fabricate contact data.**
- Language: German, formal "Sie" address throughout.

## Brand Commitments

- Name: **Domvesta** — confirmed final (July 2026). Logo: public/logo.png. Claim: "Mehr Zeit für Hausverwaltungen." / "Energie & Versicherung – aus einer Hand."
- Founders appear by name with real credentials: Ben Siefkes (Versicherung, since 2019) and Joshua de Buhr (Energie, since 2021). Team photo: public/team.png.
- Voice: direct, entlastend, lightly playful ("Alter Verwalter, ist das einfach!", "Verwalten war gestern."), but professional — the audience is B2B.
- Fonts in use: Instrument Serif + Schibsted Grotesk (via Fontsource).

## Evidence on Hand

- Real ProvenExpert rating: 4,9/5 from 55+ reviews (https://www.provenexpert.com/ben-siefkes-finanz-und-versicherungsmakler/) — the only third-party proof; it belongs to Ben Siefkes' existing broker profile.
- Real partnership: Wirth Rechtsanwälte + the insurance partner's digital Schadenmanager (named in the Schadensmanagement copy).
- Real legal/contact data for the Impressum from bensiefkes.de (Raiffeisenstraße 23, 26122 Oldenburg).
- No testimonials, case studies, client counts, or savings figures exist — do not fabricate any.

## Product Principles

1. **Convert to conversation, not to purchase** — every section should lower the threshold to booking the Erstgespräch; the site sells a first call, not a contract.
2. **Trust through real people** — two named founders with verifiable credentials are the product; keep them visible and never replace them with generic corporate imagery.
3. **Entlastung is the message and the experience** — the site must feel as effortless and organized as the service it promises; clutter contradicts the pitch.
4. **Only real proof** — ProvenExpert rating, named partners, and real credentials only; absence of testimonials/case studies is a fact to respect, not a gap to fill.
5. **Client-approved copy is load-bearing** — wording survived client feedback rounds; propose copy changes explicitly, never rewrite silently.
