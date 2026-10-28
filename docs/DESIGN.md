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

**Small sizes and enlarged text.** Up to 40 em wide (640 px at the normal text size) the two smallest steps of the scale stop at 12 px (labels, section numbers, captions) and 14 px; the scale above that is unchanged. Only the two logo lockups ("Studio" beside the wordmark, and the line in the middle of Fig. 01, which is hidden from screen readers) stay smaller. Breakpoints are in `em`, so a reader who raises the browser's text size meets the compact layouts sooner. Below 18 em (288 px at the normal size, 576 px at 200 % text) the header drops the word *Studio* and the sound switch, long button labels may wrap, a heading word wider than the screen may break, the contact tabs wrap and the brand in the middle of Fig. 01 shrinks to stay in its ring; below 13 em the stage numbers of Fig. 01 are hidden visually (a screen reader still reads them) so the three stage names have room; below 12 em the *Menu* button's padding is tightened.

## Motion: three levels

1. **Signature.** The intro and the line of light. It runs on arrival, shorter for returning visitors; with reduced motion it is a still frame that fades.
2. **Narrative.** The signal reveal (content locking in through scanlines), Fig. 01 (a signal travelling an orbit of three stages: Attention, Engagement, Action), case-study screens switching like channels, the line of light in How we work running to the stage you choose. Content is never hidden if the script does not run.
3. **Micro.** Hover fills from the entry edge, button arrows, the sound equaliser, focus rings. 160–320 ms.

Durations and easings are tokens in `css/tokens.css`. With `prefers-reduced-motion`, every level collapses to its end state.

## Hero

**One sentence, one drawing, one next step.** The headline says what the studio does, in the visitor's terms: *Where ideas become experiences.* Under it, one supporting sentence names the work and the people it is for, then two actions: **Start a project** (the primary, to the contact section) and a quiet text link, *Explore our work ↓*. The three phrases the headline used to carry (Designed to attract, Built to engage, Made for action) are still on the page as the three stages of Fig. 01 (Attention, Engagement, Action), where they explain how the four services fit together.

- **The drawing.** Three lines, each whole and never wrapped: "Where ideas" and "experiences." on the left edge, and the pivot, "become", stepped in so that it starts under "ideas" (2.92 em, the width of "Where "). The last word is the Bodoni Moda italic; the full stop is Archivo again. Archivo / Bodoni pairing, tracking and line height are as before.
- **Supporting sentence.** "Digital advertising, creative websites, interactive invitations and digital experiences for brands, creators and personal celebrations." It names all four areas and all three kinds of client, so a couple and a brand both see themselves in it. It is the sentence approved in the previous round.
- **Size.** The font size is a fraction of the column's width (`100cqw / 6.6`, with a viewport-based fallback for a browser without container units), so the stepped block, 6.34 em wide, always fits its column, from a 320 px phone up, and cannot wrap, clip or overflow. A cap holds it back on wide screens (6.6 vw up to 100 px; 72 px up to 900 px). The step is in em, so the three lines scale as one piece.
- **Phone.** The type runs from 44 px (320 px wide) to 60 px (430 px wide), about a quarter larger than the old three-phrase headline, and the block is 128 to 176 px tall. The supporting line (16 px, at most 36 characters wide) and both actions sit in the first screen at every phone size, with the start of Fig. 01 below them: the primary button's bottom edge is at 462 px on a 320 × 568 screen and 453 px on 390 × 844. On the narrowest phones (up to 376 px) the button takes the full width and the text link sits under it. Fig. 01's panel lists all four services in two columns (choosing a stage lights its own), so the strip of service links under the figure is not repeated on a phone; only the place (Tbilisi, working worldwide) remains.
- **Motion.** Unchanged: the signal reveal when the intro hands over (CSS), and the one-time Attention, Engagement, Action pass through Fig. 01 (`js/hero/ConnectedDiagram.js`). Neither uses GSAP, neither hides the headline before the script runs, and with reduced motion the hero rests in its final state.
- **If you change the words.** The divisor 6.6 is the width of the stepped block (6.34 em) with a little air; the step (2.92 em) is the width of "Where ". A different headline needs both numbers measured again (`.hero__title` and `.hero__line:nth-child(2)` in `css/home.css`).

## Creative Solutions

**From attention to action.** A compact mosaic of four tiles instead of full-height panels. The titles are still the section's one bold element, set smaller and inside the grid.

