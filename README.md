# INVITÉ Studio website

The INVITÉ Studio site: a homepage with the signal intro and six sections (01 hero, 02 Creative Solutions with its four services and their project catalogs, 03 Selected Work, 04 How we work, 05 The studio, 06 Start a project), two case studies (Casa Gelso, Jetour), privacy and legal notices, and a 404 page.

There is no build step. It is plain HTML, CSS and JavaScript (native ES modules). GSAP is kept in `vendor/`, and the fonts are self-hosted, so the site makes no requests to outside CDNs or font services.

## Run it locally

**Quickest:** double-click `index.html`. Browsers block ES modules and web fonts on pages opened straight from a folder, so in that case each page loads an offline copy instead: `js/offline.js` (all scripts in one file) and `css/fonts-offline.css` (fonts embedded). Everything works, including the intro.

**Closest to the live site:** serve the folder, which uses the real modules:

```
npx http-server -p 8000 -c-1
```

Run it in the project folder, then open http://localhost:8000. With Python installed, `python3 -m http.server 8000` works too, as does VS Code Live Server.

**If you change anything in `js/`** (including `config.js`) or the fonts, refresh the offline copy so double-clicking shows your change: `python3 tools/build-offline.py`. The live site never loads the offline copy, so this only affects opening files from disk.

Handy URL switches for testing:

| Switch | Effect |
|---|---|
| `?intro=full` | Play the full intro (about 2.8 s). This is what a first visit gets |
| `?intro=short` | Play the short intro (about 1.2 s). This is what returning visitors get, and a reload |
| `?intro=classic` | Play the earlier 5.7 s intro, kept so the two can be compared side by side |
| `?intro=off` | Skip the intro |
| `?quality=low` / `medium` / `high` | Force a graphics preset (`low` uses the static fallbacks) |

The intro never plays on a link to a section (`/#contact`), on the way back from another page of this site, or in a browser's back/forward. It always has **Skip intro** (Escape does the same) and a sound switch (sound stays off until the visitor turns it on). With reduced motion it shows one still frame, and a failsafe in `index.html` and in `js/intro/IntroExperience.js` releases the page if anything goes wrong, so the intro can never keep the site hidden.

## Structure

```
index.html              homepage
work/casa-gelso/        case study
work/jetour/            case study
privacy/  legal/        notices (DRAFTS, see below)
404.html                "No signal" page; self-contained, assumes the site is at the domain root
css/                    tokens.css (design tokens) → base → components → page styles
js/main.js              entry point; each module starts independently
js/offline.js           GENERATED single-file copy for opening pages from disk (see above)
css/fonts-offline.css   GENERATED embedded fonts for the same case
tools/build-offline.py  regenerates those two files
js/config.js            THE file to edit before going live (email, WhatsApp, form, sound, socials)
js/core/                quality presets, GPU scheduler, motion, storage, signal reveal
js/intro/               the broken-TV intro (raw WebGL CRT)
js/hero/                the hero: headline reveal and Fig. 01, the connected experience (SVG)
js/solutions/           Creative Solutions: solutions.js (the four services), projects.js (the project catalog data), render.js, catalog.js, CreativeSolutions.js, CatalogSpreads.js, ConnectedLaunch.js
js/work/                Selected Work: ProjectShowcase.js (the Casa Gelso screen chips and the JETOUR film controller)
js/method/              StudioMethod.js (How we work: the four stages as tabs, one panel, the rolling stage number)
js/nav/                 header states, section tracking, the mobile menu (a native <dialog>)
css/solutions.css       the four service tiles and their Details panels
css/catalog.css         the "See Project Catalog" row, the catalog drawer, the project cards and the 004 spreads (nothing else uses these styles)
tools/render-solutions.mjs  writes the Creative Solutions tiles, details and project catalogs into index.html from solutions.js and projects.js
js/contact/             form logic (the four-step project brief, Just say hello) and delivery (FormService)
js/audio/               sound: AudioController (toggle, intro TV), Soundscape (music + interface sounds), SoundDesign (wiring)
js/i18n/en.js           UI strings used by scripts (a Georgian file can sit next to it)
server/                 optional Cloudflare Worker for the contact form
assets/                 fonts (+ licences), images, video, icons, share images
docs/                   AUDIT.md (what was found in the first site), ARCHITECTURE.md, DESIGN.md, REFINEMENT.md (what changed in this round, and what to decide)
```

