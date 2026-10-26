# Creative direction

## Position

**A digital experience studio for brands with something to reveal.**

INVITÉ designs and builds the moment before a launch: teasers, reveals, invitations, RSVPs and the launch site itself, as one connected story. It is not a template shop and not a wedding service. The site has to prove that position by being the kind of experience it sells. That means a real signature moment, real interactive experiments and real client work, with every fact checked.

## The idea: signal

The brand idea is a broadcast. An announcement starts as interference, resolves into a clear signal, and opens into calm. The same arc shapes the whole site:

| Moment | On the site |
|---|---|
| Interference | The intro: a broken television powering on, snow, "NO SIGNAL" |
| Reconstruction | INVITÉ rebuilt band by band out of the noise |
| Line of light | The picture collapses into a thin line that opens the porcelain homepage |
| Clear signal | Calm, editorial pages with dark "signal rooms" (Creative Solutions, contact, footer, Jetour) |
| End of transmission | The footer closes with the same line of light |

The noise is used once, at the start, and then the site goes quiet. Everywhere else the idea appears only as small echoes: the signal-reveal scanlines, the line of light.

## Palette

| Token | Hex | Use |
|---|---|---|
| Porcelain | `#F3F2EF` | Main surface |
| Ink | `#0A0A0B` | Text on porcelain, dark rooms |
| Silver | `#BFC1C7` | Secondary text on ink |
| Graphite | `#55565B` | Secondary text on porcelain only (6.5:1) |
| Lavender signal | `#B8C4FF` | The one accent: lines of light, focus on dark, active states |
| Signal deep | `#5462B8` | Accent as text on porcelain (4.9:1) |

Case studies borrow each client's accent for their own pages: Casa Gelso wine `#4F181F`, Jetour copper `#D06F3C`. The INVITÉ header and footer stay unchanged around them.

## Typography

| Face | Role |
|---|---|
| Archivo (variable, wdth 75–125) | Display, navigation, buttons, body. The width axis gives one family both editorial and "engineered" voices. |
| Bodoni Moda Italic | Single expressive words inside headlines (*reveal*, *anticipation*). Never a whole sentence. |
| JetBrains Mono | Labels, section ids, metadata. Small and uppercase. |
| VT323 | The CRT screen only. |

Headlines use sentence case at a calm size. Giant uppercase is reserved for one word per case study (JETOUR).

## Motion: three levels

1. **Signature.** The intro and the line of light. It runs on arrival, shorter for returning visitors; with reduced motion it is a still frame that fades.
2. **Narrative.** The signal reveal (content locking in through scanlines), Fig. 01 (a signal travelling an orbit of three stages: Attention, Engagement, Action), case-study screens switching like channels, the line of light in How we work running to the stage you choose. Content is never hidden if the script does not run.
3. **Micro.** Hover fills from the entry edge, button arrows, the sound equaliser, focus rings. 160–320 ms.

Durations and easings are tokens in `css/tokens.css`. With `prefers-reduced-motion`, every level collapses to its end state.

## Hero

**One idea, three states, one drawing.** The headline keeps its three phrases (Designed to *attract*, Built to *engage*, Made for *action*), each whole on its own line, and steps in line by line, so the progression is visible at a glance and nothing is broken across lines.

- **Cascade.** Lines 2 and 3 are indented by .82 em and 1.64 em, so the right edges of the first and last line almost meet and the left edge steps. The Archivo / Bodoni italic pairing is unchanged; the italic verb ends each line, with no full stop.
- **Size.** The font size is a fraction of the column's width (`100cqw / 8.3`, with a viewport-based fallback), so the longest line, "Designed to attract", fills the column on any phone from 320 px up and cannot wrap, clip or overflow. A cap holds it back on wide screens (6.6 vw up to 100 px; 72 px on tablets). The steps are in em, so the cascade scales as one piece.
- **Phone.** About half the height of the old stack (132 px against 280 px at 390 px wide), a 16–17 px supporting line, and the primary button visible in the first screen. On the narrowest phones (up to 376 px) the button takes the full width and the text link sits under it.
- **Motion.** Unchanged: the signal reveal when the intro hands over (CSS), and the one-time Attention, Engagement, Action pass that lights each verb in turn (`js/hero/ConnectedDiagram.js`). Neither uses GSAP, neither hides the headline before the script runs, and with reduced motion the hero simply rests in its final state.

## Creative Solutions

**From attention to action.** A compact mosaic of four tiles instead of full-height panels. The titles are still the section's one bold element, set smaller and inside the grid.

