# Update: invite_final_8 → invite_final_9 (final copy and the mobile hero)

Two things changed: the **hero headline** has a new composition (the big difference is on a phone), and the **words** of the sections around it now follow the final copy brief. Everything else is as it was in invite_final_8: the contact form and its Google Apps Script, the RSVP of the wedding invitations, the two wedding projects in the 004 catalog, Selected Work, the colours and typefaces, the navigation and where every link goes. 11 files changed (list at the end), none added or removed.

## The hero

The words are the same ("Designed to attract / Built to engage / Made for action") and the full stops are gone. The supporting line is now "Digital advertising, creative websites, interactive invitations and digital experiences for brands, creators and personal celebrations."

| Phone (width × height) | Headline height, before → now | "Explore Our Work" button, before → now |
|---|---|---|
| 320 × 568 | 280 → 106 px | below the first screen (bottom edge at 632 px) → inside it (433 px) |
| 375 × 812 | 280 → 126 px | 606 → 414 px |
| 390 × 844 | 280 → 132 px | 608 → 420 px |
| 430 × 932 | 292 → 146 px | 626 → 434 px |

On a phone the headline is now about half its former height, and the supporting line, both buttons and the top of Fig. 01 are in the first screen. On a desktop the type is the same size as before (95 px at 1440 px wide) and the block is about 4 % taller; the change there is the composition. Between about 600 and 900 px (small tablets, phones turned sideways) the headline now fills its column, so it is a little larger than before (66 px against 55 px at 600 px).

- **Composition.** The three phrases are one stepped drawing. *Designed to attract* starts at the left edge, *Built to engage* is one step in, *Made for action* two steps in, so attract, engage, act reads as a movement. Each phrase stays whole on its own line (nothing is split, wrapped or hyphenated). The first and third lines end at nearly the same place, so the block reads as a balanced shape, and the italic verb ends each line, which is why the missing full stop is not missed.
- **Size follows the column.** The type is sized from the width of its column (CSS container units), so the longest phrase fills the column on every screen and cannot overflow, from a 320 px phone up. There is no minimum size to break the fit. On a wide screen a cap (6.25 rem) holds it back, and from tablet width down the cap is 4.5 rem. Checked from 320 to 1920 px: no horizontal overflow, nothing clipped, every phrase on one line.
- **Phone details.** The supporting line is set at body size (16 px, at most 36 characters wide) and the space above the eyebrow is smaller. Up to 376 px wide the primary button takes the full width with "Discuss a Project" under it; from 390 px they sit side by side.
- **Same identity.** Porcelain, ink and lavender; Archivo, with the Bodoni Moda italic on the verb; the same eyebrow, buttons and destinations. No cards, glass, gradients or decoration were added. The old phone-only headline rules in `css/home.css` were deleted; nothing else used them.
- **Motion: unchanged.** The hero has no GSAP. Its arrival is a short CSS reveal that starts when the intro hands over, and the lit line and Fig. 01 are driven by a small script (`js/hero/`). I changed neither: the stepped lines fit the existing reveal, nothing is split word by word, and reduced motion still shows everything at once. The arrival was measured on the new layout (see below).
- **If you change the words.** The divisor 8.3 in the headline's `font-size` is the width of the longest phrase ("Designed to attract") in em. A different longest phrase needs a new number, and the steps (`.82em`, `1.64em`) can be tuned in the same block of `css/home.css`.

## The copy

| Where | Now |
|---|---|
| **Page description** (search result, link preview, structured data) | Reworded from the hero line, so a visitor arriving from a search sees the same promise: "Independent creative digital studio in Tbilisi. Digital advertising, creative websites, interactive invitations and digital experiences for brands, creators and personal celebrations." The page title is unchanged ("INVITÉ — From Attention to Action."). |
| **02 What we create** | Label *What we create*; small heading *Different needs. Thoughtful solutions.*; heading *Creative solutions, made for you.*; the body paragraph; and the closing line *Explore our services and discover what we can create together.* All as in the brief. |
| **The four tiles** | 001 Digital Advertising & Motion Campaigns · *Get noticed*; 002 Launch & Interactive Experiences · *Build anticipation*; 003 Creative Websites & Digital Experiences · *Make an impression*; 004 Digital Invitations & Event Experiences · *You’re invited*. Each has the approved one-line description. Still four; no fifth, and no "Beyond the Feed". |
| **The four Details panels** | Each answers three questions under the same labels: *What it is*, *Why it works*, *What we can include*. 004 uses the copy from the brief (headline *An invitation worth opening.*, the description, the benefit, and the eight features: Custom invitation design, Interactive animations, Event schedule, Location and maps, Dress code, Countdown, RSVP, Guest response tracking). For 001–003 every capability that was listed before is still listed, in fewer and clearer lines, and nothing was added except what the brief allows: creator websites, personal portfolios, blogs and affiliate integrations now appear inside 003. |
| **04 How we work** | Headline *From first conversation to final delivery.*; the lead from the brief; Discover says *You get: A clear project brief and agreed direction.* The four stages, the tabs and the animation are untouched. |
| **05 The studio** | The headline *The idea you approve is the idea that ships.* and the founder story are kept. The two opening paragraphs are tightened and no longer lead with "business". *Specialists named at the start.* became *Anything extra is agreed at the start.* |
| **06 Contact** | Headline *Have something in mind?*; the two-paragraph body from the brief; the first tab now reads *Start Your Project*. |

