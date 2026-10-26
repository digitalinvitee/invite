# Audit — INVITÉ website (single-file version, October 2026)

Scope: the previous `index.html` (one 1,600-line file with inline CSS and JavaScript), its WebGL scenes, audio, navigation, projects, Concept Laboratory and contact form. The two client projects it links to (Casa Gelso, JETOUR) were cloned from GitHub and inspected so that every fact in the new case studies is checked against source.

## What stays

| Asset | Why |
|---|---|
| Palette: porcelain, ink, silver, graphite, signal lavender | Distinctive, restrained, already associated with the brand. |
| Archivo, Bodoni Moda Italic, JetBrains Mono, VT323 | Good pairing; the problem was how evenly they were used, not the choice. |
| The broken-television signal | The strongest brand idea. It also has a real origin: Casa Gelso's "Coming Soon" beat uses an analog broken-signal treatment. |
| Synthesised Web Audio (no audio files) | Light, original, already working. |
| Casa Gelso and JETOUR | Real, live, end-to-end work. |
| "Fold" sculpture (a folded porcelain card with a signal thread) | Speaks to invitations and to revealing something. Keep it, make it quieter. |
| Teaser → Reveal → Invitation → RSVP → Launch journey | The clearest explanation of the signature offer. Moves into Capabilities. |
| Honest contact form (never shows a false "sent") | Non-negotiable. Keep and extend. |

## What improves

1. **Intro and homepage contrast.** The last version made the broken TV a permanent 100svh hero and repeated it in the footer. The calm editorial homepage never arrived, the value proposition sat below the fold, and three WebGL contexts could exist at once (hero TV, footer TV, Fold).
2. **Rendering cost.** The CRT re-painted a 1280 px 2D canvas and re-uploaded it as a texture on every frame, even when nothing in it changed. On mid-range phones this is the most expensive thing on the page.
3. **Bundle weight.** three.js (603 KB minified) loaded on every visit to draw full-screen quads that need ~150 lines of raw WebGL.
4. **Positioning and copy.** "We make digital feel different" says little about what is sold. Services leaned towards events and invitations. A hero line claimed "Booking: New projects for 2027" with no source.
5. **Typography.** Wide uppercase was used for almost every heading (hero, sections, offers, contact, footer), which flattened the hierarchy.
6. **Work.** Projects existed only as homepage blocks. There were no case studies, Jetour's status was ambiguous, and images were hot-linked full-size from `digitalinvitee.github.io` with no responsive sizes.
7. **Concept Laboratory.** Demos were mostly CSS loops (ad loop, hold-to-tune, flip card) with no shared narrative and little proof of technical range.
8. **Contact.** A forced six-step conversation for every visitor. There was no lighter "just say hello" route, no timeline question, no privacy notice and no delivery.
9. **Sound.** Two separate toggles, and the preference was not remembered.
10. **Fonts.** Loaded from Google Fonts, which sends every visitor's IP address to Google. That matters for an EU and German audience, and it costs an extra connection.
11. **Navigation.** "Studio" pointed at the services list, and there was no clear Start a project action.

## What goes (with reason)

| Removed | Reason |
|---|---|
| Velocity marquee ticker | Decoration without information; repeated the services. |
| Word-by-word manifesto block | Repeated statement. Its idea ("the event starts before the event") moves into the studio text. |
| Custom cursor | Decorative, and it set `cursor:none` on labels and form chips, which removed native affordances. |
| Footer TV | Redundant CRT. The signal returns where it does work: the intro and Lab experiment 04. |
| Persistent hero TV | Replaced by the intro → line of light → calm homepage sequence. |
| CSS ad loop and flip-card specimens | Replaced by four real, interactive experiments. |

## Technically broken or risky

1. **Black CRT screen (root cause found and fixed in v6, documented here).** A `for…in` loop copied every key of the animated uniform object into WebGL, including GSAP's internal `_gsap` key, which threw a TypeError on every frame. The earlier overlay intro had the same bug. The new renderer only ever writes a fixed list of uniforms.
2. **No lead delivery.** The form endpoint and email were empty, so no enquiry could reach the studio. The page was honest about it, but it was not a working contact channel.
3. **Missing social image.** `og:image` pointed to `og.jpg`, which did not exist, so shared links had no preview image.
4. **Hot-linked project images.** They fail under a strict content-security policy, had no responsive variants, and loaded originals of up to 682 KB.
5. **Canvas hero.** The largest above-the-fold element was a canvas, so the headline was not in the first viewport.
6. **No WebGL lifecycle.** No context-loss handling, no disposal, and renderers were never released.
7. **No canonical URL, sitemap, robots file, favicons or 404 page.**

## Found in the client sites (outside this project, worth fixing)

- **JETOUR**: now that the event date has passed, `updateCountdown()` throws `ReferenceError: Cannot access 'countdownTimer' before initialization` on load. It reads a `let` variable before its declaration (`typeof` does not protect the temporal dead zone). Visually harmless, but it fills the console.
- **JETOUR**: the Georgian invitation heading reads "JETOUR GEOGIA-ს" (missing R) in `index.html`.
- **Casa Gelso**: the README says the opening is 13 September 2026 and lists Cormorant Garamond and Manrope. The site, the calendar event (`2026-09-12T15:00Z`) and the footer all say 12 September, and the page loads Fraunces, DM Sans and Noto Georgian, so only the README is out of date.

## Missing for a production studio site

Case study pages · real form delivery with server-side validation and spam protection · privacy notice · legal notice · Open Graph images, favicons, manifest · sitemap, robots, canonical URLs · 404 page · structure for a Georgian version · graphics quality presets and a no-WebGL fallback · self-hosted fonts · deployment documentation.