- **Grid.** Twelve columns ruled by 1px lines, no cards: 001 full width, 002/003 at 7/5, 004 full width with the title on the right.
- **Outline and fill.** What you do is outlined, what you get is filled: "Get" / "NOTICED", "Your idea." / "Made with you." Engaging a tile fills its outline. The section's own heading is a small line ("Different needs. Thoughtful solutions.") above one filled heading ("Creative solutions, made for you.").
- **One motion per title, acting out the words**: crop marks close around NOTICED; ANTICIPATION fills behind a lavender edge; the paper tile of IMPRESSION is pressed with ink; YOU’RE INVITED opens like a folded card along a lavender crease. Nothing loops. Two more motions (letters turning to outlines near the pointer; letters gathering) are kept in the code for a future tile.
- **Information on demand.** A tile shows number, title, category and a short description. Details hold one headline (in Bodoni italic) and three blocks, one question each: What it is, Why it works, What we can include (a list of possibilities, never a promise), plus "Discuss a project like this", which opens the contact form with that project type chosen.
- **Project catalog.** "See Project Catalog →" closes each Details panel, in a quiet row (a hairline leading to a ghost button that fills lavender while open). The catalog opens in place on a slightly darker ground than the panel, so it reads as a room inside it: a kicker, "Project *catalog*" (grotesk and Bodoni italic, like the section headings), a count and a Close, then the cards, then a restrained "Have a project in mind?" with the one primary button. Cards are a 3:2 picture (a lavender foot rule and a slow 1.035 zoom on hover, as the tiles do), a small mono status chip (a dot and Live, In development or Concept), industry / service in mono, the name in the display grotesk, one honest sentence, the deliverables as a mono list, and two actions: a ghost "View Case Study →" and a text link "Explore Live Experience ↗". It opens with a 0.6 s height-and-fade (the same technique as the details) and nothing else moves. With reduced motion it simply appears.
- **Honest by construction.** A card needs a real cover image and a true status; links appear only when the page or address exists. A service with no project says so and offers the contact button instead of a placeholder.
- **Our signature: the connected launch.** Teaser → Reveal → Invitation → RSVP → Launch as one small stepper, stated as optional stages, not a package.
- **Lavender stays an accent**: numbers, crop marks, the fill edge, the open tile's rule, the status dots, focus.

## How we work

**One composition, not four blocks.** The four stages are a rail, a number and a panel; the visitor chooses the stage and everything follows it.

- **Rail.** The four names hung from one hairline, three of the twelve columns each. A 2 px line of light runs from the left edge to the right edge of the chosen stage; stages behind it read in ink, the chosen one is bolder, the ones ahead stay grey. No boxes, no fills.
- **The number as type.** A still zero in ink and the stage's digit in the accent, in Bodoni Moda Italic, as tall as the panel. The digit rolls up or down a column when the stage changes. The part that changes carries the colour, as the line of light and the ampersand do.
- **Panel.** The stage name in bold Archivo at heading size (ampersand in the Bodoni italic), one sentence, and "You get" as a hairline row with a short line of light above it, at the same height in every stage. The four panels share one grid cell, so the section never changes height.
- **Asymmetry.** Number on the left, text on the right; the headline offset to column 4 and the lead at the right edge. The section is about 30–40 % shorter than the stacked list it replaced.
- **Motion.** An arrival once, when the section is seen; a hand-over when the stage changes (the line runs and the number rolls in about a second, the title leaves and the next one rises, the text follows; settled after about a second and a half); a hairline drawn over a stage ahead on hover. No scroll hijacking, no pinning, no parallax, nothing loops.
- **Phone.** The number above the panel, and the rail keeps only 01–04 as four large touch targets; the name is the panel's heading.

## Sound

Sound is synthesised in the browser (Web Audio); there are no audio files. It is off by default. It follows the visitor's choice, which is remembered, and it waits for a first interaction, as browsers require.

- **The intro** keeps its television: power-on thunk, static, zaps, the logo tone.
- **The site** has its own music, all in G major so nothing ever clashes: a soft pad that changes chord as each section reaches the middle of the screen (hero Gmaj9, work Em9, solutions Cmaj9, studio D6/9, contact Gadd9), opens a little while the page scrolls and settles when it stops, and sparse glass bells over it. It waits while the intro plays.
- **The interface** speaks the same language, quietly: a tiny blip on hover; each solution tile has its own note, so scrolling through the mosaic plays a short rising phrase; the diagram's travelling signal touches each stage with a faint note; form steps tap forward and back; a sent message resolves in a small chord.
- `js/config.js` → `sound.ambient: false` keeps only the interface sounds; `sound.volume` scales everything.

## Copy principles

- Say what was built, for whom, and how. Do not use adjectives as evidence.
- No invented numbers, clients, awards or availability. Case studies show results only when real data exists (none yet).
- Creative Solutions describes four real areas of work. Its project catalog lists only projects that exist, with their own images and an honest status; an idea is labelled a concept, never presented as client work. No fictional brands, no invented demos, no stock pictures standing in for screenshots, and no "View Case Study" or "Explore Live Experience" button until that page or address is real. No promises of revenue, conversion or advertising performance without evidence.
- The 004 catalog is set as editorial spreads: a plate in each invitation's own colour, up to three real screens of the live invitation in a staggered composition, and beside them the name, facts and a lavender link to the live page. The plate colour comes from the invitation, never from the site's palette, so each project looks like itself against the ink drawer. No device frames, shadows or gradients; the screens carry only a hairline and a phone-display corner. Motion is one reveal per spread and a small pointer drift, nothing that loops.
- English first. Strings used by scripts sit in `js/i18n/` so a Georgian edition can follow.