### Choices I made that the brief did not spell out

- **The end of section 02** said "Your challenge. Our creative solution." and "Tell us what your business is trying to achieve." It repeated "creative solution" and spoke only to businesses, so it now reads *Your idea. Made with you.* with "A campaign, a launch, a website or a celebration. Tell us where you’d like to begin." and a *Start Your Project* button.
- **The Details panels of 001–003** start with a short headline in the same place as 004’s *An invitation worth opening.*: *A campaign worth noticing.*, *A launch worth waiting for.*, *A website worth remembering.* These three lines are mine; change them freely.
- **Where "Start Your Project" goes.** The contact section has no standalone button (the form sits directly under the headline), so the first tab of the form carries the name, and so does the button that ends section 02. The header, menu and footer buttons still say "Start a project" on every page, as before: the brief asked to keep the navigation, and the case-study and legal pages share those buttons. For one name everywhere, replace "Start a project" with "Start Your Project" in `index.html`, `privacy/`, `legal/`, `404.html` and `work/`.
- **Business-only wording removed elsewhere:** the catalogs’ closing line *Let’s create something for your business.* is now *Let’s create something together.*; the Discover stage says "your idea" instead of "the business"; and the "In practice" label above each catalog button is gone (it belonged to the headings the brief replaced).
- **Repetition.** In the text a visitor sees on the page, "creative solutions" appears once (the section heading), "digital experiences" twice (the hero line and the 003 name), "engagement" once (the Fig. 01 stage name) and "meaningful" nowhere. The deliverable *Conversion-focused content structure* in 003 now reads *A content structure that guides visitors to the next step*, which also closes the old open question about that line.
- **Apostrophes** are typographic (’) throughout, as everywhere else on the site; the brief’s copy has straight ones.
- **Kept from before:** the sentence under the 004 features about personalising invitations and agreeing where replies are stored (it was already there), and the line in 002 that sends launches with a guest list to 004.

## RSVP and the forms

- **RSVP.** No RSVP file, form, field, label, validation, response tracking or Apps Script call was touched. `js/contact/`, `js/config.js`, `js/solutions/projects.js`, `work/`, `assets/`, `privacy/`, `legal/`, `server/`, `vendor/` and `js/i18n/` are byte-identical to invite_final_8 (175 files compared one by one). The word "RSVP" appears in the new 004 copy only as marketing text (the feature list and the benefit line), as the brief asks. The two wedding invitations’ own repositories and sites were not touched or tested.
- **Wedding catalog.** Oto & Tako and Giorgi & Mariami, with their screens, descriptions, buttons and addresses, are unchanged, and they are the only two projects in the catalog.
- **Contact form.** The form, its four steps, its validation and `FormService.js` are unchanged. The only edit near it is the label of the first tab (*Start a project* → *Start Your Project*).
- **"Online sending is not connected yet."** The message is still in the page, hidden. It appears only when the form has no destination configured. `js/config.js` has an Apps Script address, so it stays hidden, and I kept the fallback. **I could not verify that submissions arrive:** this environment cannot reach your Apps Script, and I did not send test data to your sheet. The form was tested here against a mock of the endpoint (success, rejection, timeout, network failure). Please send one real test through the live site (`README.md` has the steps) and keep the message in the page until you have.

## Checked, and not checked

- **Checked (headless Chromium, on the files in this ZIP).**
  - **Copy.** A new script with 100 checks, all passing. It covers the hero words and the absence of full stops, the supporting line and the two buttons; every string of the 02 intro; the four tiles; the three labels, the eight 004 features and the note in the Details panels; How we work; The studio; the contact headline, both paragraphs and the tab; exactly four services and no fifth; the 004 catalog linking only the two weddings; no straight apostrophes in the visible text; the repetition counts; none of the retired wording left; and 175 files (RSVP, contact form and config, projects, case studies, assets, notices) byte-identical to invite_final_8.
  - **Hero.** Measured at twelve widths from 320 to 1920 px (no horizontal overflow, nothing clipped, every phrase on one line) and looked at in screenshots at each of them. At 150 % and 200 % text size, set both as the browser's default size and as a CSS root size, at 320, 390 and 768 px: nothing in the hero overflows, and the phone headline keeps its height (132 px at 390 px; before, it grew to 635 px at 200 %). The arrival after the intro was sampled every 100 ms at 320, 390 and 1440 px: no overflow at any moment, the headline never moves, layout shift 0.0004 or less in total; with reduced motion the headline is simply there.
  - **Details panels.** The "See Project Catalog" row of all four services at 1440, 390 and 320 px: no overflow, 48 px buttons, no leftover label. The panels were also read in screenshots at 1440 and 390 px.
  - **Earlier scripts rerun.** Contact form 70/70 (against a mock of the endpoint; the new tab label is in its expectations), reduced motion and no JavaScript 26/26, link crawl 9/9, tap targets 12/12, accessibility tree 30/30, focus rings 6/6, text size and zoom 24/24, opened from disk (`file://`) 30/30, How we work 45/45 (one expectation updated for the new Discover wording), services 68/68 (its two earlier misses were an out-of-date assertion, now fixed). The crawl, services, from-disk and tap-target runs were repeated after the last copy edit; the others ran on the build just before it, which only removed one word from the Launch panel.