The header, menu and footer markup is repeated in every page (there is no templating). If you change navigation, update `index.html`, both `work/*/index.html`, `privacy/`, `legal/` and `404.html`.

## Creative Solutions: four services and their project catalogs

**From attention to action.** The section presents four services, written from one data file, `js/solutions/solutions.js`:

| № | Service | The contact form preselects |
|---|---|---|
| 001 | Get noticed: Digital Advertising & Motion Campaigns | Digital Advertising |
| 002 | Build anticipation: Launch & Interactive Experiences | Launch & Interactive Experience |
| 003 | Make an impression: Creative Websites & Digital Experiences | Creative Website |
| 004 | You’re invited: Digital Invitations & Event Experiences | Private or Corporate Event |

Each tile shows its number, title, category and a short `summary`. "Details" opens a headline (`headline`) and three blocks that answer one question each: **What it is** (`about`), **Why it works** (`why`) and **What we can include** (`include`, with an optional `includeNote` under the list), with "Discuss a project like this" (it opens the contact form with that service already chosen). The list is always "can include": possible features, not a promise that every project has all of them. At the foot of every Details panel, **See Project Catalog →** opens that service's catalog in place, under the details. Escape closes the catalog first and the panel on the next press.

To change any text of the services, edit `js/solutions/solutions.js` and run `node tools/render-solutions.mjs`. The ids (`get-noticed`, `build-anticipation`, `make-an-impression`, `youre-invited`) are stable: links, the catalog data, the hero's stage diagram and the connected-launch button use them. The section header, "The connected launch" and the closing lines are plain HTML in `index.html`; the five launch stages' texts are in `js/i18n/en.js` (`journey`). A link to `#solution-<id>` opens that service's details, and `#solution-<id>-catalog` opens its catalog too. Old links to the two retired services still land somewhere sensible: `#solution-make-it-interactive` opens "Build anticipation" and `#solution-bring-people-together` opens "You’re invited" (the table `LEGACY_IDS` in `js/solutions/CreativeSolutions.js`).

Each tile plays its own small effect (its title is the artwork) when it is hovered, focused, opened, or, on a touch screen, when it is the tile in the middle of the screen. With reduced motion the tiles still change on hover, focus and open, but instantly and without animation, and the "tile in the middle of the screen" effect on touch screens is switched off.

### The project catalog: adding, editing, reordering and removing a project card

Every card comes from one list, `projects` in `js/solutions/projects.js`. A project is written once and names the services it belongs to (`services: ['build-anticipation', 'make-an-impression']`); it then appears in each of those catalogs without being copied. The file begins with a description of every field and ends with a commented template.

To add a project:

1. Put a real cover image in `assets/img/work/<project>/` (`.webp` or `.jpg`; smaller versions are optional, for `coverSrcset`). **No image, no card.** Never use a stand-in picture for a project.
2. In `js/solutions/projects.js`, copy the template at the bottom, fill it in and paste it into the list. Give it a `status` that is true: `'live'` (a working experience exists online), `'in-development'`, or `'concept'` (an INVITÉ idea, not client work; say so in `projectType`). Add `caseStudyUrl` only when that page exists in this site, and `liveUrl` only for a working `https://` address (it is used only for a `'live'` project).
3. Run `node tools/render-solutions.mjs` in the project folder. It checks the list (image files that do not exist, a case-study page that does not exist, an unknown service id, a duplicate id, a live address that is not `https://`) and **stops without touching `index.html`** if anything is wrong, saying what to fix. Otherwise it rewrites the tiles, details and catalogs in `index.html`.
4. If you open pages straight from the folder (double-click) after changing anything in `js/`, also run `python3 tools/build-offline.py`. Editing only `projects.js` and running step 3 needs no offline step, because the catalog markup is written into `index.html`.