- **Grid.** Twelve columns ruled by 1px lines, no cards: 001 full width, 002/003 at 7/5, 004 full width with the title on the right.
- **Outline and fill.** What you do is outlined, what you get is filled: "Get" / "NOTICED", "Your idea." / "Made with you." Engaging a tile fills its outline. The section's own heading is a small line ("Different needs. Thoughtful solutions.") above one filled heading ("Creative solutions, made for you.").
- **One motion per title, acting out the words**: crop marks close around NOTICED; ANTICIPATION fills behind a lavender edge; the paper tile of IMPRESSION is pressed with ink; YOU’RE INVITED opens like a folded card along a lavender crease. Nothing loops. Two more motions (letters turning to outlines near the pointer; letters gathering) are kept in the code for a future tile.
- **Information on demand.** A tile shows number, title, category and a short description (on a phone every tile reads the same way: number and kind, the name, one sentence, Details). Details open directly under the tile, and since the tile above already names the service, the panel starts with its content: one headline (in Bodoni italic) and three blocks, one question each: What it is, Why it works, What we can include (a list of possibilities, never a promise), plus "Start a project like this", which opens the contact form with that project type chosen. On a phone the reading text is 15 px and the tile's own button is the one control that closes the panel; on tablet and desktop the panel also has a Close.
- **Project catalog.** "See Project Catalog →" closes each Details panel, in a quiet row (a hairline leading to a ghost button that fills lavender while open). The catalog opens in place on a slightly darker ground than the panel, so it reads as a room inside it: "Project *catalog*" (grotesk and Bodoni italic, like the section headings), a count and a Close, then the projects, then a restrained "Have a project in mind?" with the one primary button. The projects come in three layouts, chosen per service: **rows** (001 to 003: a compact ruled list, one row per project with a small cover, a status dot and Live, In development or Concept, industry and type in mono, the name in the display grotesk, one honest sentence and two actions, a ghost "View Case Study →" and a text link "Explore Live Experience ↗"), **cards** (a grid with one large picture each, kept for a service whose projects are shown nowhere else) and **spreads** (004). Casa Gelso and JETOUR are listed as rows under both 002 and 003, so the same real work is never repeated in full under different services; its full presentation is the case study and Selected Work. The catalog opens with a 0.6 s height-and-fade (the same technique as the details) and nothing else moves. With reduced motion it simply appears.
- **Honest by construction.** A project needs a real cover image and a true status; links appear only when the page or address exists. A service with no project (001 today) has no catalog button and no empty drawer: its Details end with a short note and the "Start a project" button, and the catalog appears by itself once a project names that service.
- **Our signature: the connected launch.** Teaser → Reveal → Invitation → RSVP → Launch as one small stepper, stated as optional stages, not a package.
- **Lavender stays an accent**: numbers, crop marks, the fill edge, the open tile's rule, the status dots, focus.

## How we work

**One composition, not four blocks.** The four stages are a rail, a number and a panel; the visitor chooses the stage and everything follows it.

- **Rail.** The four names hung from one hairline, three of the twelve columns each. A 2 px line of light runs from the left edge to the right edge of the chosen stage; stages behind it read in ink, the chosen one is bolder, the ones ahead stay grey. No boxes, no fills.
- **The number as type.** A still zero in ink and the stage's digit in the accent, in Bodoni Moda Italic, as tall as the panel. The digit rolls up or down a column when the stage changes. The part that changes carries the colour, as the line of light and the ampersand do.
- **Panel.** The stage name in bold Archivo at heading size (ampersand in the Bodoni italic), one sentence, and "You get" as a hairline row with a short line of light above it, at the same height in every stage. The four panels share one grid cell, so the section never changes height.
- **Asymmetry.** Number on the left, text on the right; the headline offset to column 4 and the lead at the right edge. The section is about 30–40 % shorter than the stacked list it replaced.
- **Motion.** An arrival once, when the section is seen; a hand-over when the stage changes (the line runs and the number rolls in about a second, the title leaves and the next one rises, the text follows; settled after about a second and a half); a hairline drawn over a stage ahead on hover. No scroll hijacking, no pinning, no parallax, nothing loops.
- **Phone (under 40 em).** No tabs: the four stages stay the plain, numbered list, all open, one after another (a short rule and the number on the left, the name, one sentence and "You get" on the right). Reading down is quicker than choosing among four buttons, and nothing is hidden. From 40 em up it is the rail, the number and the panel (below 43.75 em the number sits above the panel).

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