- **Not checked:** the live contact form end to end (see above); real phones and the feel of the touch targets; Safari and Firefox; screen readers (the accessibility tree was checked, not what VoiceOver or NVDA say); the sound; the two live wedding invitations in a browser on their own domain.
- **Known, and as before.** In How we work the plain list can show for an instant if `#process` is opened directly on a cold load. The invite_final_8 notes also record that at 200 % text on a phone the header actions and Selected Work run past the right edge; I did not re-examine that beyond the hero, which is clear of it at every size tested. The drawers close on Escape only while keyboard focus is inside them.

## What to look at

- **The three headlines in 001–003** and **the end of section 02** (mine; see above).
- **"One person, from concept to code."** in The studio is kept from before. It is true only if you really do all of the work yourself; if collaborators are involved, change it.
- **The hero buttons** still say *Explore Our Work* and *Discuss a Project*.
- **Fig. 01** still names its three stages Attention, Engagement and Action, the states of the headline. If you would rather not repeat "Engagement" there, it is three words in `index.html` and `js/hero/`.

## Files changed

`index.html`, `css/home.css` (hero block and the contact intro), `css/solutions.css`, `css/catalog.css`, `js/solutions/solutions.js` (the service copy), `js/solutions/render.js` (the Details template), `js/solutions/catalog.js`, `js/offline.js` (rebuilt), `README.md`, `docs/DESIGN.md`, and these notes. `node tools/render-solutions.mjs` rewrites the tiles, panels and catalogs in `index.html` from `solutions.js`; run `python3 tools/build-offline.py` after any change in `js/`.

# Update: invite_final_7 → invite_final_8 (How we work)

One section changed: **04 How we work**. The four stacked descriptions are now one composition that you move through. The label, the headline ("From the first brief to a finished experience.") and the four stages with their "You get" lines are as they were, word for word. The brief allowed shortening the copy; it was already short, so I left it.

| | Before | Now |
|---|---|---|
| **Layout** | The same small text block four times (four columns, one column on a phone) | A rail with the four stage names, the stage number set large as type, and one panel for the stage you choose |
| **Interaction** | Each stage lit up as you scrolled past | You choose the stage: click, tap, arrow keys |
| **Height of the section** | 1200 px at 1440 wide · 1345 at 1024 · 1421 at 820 · 1232 at 390 | 814 px · 826 · 818 · 840 |

### The composition

- **Rail.** Four names hung from one hairline: 01 Discover, 02 Concept, 03 Design & Build, 04 Refine & Deliver. A 2 px line of light runs from the left edge to the right edge of the chosen stage. Stages behind it read in ink with a lavender number, the chosen one is bolder, the ones ahead stay grey. No boxes and no fills.
- **The number as type.** A still zero in ink and the stage's digit in the accent colour, in Bodoni Moda Italic, as tall as the panel. The digit rolls up or down a column when the stage changes. The part that changes carries the colour, as the line of light and the ampersand do. It is decoration: screen readers skip it, because the tab names already carry the numbers.
- **Panel.** The stage name in bold Archivo (the ampersand in the Bodoni italic, as in the other headings), one sentence at most 38 characters wide, and "You get" as a hairline row with a short line of light above it. "You get" sits at the same height in every stage. All four panels share one cell of the grid, so the section keeps one height whichever stage is open.
- **Asymmetry and space.** On a wide screen the headline moves to column 4, the one-line lead goes to the right edge, the number takes the left half and the text the right half. This is what takes the section from 1200 px to 814 px at 1440.
- **Tablet (860 px and down).** The same composition with a narrower number. **From 700 px down** the number sits above the panel. **Below 640 px** the rail keeps only 01–04 as four large touch targets (each at least 64 px tall); the stage name is the heading of the panel, and each button is still named in full ("02 Concept") for screen readers.

### Motion (GSAP; plays once; nothing loops)

- **Arrival.** When the section scrolls into view, once: the label, the headline (rising out of a mask) and the lead; the hairline is drawn across; the four names follow one by one; the number rises; the first stage's title, sentence and "You get" arrive. Under two seconds.
- **Hand-over.** When you choose another stage: the line of light runs to it and the number rolls (about a second), the old title leaves in the direction of travel, the new one rises into place, then the sentence and "You get" fade in; everything has settled after about a second and a half. Going back reverses the direction. Choosing again mid-way finishes the first hand-over and starts the next, so nothing stacks.
- **Hover (pointers only).** A thin ink line is drawn over a stage that is still ahead and its name turns to full ink. Choosing a stage plays the same soft bell as other selections when the sound is on, one note per stage.
- **Not used:** scroll hijacking, pinning, parallax, looping motion. The section scrolls like any other.

### Accessibility and fallbacks