To reorder cards, move the object in the list. To remove one, delete the object, or take one service out of its `services`. To show an existing project under another service, add that service's id to its `services` and run step 3. For example, if you decide the advertising pieces inside Casa Gelso demonstrate "Get noticed", add `'get-noticed'` to its `services`.

A service with no project shows a short, honest note and the "Discuss Your Project" button instead of cards. "Get noticed" is in that state today: neither finished project is listed as an advertising campaign, so nothing appears there until one exists. Cards show only what the data says: a "View Case Study" button only with a valid internal `caseStudyUrl`, and "Explore Live Experience ↗" (new tab) only for a live project with an `https://` `liveUrl`.

**Filters** appear on their own once a catalog has at least 4 projects in at least 2 groups (`FILTER_MIN_PROJECTS` and `FILTER_MIN_GROUPS` at the top of `js/solutions/catalog.js`). Services 001–003 group their projects by `industry`; 004 You're Invited groups them by `eventType` (Weddings, Corporate, Private Celebrations), set with `filterBy: 'eventType'` in `solutions.js`. There is one button per group that has a project, so a filter can never lead to an empty list. Below that size no filter is drawn.

**The 004 catalog: invitations shown as spreads.** 004 You’re Invited lists two finished wedding invitations, both live: Oto & Tako (`https://digitalinvitee.github.io/oto-da-tako/`) and Giorgi & Mariami (`https://digitalinvitee.github.io/giorgi-da-mariami/`). Because an invitation is best seen as a guest sees it, on a phone, this catalog is set as `catalogLayout: 'spread'` in `solutions.js`: one large spread per project instead of a card. Each spread is a plate in the invitation’s own colour carrying up to three real screens, with the name, a short description, what it contains, the facts (format, language, year), a lavender "Open the live invitation ↗" button (new tab), the address in plain text and a line on how to try it. The spreads alternate sides on a wide screen and stack on a narrow one, where two screens are shown instead of three. `catalogIntro` and `catalogEnd` in `solutions.js` hold the line under the catalog title and the closing call to action.

The screens are real: each was captured from the live invitation at phone size (390 × 844, saved at 1× and 2×) and sits in `assets/img/work/<project>/`. Nothing is a mock-up or a stock picture. To add the next invitation:

1. Capture up to three real screens of it, in the order a visitor meets them (for example the sealed envelope, the opened invitation, a later screen), at 390 × 844 and 780 × 1688, as `.webp`, into `assets/img/work/<project>/`.
2. Copy the Oto & Tako entry in `projects.js` and change its `id`, `name`, `description`, `deliverables`, `screens` (each with `image`, `srcset`, `size`, `label` and an `alt` that says what the screen shows), `previewTone` (a colour taken from the invitation itself, for the plate), `language`, `year` and `liveUrl`. Keep `services: ['youre-invited']`, `eventType: 'Weddings'` (or `'Private Celebrations'`, `'Corporate'`) and `status: 'live'`.
3. Run `node tools/render-solutions.mjs`. It checks every screen file, the `alt`, the colour and the `https://` address, and stops with a message if something is wrong. The new spread appears after the last one; the order is the order of the list.

Filters stay out of the way: they appear by themselves once the catalog has at least 4 projects in at least 2 of Weddings, Corporate and Private Celebrations. A project with no `screens` falls back to its cover image. No live address, no button; and no real screen, no spread.

Casa Gelso and JETOUR are shown under 002 and 003, where their launch and website work belongs. They are no longer listed under 004, which now shows only the two wedding invitations. To show one of them under 004 again, add `'youre-invited'` to its `services` in `projects.js` (it will appear as a spread with its cover image alone) and run the render script.

Ideas that are not projects yet (an automotive campaign, a logistics advertising campaign, a wine product campaign, an insurance campaign) are listed as a comment at the bottom of `projects.js`. Add one only when it has a real cover image, and then with `status: 'concept'`.

The catalog data (`projects.js`) and its markup builder (`catalog.js`) are used only by the build step, so visitors never download them. The page script only opens and closes the catalogs that are already in the HTML, and `CatalogSpreads.js` moves the 004 spreads (a reveal when each scrolls into view, a small pointer drift on the screens for a mouse). With reduced motion, or without JavaScript, every service's details and catalog are simply visible and still.

### Optional: a demonstration link inside a service's Details

Each service in `solutions.js` also has `projectStatus`, `projectUrl`, `previewImage` and `previewAlt`, all empty, so nothing is shown. They were the original way to link one demonstration from a service. With the catalog in place you normally leave them empty. If you set `projectStatus: 'live'` and `projectUrl: 'https://…'` (and run `node tools/render-solutions.mjs`), the Details also show that preview and an "Explore Experience ↗" link.

## How we work: the four stages

The stages are a plain numbered list in `index.html` (`#process`, `data-method`): a number, a title, one sentence and a "You get" line each. Change the words there. The rail of names, the large stage number and the panel are built from that list by `js/method/StudioMethod.js` and styled under "How we work" in `css/home.css`, so nothing else needs to change; without JavaScript the list is simply shown in full. The composition is designed for exactly four stages (the line of light and the number are divided into quarters), so read `docs/REFINEMENT.md` before adding or removing one. After changing anything in `js/`, run `python3 tools/build-offline.py` if you open pages from the folder.

## Before going live: required

1. **Test the contact form once, end to end** (see "Contact form: Google Apps Script" below). `studio.email` and `studio.whatsapp` in `js/config.js` are shown in the contact section and footer, and offered if a message cannot be sent; the WhatsApp fallback carries the visitor's message already written. Leave either empty to hide it.
2. **Legal pages.** `privacy/index.html` and `legal/index.html` are drafts. Fill in every highlighted `<mark class="todo">` item (business name and form, address, ID number, privacy email, form provider, retention period). Then delete the `<meta name="robots" content="noindex">` line in each and add both URLs to `sitemap.xml`. Have someone qualified review them; they are not legal advice.
3. **Facts to confirm.** Jetour is labelled "Client project" with JETOUR Georgia as the client. Confirm you may show both clients' imagery and film. Confirm the illustration and photo credits for Casa Gelso. The two wedding invitations in 004 show the couples’ names, the wedding dates and the venues that appear on their screens, so confirm both couples agree to their invitation being shown in your portfolio, and whether you would rather hide any screen that carries a venue.

## Contact form: Google Apps Script

The form sends both "Start a project" and "Just say hello" to your Google Apps Script web app (`forms.appsScriptUrl` in `js/config.js`). The script saves each enquiry as a row in the **Inquiries** tab (Full Name, Email Address, Company or Brand, Project Type, Project Description, Estimated Budget, Project Timeline, Additional Notes, Submission Date & Time) and emails you. A "Just say hello" message is saved as Project Type **General Inquiry** with the message as its description.

The project-type choices on the form are: Digital Advertising, Launch & Interactive Experience, Creative Website, Private or Corporate Event, Something Else and Not Sure Yet. "Discuss a project like this" and the catalog's "Discuss Your Project" buttons preselect the matching one, and that text is what lands in **Project Type**. Rows saved before the service update keep their earlier values (for example "Interactive Experience"). The Apps Script does not check the value, so nothing has to change there; the optional `server/contact-worker.js` accepts both the new and the earlier choices.

The form code (`js/contact/FormService.js` and `js/config.js`) is exactly as it was before this round, so the Apps Script keeps working without a change. The only edit in `js/contact/ContactForm.js` is on the page side: pressing Continue, Back or Send used to make the field you were in show its error message first, which moved the button out from under the pointer, so the press was lost. A small guard in `setupForm` now lets that press do its own check.

**How the page talks to Google.** The page sends the fields as JSON in a plain-text request. That kind of request goes straight through; a request marked as JSON would make the browser ask Google for permission first (a CORS "preflight"), which Apps Script cannot answer, so it would be blocked before reaching the script. That was why sending failed. Google answers with a redirect to `script.googleusercontent.com`, which returns `{"success":true,"emailSent":true}` or `{"success":false,"error":"…"}` with headers that let the page read it. The page shows success **only** when it reads `"success": true`. A timeout, a network problem, a Google sign-in page or `"success": false` is shown as an error, with the visitor's answers kept. No server of your own is needed, so the Cloudflare Worker is not used.