- **Real tabs.** The names are `role="tab"` buttons in a tablist ("The four stages"); the stages are `role="tabpanel"`, each labelled by its tab. Left, Right, Up, Down move and select; Home and End jump; the ends wrap (the same helper as the contact form's steps, `js/core/dom.js`). Only the chosen tab is a tab stop, and Tab then goes to the open panel. The panels that are not open are `inert`. The focus ring is the site's.
- **Reduced motion.** The same tabs, switching at once: no entrance, no rolling number. If the setting is turned on during a hand-over, it finishes at once.
- **No JavaScript, or the script fails.** The markup is still the plain numbered list with every stage in full: four columns on a wide screen, two on a tablet, one on a phone. The hidden start state of the arrival is only set once the script is ready to play it.
- **Without GSAP** the tabs still work, with a CSS transition on the line and the number.
- **Text size.** Stage names wrap instead of clipping when the text is enlarged. Text at 200 % and browser zoom at 200 % were measured with nothing overflowing, clipped or overlapping in this section.

### Code

- `index.html`: the `#process` list is the same list, simplified (the old `data-phase` attributes are gone; the copy is unchanged). No other section of the page differs from invite_final_7: the diff is the comment above the section and the list inside it.
- `css/home.css`: the old "contents page" block is replaced by the composition block; none of the old rules are left.
- `js/method/StudioMethod.js`: rewritten. It builds the rail, the number and the tab wiring around the list. One custom property, `--i` (the chosen stage), drives both the line of light and the rolling number; GSAP tweens it, and CSS transitions do it when GSAP is missing.
- `js/offline.js` rebuilt, and these notes.
- **Built for four stages.** The line and the number are divided into quarters and the rail is twelve columns, three per stage. To change the number of stages, change the rail columns, the line's width and the number's step together (all under "How we work" in `css/home.css`); the script itself does not count.

### Checked, and not checked

- **Checked (headless Chromium, on the files in this ZIP).** 45 checks in a new script, all passing: the list becomes a tablist with four named tabs and each tab points at its panel; stage 1 is the only one shown and the others are `inert`; clicking through every stage (and back) leaves the line and the number exactly on the chosen stage; the panel keeps one height; arrows, Home, End, wrapping, Tab into the panel and the focus ring; the hover line; rapid clicking ends cleanly; no console errors; reduced motion switches at once; on a 390 px phone the four buttons are at least 44 px, nothing scrolls sideways and each button is still named; no overflow, clipping or wrapped names from 320 to 1920 px; text at 200 % and zoom at 200 %; no layout shift during the arrival and the stage changes; the `#process` link lands on the section. I also looked at screenshots of every stage at 1440, 820 and 390 px, and at frame-by-frame sheets of the arrival, of going forward and of going back.
- **Earlier scripts rerun on this build:** link crawl of every page and asset 9/9; reduced motion and no JavaScript 26/26 (its How we work assertions were rewritten for the new structure, and a no-JavaScript check that all four stages show in full was added); tap-target sizes 12/12; accessibility tree 30/30; focus rings 6/6; text size and zoom 24/24; opened from disk (`file://`) 30/30, and I clicked through the stages from disk as well; the services script 66/68, with the same two misses as in invite_final_7 (one old assertion, run at two widths, that expects the 004 catalog to hold the old project cards).
- **Not checked:** real phones and the feel of the touch targets; Safari and Firefox; screen readers (the accessibility tree and the ARIA wiring were checked, not what VoiceOver or NVDA say); the sound (the call is made, I did not listen to it).
- **Known:**
  - *One-time swap.* The plain list is replaced by the composition as soon as the script has loaded. On a normal visit this happens while the section is far below the screen. If you open `#process` directly, or scroll to it within the first moment of a cold load, the list can show for an instant before the composition appears.
  - *Text at 200 % on a phone.* The header actions, the hero strip and Selected Work already run past the right edge. This is the same in invite_final_7, outside this section, and I did not touch it; How we work stays inside the screen.

### What to look at

- **The phone selector** shows 01–04 only; the stage name is the heading of the panel. If you would rather see the four names on a phone, a 2 × 2 grid of names is a small change.
- **The sound.** If you do not want a note when a stage is chosen, delete the `audio.play('select', …)` line in `js/method/StudioMethod.js` and rebuild the offline bundle (`python3 tools/build-offline.py`).

# Update: invite_final_6 → invite_final_7 (the 004 catalog)

One section changed: the project catalog of **004 You’re invited**. It now features two real, finished wedding invitations, and nothing else.

| | |
|---|---|
| **01 Oto & Tako** | `https://digitalinvitee.github.io/oto-da-tako/` |
| **02 Giorgi & Mariami** | `https://digitalinvitee.github.io/giorgi-da-mariami/` |

- **Layout.** Each project is one large editorial spread instead of a card: a plate in the invitation’s own colour (deep green for Oto & Tako, espresso for Giorgi & Mariami) carrying three real screens in a staggered composition, and beside it the name (ampersand in the Bodoni italic), a short description, what it contains, the facts (format, language, year), a lavender **Open the live invitation ↗** button, the address in plain text, and a line on how to try it ("Made for phones. Tap the envelope to begin, and keep the sound on."). A small "Live" mark sits on each plate and a caption says the screens come from the live invitation. The spreads alternate sides on a wide screen and stack on a phone, where two screens are shown, larger. The catalog also has its own one-line intro and a closing line that fits an occasion ("Have an occasion in mind? Let’s design the invitation.").
- **Real screens only.** Twelve images (three screens per invitation, at 1× and 2×, about 370 KB in all, loaded only when the catalog is opened and scrolled to). No stock photo, mock-up or invented project. Each has a description for screen readers.
- **Links.** The button, and the plate for people with a pointer, open the exact address above in a new tab (`rel="noopener"`). Keyboard users reach the button; the plate link is pointer-only, like the card pictures.
- **Motion (GSAP, subtle).** When a spread scrolls into view the plate is drawn from the top down, the screens rise into it one after another, the name rises out of a mask and the words follow; it plays once. With a mouse the screens drift a little against the pointer and a lavender rule is drawn along the foot of the plate; keyboard focus on the button lifts the screens gently. Reduced motion: no reveal, no drift. Without JavaScript the catalog is simply visible.
- **Scalable.** The catalog is data-driven. A third invitation is one more entry in `js/solutions/projects.js` (copy Oto & Tako); the build checks every screen file, alt text, colour and address, and the spreads keep alternating. Filters appear by themselves at four projects in two groups. `README.md` has the steps.
- **Casa Gelso and JETOUR** are no longer listed under 004, because the brief was to feature only the two wedding invitations for now. They remain under 002 and 003 and in Selected Work, and one line in `projects.js` puts either back.
- **Unchanged.** Everything else on the page, including the other three catalogs, the contact form and its backend. The only differences in `index.html` are inside the 004 catalog.

Files changed: `js/solutions/projects.js`, `solutions.js`, `catalog.js`, `CreativeSolutions.js`, new `CatalogSpreads.js`, `css/catalog.css`, `tools/render-solutions.mjs`, `index.html` (004 catalog only), the offline bundle, the twelve images under `assets/img/work/oto-da-tako/` and `giorgi-da-mariami/`, and these notes.

### How the screens were obtained

The environment this was built in cannot open `digitalinvitee.github.io` (outbound access to that domain is blocked), and I did not work around the block. Both invitations are public repositories, so I rendered them from their own source files on a local server and captured the screens at phone size (390 × 844), tapping the envelope open and scrolling as a guest would. I also read the published pages’ text and structure to confirm the source matches. Two honest caveats: the Giorgi & Mariami page loads GSAP 3.13.0 from a CDN, which I could not fetch, so the bundled GSAP 3.12.5 stood in for it when capturing its animated scene; and the screens are therefore faithful renders, not screenshots taken on the live domain.

### Checked, and not checked

- **Checked (headless Chromium, on the files in this ZIP).** 49 checks in two new scripts, all passing: both addresses are exact on the button and the plate; a click on the plate, a click on the button and Enter on the button each open the right page in a new tab (the live pages were stubbed for this, so it proves the link, not the page); all six images load, with the 780 px files on a 2× screen; the reveal starts hidden and ends visible with the plate colour intact; hover drift moves every screen and settles; keyboard focus shows a ring, lifts the screens and draws the rule; Tab does not stop on the plate link; Escape closes the catalog before the panel; the deep link `#solution-youre-invited-catalog` opens it; reduced motion shows everything at once with no drift; a phone (390 px) has no horizontal overflow, shows two screens and 44 px-tall buttons; no console errors; exactly two projects, no filters, no Casa Gelso or JETOUR under 004; no placeholder or promise wording. The page without JavaScript was checked separately by screenshot. Screenshots were reviewed at 1440, 820 and 390 px.
- **Earlier scripts rerun on this build:** link crawl of every page and asset 9/9; reduced motion and no JavaScript 22/22; tap-target sizes 12/12; accessibility tree 30/30; opened from disk (`file://`) 30/30; the services script 66/68. Its two misses are one old assertion, run at two widths, that expected the 004 catalog to hold the old project cards; the catalog now holds spreads, which the new scripts cover, and the other checks of that script for 004 pass. The rest of the previous round’s 513 checks (intro, contact form, hero, Selected Work, text size and so on) were not repeated: `index.html` differs from invite_final_6 only inside the 004 catalog, and the contact and intro code is untouched.
- **Not checked:** the live domain in a real browser; real phones; Safari and Firefox; screen readers; the audio; the invitations’ own RSVP forms (I did not submit anything to them).
- **Known, and as before:** the drawers close on Escape only while keyboard focus is inside them. After a catalog is opened from a link (`#solution-youre-invited-catalog`), the first Escape does nothing until focus enters the catalog. This is shared drawer code that this update did not touch, and it applies to all four catalogs.

## Update: what to look at

- **Permission.** The screens show the couples’ names, the wedding dates and, on the schedule screens, venue names. Please confirm both couples agree to this, and tell me if you would rather use screens without venues.
- **Giorgi & Mariami’s countdown.** The invitation has a countdown to 03.10.2026, a date that has passed. I left it out of the portfolio copy and did not feature it in a screen. You may want to retire it on the invitation itself.
- **The descriptions** are written from what each invitation does (envelope, collage, schedule with map links, music, a reply form for guests; for Giorgi & Mariami also an animated illustration and the dress code). Please read them once.

# Refinement round: invite_final_5 → invite_final_6

A refinement, not a rebuild. The identity is the same (Porcelain `#F3F2EF`, ink `#0A0A0B`, lavender `#B8C4FF`; Archivo, Bodoni Moda Italic, JetBrains Mono), the stack is the same (plain HTML, CSS and ES modules, no build step), and the contact form still sends through your Google Apps Script with `FormService.js` and `config.js` untouched.

Positioning on the page: **INVITÉ — From Attention to Action.** Nothing on the site guarantees sales, conversions or any other outcome, and there are no invented clients, testimonials, awards, figures or team members.

## What changed

| Area | Before (invite_final_5) | Now | Why |
|---|---|---|---|
| **Section order** | Hero, Selected Work, Creative Solutions, Studio (with the method inside), Contact | 01 Hero · 02 Creative Solutions · 03 Selected Work · 04 How we work · 05 The studio · 06 Start a project | The visitor learns what INVITÉ does before seeing the proof, and the method gets a section of its own. Old anchors (`#work`, `#solutions`, `#studio`, `#contact`) still work; `#process` is new. |
| **Hero** | "Digital experiences for brands with something to reveal", with a five-stage launch orbit | "Designed to attract. Built to engage. Made for action." and one interactive figure with three stages (Attention, Engagement, Action) that point to the four services; two buttons; a strip of four service links | One idea, one interaction. The headline is the thing you read and the orbit is the thing you play. |
| **Services** | Three tiles | Four, written from one data file (`js/solutions/solutions.js`): 001 Get noticed, 002 Build anticipation, 003 Make an impression, 004 You’re invited | The four approved services. 004 is a real fourth service, not an add-on: its own tile, title motion (a folded card that opens along a lavender crease), Details panel, catalog, contact preselection and deep link. |
| **Project catalogs** | One catalog per service | Same mechanism, extended to 004. Filters appear only when a catalog has at least 4 projects in at least 2 groups. A service with no project shows an honest note, not a stand-in. (In invite_final_7 the 004 catalog is set as editorial spreads and lists two real wedding invitations: see the update above.) | No fake projects, no empty filters. |
| **Selected Work** | Two previews, placed before the services | One compact section, two projects. Casa Gelso: four real screens of the live site as tabs (one slow pass, then the visitor’s). JETOUR: the real intro film, muted, with a Pause button. | Real material only, in less space. |
| **How we work** | Inside the studio section | Own section: Discover → Concept → Design & Build → Refine & Deliver, each with a plain "You get" line | The four stages and their one-line descriptions follow the brief. The three "You get" lines for the first three stages were already on your site and are kept. The fourth used to promise "the launch, analytics and updates after launch"; the brief defines that stage as testing, improving, finalising and preparing for launch, so the line now says that. |
| **The studio** | "A small studio, on purpose" | "The idea you approve is the idea that ships", the founder facts and three plain commitments | Everything on it comes from statements already on your site (Tbilisi, founded 2026, four years managing corporate client accounts, one person from concept to code). |
| **Intro** | 5.7 s | Same concept (broken television, signal interference, INVITÉ rebuilt, a line of light, the homepage opens), about 2.8 s on a first visit and about 1.2 s for returning visitors. Skip, Escape and the sound switch are kept. The old one is still there: add `?intro=classic` to compare. | A first-time visitor sees the idea in under three seconds. |
| **Contact** | Same four-step brief | Same form and backend. One more project-type chip, "Private or Corporate Event". The originating service is preselected. Success is shown only when the server confirms. | 004 needs a place to land. |

### Accessibility and quality fixes made along the way

- Contrast of the small label in the case-study browser bar.
- Every width breakpoint is now written in `em`, so a reader who has raised the browser’s default text size gets the compact header sooner instead of clipped navigation.
- Small links (breadcrumbs, the contents of the notices, the live-site address on a case study) have a taller tap area than their text, with no change to how they look. A very long address no longer overflows a case-study page.
- Links in Selected Work have distinct names for screen readers; decorative arrows are no longer read out; one straight apostrophe is now a proper one.
- The skip link lands on `<main>` on every page. The sound and menu buttons are hidden when JavaScript is off, because they cannot work without it.
- A layout shift in the hero on desktop was removed (measured: about 0 at every width from 320 to 2200 px).
- Bodoni Moda italic is set at a fixed optical size so its hairlines survive at display sizes. At the automatic size "attract" read as "allract".
- The three studio commitments line up on desktop.

### Defects found by a final review and fixed

A separate read-only code review of every changed script, style and tool file found 4 defects that mattered and 9 smaller points. The 4 and 6 of the 9 are fixed (below); the other 3 were left on purpose (further down). Each fix has a test. For the launch story, the film restart, the rapid Details presses and the hero layout shift, the test was first run against the old code, failed, and passes now.

- **Back, Continue and Send could be lost on a phone** when a field’s error message appeared at the moment of the tap. The guard in `ContactForm.js` now holds until the click, which is the only change to contact code (a page-side behaviour; nothing is sent differently).
- **The launch story looped forever** with a live region announcing it. It now makes one pass while in view, holds still under a resting mouse, stops for good on a click, key press or focus, never advances with reduced motion, and is silent for screen readers while it runs by itself.
- **The JETOUR film did not restart** after the visitor scrolled away while it was still loading.
- **Escape as the very first action** left the page scroll-locked for about 0.7 s on a first visit (browsers refuse to let a page overrule Escape before the visitor has clicked anything). The page is released at once now.
- Replaying the intro described itself as "Intro finished."; it now keeps its own sentence.
- Rapid presses on a Details button could leave a panel half open.
- Service data written into the hero’s links is now escaped.
- `server/contact-worker.js` (not in use) rejects an oversized request before reading it.
- `tools/render-solutions.mjs` now also stops with a clear message if a service’s `contactCategory` is not one of the form’s project types.

- Small clean-ups in the intro script: clearer names for the timing constants (seconds and milliseconds are no longer mixed under one name) and one unused text string removed.

Left as they are, on purpose:

- `js/contact/FormService.js` treats any 2xx reply as "sent" on the Formspree and custom-endpoint paths even when the reply is not JSON. The file is frozen so that the contact backend stays exactly as it was, and with the Apps Script (success is read strictly from `{"success":true}`) this path is not used. If you ever switch the provider to `custom`, add a check for a JSON reply there first.
- `js/nav/Navigation.js` has a fallback for browsers without `<dialog>` that could not close the menu. Every current browser supports `<dialog>`, so it is dead code.
- A tidy-up of duplicated reset code in `js/intro/IntroExperience.js` (no behaviour change), left alone to avoid touching the intro again late in the round.

## What stayed the same

Palette, type, the broken-television concept, the sound design (off until the visitor turns it on), the two case-study pages (their content, layout and imagery), the legal and privacy pages (still drafts), `js/config.js`, `js/contact/FormService.js`, the Apps Script backend, the project-catalog mechanism, hash links and the retired-service aliases.

## What moves on its own

| What | How long | Stops when | Reduced motion |
|---|---|---|---|
| Intro | about 2.8 s (first visit) | Skip button or Escape, always available | One still frame |
| Hero figure | one pass, about 4 s, after the intro, once the figure is on screen | the first touch, hover or key | Rests with all three stages on |
| Casa Gelso screens | one pass, about 2.5 s, when scrolled into view | the first touch of a tab | Does not run |
| The connected launch | one pass, about 14 s, only while in view | a click, a key press or focus (a resting mouse only pauses it) | Does not run |
| JETOUR film | loops, muted, only while on screen (a 16-second clip of about 0.25 MB, fetched only when it is first played) | the Pause film button | Does not start by itself (nor with a data-saver setting) |

The film has a Pause button. The hero pass and the launch story stop on interaction but have no dedicated pause button, so strictly (WCAG 2.2.2) the 14-second launch story would need one. I left it out to keep that block clean. If you need formal conformance, add a button there. No audio plays without the visitor turning sound on.

## Decisions for you

1. **Casa Gelso and JETOUR appear under 002 and 003** (as of invite_final_7 no longer under 004, which shows the two wedding invitations), because each was a launch and a website. To change where they appear, edit `services` in `js/solutions/projects.js` and run `node tools/render-solutions.mjs`. "Get noticed" has no project listed yet, so its catalog shows an honest note.
2. **Button casing is mixed.** The brief’s labels are in title case ("Explore Our Work", "Discuss a Project", "See Project Catalog", "Discuss Your Project"); the rest of the site is sentence case. I followed the brief. One line each in `index.html` and `js/solutions/catalog.js` to change.
3. **The intro is shorter by default** (about 2.8 s). If you prefer the earlier one, `?intro=classic` plays it. To make it the first-visit default, change the last line of the small inline script near the top of `index.html` from `: seen ? 'short' : 'full'` to `: seen ? 'short' : 'classic'`.
4. **Bodoni Moda optical size is fixed at 20** (`css/base.css`). It was visibly broken at the automatic size. Change the number to 30–40 for finer hairlines.
5. **The Casa Gelso cover is cropped in CSS** to sit in the compact section. The image itself is untouched.
6. **The JETOUR hover scan-line effect was dropped** from the compact card; the real film replaces it.
7. **The footer sign-off still reads "INVITÉ creates anticipation."** It predates the new positioning line. Keep it or change it to match.
8. **On a phone the sound switch shows only its small equaliser** (no word), under 520 px, to keep the header clean.
9. **Process and studio copy is conservative** and built from statements already on your site. Please read both once and correct anything that is not true. The "You get" lines (a one-page brief you both sign off, a staging link to comment on) describe a workflow, so make sure they match how you really work.
10. **One existing deliverable line mentions conversion**: "Conversion-focused content structure", under 003 Make an impression. It is from your original service details and describes how a page is organised, not a promised result. Keep it or reword it.

## What I need from you

- **More invitation projects for 004, when you have them.** Each needs a working `https://` link, real screens captured from it, and the couple’s or client’s permission to show it. `README.md` has the exact steps; no live address and no real screen, no spread.
- **Confirmation that you may show the Casa Gelso and JETOUR imagery and the JETOUR film**, and the photo and illustration credits for Casa Gelso.
- **The legal and privacy pages are drafts.** Fill the highlighted items before launch and have them reviewed.
- **One real submission through the live contact form** (steps in `README.md`). It was tested against a mocked sheet endpoint here, never against your live Apps Script.

## Testing

Run in headless Chromium (the Playwright library, with software WebGL through SwiftShader) against the unpacked ZIP, served from a local HTTP server, plus one run with the pages opened straight from disk. **513 checks in 19 scripts; all pass.** The scripts are not part of the delivery. Phone sizes (320 to 430 px wide) were checked with viewport emulation, and taps with touch emulation; tablets and laptops at 768 to 1440 px; wide screens up to 2300 px.

| The brief's list | What was checked |
|---|---|
| 1–2 Intro plays, can be skipped, never traps the page | The full intro (2.8 s), the short one (1.2 s) and the classic one (5.6 s) each run to the end, hand over to the hero and release scrolling. Skip, Escape (also as the very first action, before any click) and Replay. With reduced motion: one still frame, released in about 1.6 s. Without WebGL: a static frame. Without GSAP: it still hands over. With scripts blocked: Skip works and the 6-second failsafe releases the page. With a 6× slower CPU the page is still released inside the failsafe window. No intro for a link to a section or with `?intro=off`. |
| 3 Sound | Off by default; no audio context exists until the first click; the switch turns sound on and off and remembers the choice. The sound itself was not listened to. |
| 4 Hero across viewport sizes | Headline, figure, panel and service strip from 320 to 2200 px; layout shift about 0 at 13 widths; hover, tap, arrow keys, Home, End, Enter and Escape on the figure; one pass, then it rests; with reduced motion it rests with all three stages on. |
| 5–6 Four services, unique title treatments | Order, numbers, names, categories and structured data; four different title motions (frame, build, press, open). |
| 7–8 Details panels, the fourth service | Each Details button opens its own panel, one at a time, with no overflow; Close and Escape return focus to the tile; the hero strip opens 004; the contact chip; deep links, including the retired `#solution-…` ids. |
| 9–10 Catalogs, empty catalogs | Each catalog opens and closes and returns focus. The empty "Get noticed" catalog shows an honest note and no cards. No filters on small catalogs. |
| 11 Project cards | Covers load, have a size and a description; case-study links are internal and the pages exist; live links are `https://` and open in a new tab with `rel="noopener"`. |
| 12–14 Casa Gelso, JETOUR, case studies | Selected Work shows exactly the two projects; the screen tabs (arrow keys, Home, End); the pass runs once and stops on touch; the film is muted, plays while on screen, pauses and resumes, does not restart after a Pause, and does not start by itself with reduced motion. Both case-study pages: one h1, a main landmark, a skip link, no overflow, images load, contrast, tap targets. |
| 15 Contact form | Four steps, validation per step, Back and Edit keep answers, the review, Send. One POST, as `text/plain` JSON, with the same field names as before. Success only after the confirmed reply. The error, timeout, network-failure and not-connected paths. Back and Continue taps on a touch screen. All against mocked responses. |
| 16 Keyboard | A full Tab walk (52 stops) with no trap, a visible focus ring on every stop (at least 4.9:1), a name on every stop, the skip link; the menu dialog; arrow keys on the tab groups; Escape closes the innermost layer first. |
| 17 Reduced motion | No endless animation, no scripted motion once the page settles, all text visible, 004 unfolded, the intro as a still frame. |
| 18 Mobile navigation | At 390, 360, 768 and 844×390: Menu opens as a modal, Tab stays inside it, Escape and Close return focus, each link lands below the header. |
| 19 No horizontal overflow | At every width from 320 to 1920 px, on every page at 1440 and 390 px, without JavaScript, and with the browser's default text size raised to 150 % and 200 %. |
| 20 Console errors, broken paths | No console errors in any scenario. A crawl: all 126 internal addresses (links, scripts, stylesheets, images, srcset candidates, posters, video sources, icons) answer 200 with a sensible content type; all 110 `#` links point at an existing id; all 74 module imports and asset paths exist; sitemap, robots and manifest are valid. |

Also checked: WCAG 2.2 target size on six pages at 1440 and 390 px; text and focus-ring contrast; accessible names; duplicate ids; heading order; the offline copy when opened from disk (30 checks); the Worker's body-size guard against mocked requests; the build check for service categories, which refuses a typo and leaves `index.html` untouched.

Indicative weight (software-rendered, so a guide only): about 620 KB in 46 requests once the page has loaded, against about 690 to 710 KB in 47 for invite_final_5. After scrolling the whole page: about 980 to 990 KB in 53 requests, against about 700 to 745 KB in 48. The difference is the JETOUR film (about 240 KB), which is fetched only when it scrolls into view; the pictures together weigh less than before and load as you scroll instead of at the start. Layout shift is about 0 on the phone and the desktop.

### Not verified

- Real phones and tablets; Safari; Firefox. The lost-tap fix was checked with emulated touch events only.
- Screen readers (NVDA, VoiceOver). Names, roles, states and live regions were checked in the accessibility tree, not by listening.
- How the sound sounds.
- The H.264 MP4 version of the JETOUR film (the WebM version was played; Safari needs the MP4).
- The intro failsafe in a hidden browser tab.
- A real submission to your Google Sheet. The form was tested against mocked responses.
- The live Casa Gelso and JETOUR sites inside a browser. Their addresses were fetched with a plain request only.
- Frame rates and load times on real hardware.

### Known limitations

- Not certified for any WCAG level. See "What moves on its own" for the one strict criterion (2.2.2) the launch story does not fully meet.
- Georgian is prepared but not translated (unchanged).
- `js/offline.js` has to be rebuilt (`python3 tools/build-offline.py`) after any change in `js/`, only if you open pages by double-clicking.