**Deployment settings that must be right** (Apps Script → Deploy → Manage deployments → the web app):

- Execute as: **Me**
- Who has access: **Anyone** (not "Anyone with a Google account"; otherwise Google shows a sign-in page instead of answering, and the form reports an error)
- After changing the script, edit the existing deployment and choose **Version: New version**, so the `/exec` URL stays the same. A brand-new deployment gets a new URL, which you would then have to put in `js/config.js`.

**Test it once, with a real submission:**

1. Open the `/exec` URL in a private browser window. You should see a short message from the script (or "Script function not found: doGet"). If you see a Google sign-in page, fix "Who has access" first.
2. Serve the site (`npx http-server -p 8000 -c-1`, then http://localhost:8000) or use the live site. Open the browser's developer tools on the Network tab.
3. Send one "Just say hello" with your own email and the message "TEST, please delete". You should see "Received. Thank you…". In the Network tab, the request to `script.google.com` should be a POST, followed by a GET to `script.googleusercontent.com` whose response is `{"success":true,…}`.
4. Check the **Inquiries** sheet for the new row (Project Type: General Inquiry) and your inbox for the notification.
5. Send one short "Start a project" test the same way and check that every column is in the right place.
6. Delete the test rows.

If step 3 shows an error, the message under the form says what happened. "It was not accepted (…)" means the script answered with `success: false` and its reason. "We could not reach the studio inbox" usually means the deployment is not public, or the URL in `js/config.js` is wrong.

**If your script does not read the fields** (the test fails with a reason such as "Name is required" although you filled it in), replace its code with `server/google-apps-script/Code.gs`. That file is a complete version, checked here against simulated Google services (it has not been run inside your Apps Script project): it reads the website's request and normal form posts, validates, writes the nine columns in order (and stops formula injection in cells), and emails the address you put in **Project Settings → Script Properties → `NOTIFY_EMAIL`**. Paste it into the same project, save, and redeploy as a new version of the existing deployment (see above).

**Other providers.** `forms.provider` can also be `'formspree'` (`formspreeId`), `'web3forms'` (`web3formsKey`) or `'custom'` (your own endpoint, such as `server/contact-worker.js`, a Cloudflare Worker that sends mail through Resend; see the comments in that file). Name whichever provider you use in the privacy notice.

## Deploy

**GitHub Pages:** put the contents of this folder at the root of a repository. Go to Settings → Pages → Deploy from a branch → `main` / root. For the custom domain, enter `invitee.ge` under Settings → Pages → Custom domain; GitHub then creates a `CNAME` file. If you deploy into the repository that currently serves invitee.ge, keep its existing DNS and CNAME setup.

**Any other static host** (Netlify, Cloudflare Pages, Vercel) works as-is: no build command, publish directory `/`. Point their "not found" page at `404.html`.

If the site will **not** live at the domain root (for example `user.github.io/repo/`), update the absolute links and font paths in `404.html`. The canonical URLs, Open Graph URLs, `sitemap.xml` and `robots.txt` use `https://invitee.ge`; search for `invitee.ge` if the domain changes.

## Privacy by design

There are no cookies, no analytics and no third-party requests (apart from the form provider when someone sends a message, and Turnstile if you enable it). Two small settings are kept in the visitor's browser: `invite.intro.seen` and `invite.sound`. They are described in the privacy notice.

## Known limitations

- Georgian is prepared but not translated. UI strings live in `js/i18n/en.js` and page copy is in the HTML. Archivo has no Georgian glyphs, so a Georgian version needs a Georgian-capable typeface (for example Noto Sans Georgian or FiraGO).
- Testing was automated in headless Chromium with software WebGL (SwiftShader). Check on real devices before launch, especially iOS Safari and a low-end Android phone.
