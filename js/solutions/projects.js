/* ==========================================================================
   Project catalog — the one list of projects behind every "See Project Catalog".

   A project is written once, here. It names the services it belongs to, and it
   appears in the catalog of each of them (a project can belong to several).
   Nothing else needs editing: the cards, their order and the filters
   are all built from this list.

   Cards appear in the order of this list. To reorder, move the object.
   To remove a project from the site, delete the object (or take one service
   out of its `services`). A service with no project shows a short honest note
   and the contact button instead of cards.

   Add a project by copying the template at the bottom of this file.

   Fields
     id            short and stable, lower case; used for the card's anchor
     name          the project's name
     industry      Automotive, Fashion, Logistics, Wine, Insurance, Hospitality…
                   (a sector, not a service: it feeds the filter of the first three services)
     eventType     only for projects that are events, invitations or RSVP experiences: 'Weddings',
                   'Corporate' or 'Private Celebrations'. It feeds the filter of 004 You're Invited.
     services      ids from js/solutions/solutions.js:
                   'get-noticed' | 'build-anticipation' | 'make-an-impression' | 'youre-invited'
                   Assign a project only to a service its finished work demonstrates.
     status        'live'            a working experience exists online
                   'in-development'  being built
                   'concept'         an INVITÉ idea, not a commissioned project
     projectType   what kind of project it is, e.g. 'Client project', 'Concept'
     year          optional, e.g. '2026'
     description   one or two sentences, true to what was actually made
     deliverables  optional short list of what the project contains
     coverImage    a real image of the project, a path inside the site (no leading slash,
                   so it also works from a GitHub Pages sub-folder). No cover, no card.
     coverSrcset   optional srcset for that image
     coverSize     optional [width, height] of coverImage, so the page can reserve its space
     coverPosition optional CSS object-position for the card crop, e.g. '60% 30%'
     coverAlt      what the image shows, in one sentence
     language      optional, e.g. 'Georgian': the language the experience is written in
     screens       optional, for catalogs set as spreads (004 You're Invited): up to three real screens of the live
                   experience, in the order a visitor meets them. Each is
                   { image, srcset?, size?: [width, height], alt, label? }. Without screens, the cover is shown alone.
     previewTone   optional, a colour (#rrggbb) taken from the experience itself, set behind its screens
     hint          optional, one short line on how to try it, e.g. 'Made for phones. Tap the envelope to begin.'
     caseStudyUrl  internal route of the case study ('work/jetour/'); no route, no button
     liveUrl       a verified, working https address of the live experience; opens in a new tab.
                   Leave it out unless it really works: no URL, no "Explore Live Experience".
                   It is also ignored unless the status is 'live'.
   ========================================================================== */

export const projects = [
  {
    id: 'casa-gelso',
    name: 'Casa Gelso',
    industry: 'Fashion',
    eventType: 'Corporate',
    services: ['build-anticipation', 'make-an-impression'],
    status: 'live',
    projectType: 'Client project',
    year: '2026',
    description: 'A luxury fashion house opening in Tbilisi, introduced in three acts and three languages: an illustrated teaser, a brand reveal and a private invitation with RSVP.',
    deliverables: ['Teaser film', 'Brand reveal', 'Invitation and RSVP', 'English, Georgian, Italian'],
    coverImage: 'assets/img/work/casa-gelso/casa-cover-800.webp',
    coverSrcset: 'assets/img/work/casa-gelso/casa-cover-480.webp 480w, assets/img/work/casa-gelso/casa-cover-800.webp 800w, assets/img/work/casa-gelso/casa-cover-1179.webp 1179w',
    coverSize: [1179, 1475],
    coverPosition: '50% 22%',
    coverAlt: 'Watercolour fashion illustration from the Casa Gelso teaser: a woman in a long black gown printed with gold hearts, beside a vintage microphone.',
    caseStudyUrl: 'work/casa-gelso/',
    liveUrl: 'https://digitalinvitee.github.io/casa-gelso/'
  },
  {
    id: 'jetour',
    name: 'JETOUR',
    industry: 'Automotive',
    eventType: 'Corporate',
    services: ['build-anticipation', 'make-an-impression'],
    status: 'live',
    projectType: 'Client project',
    year: '2026',
    description: 'A private drive from Tbilisi to Orbeti, announced by a bilingual invitation that behaves like the car\'s own display: a timed intro film, a live countdown, the agenda and a two-path RSVP.',
    deliverables: ['Intro film', 'Live countdown', 'Agenda', 'RSVP', 'Georgian, English'],
    coverImage: 'assets/img/work/jetour/jetour-cover-800.webp',
    coverSrcset: 'assets/img/work/jetour/jetour-cover-800.webp 800w, assets/img/work/jetour/jetour-cover-1280.webp 1280w, assets/img/work/jetour/jetour-cover-1704.webp 1704w',
    coverSize: [1704, 923],
    coverPosition: '62% 40%',
    coverAlt: 'A driver leaning on a red Jetour under studio light, from the campaign imagery used in the invitation.',
    caseStudyUrl: 'work/jetour/',
    liveUrl: 'https://digitalinvitee.github.io/JETOUR/'
  },

  /* 004 You're Invited. Two finished wedding invitations, both live. Their screens are real: captured from the
     invitations themselves at phone size (390 × 844, shown at 1× and 2×). Nothing here is a mock-up.
     Both are written in Georgian. Add the next invitation below these two, in the same shape. */
  {
    id: 'oto-da-tako',
    name: 'Oto & Tako',
    eventType: 'Weddings',
    services: ['youre-invited'],
    status: 'live',
    projectType: 'Wedding invitation',
    language: 'Georgian',
    year: '2026',
    description: 'A wedding invitation in deep green and cream, written in Georgian. A tap opens the sealed envelope onto a lace card with the couple\'s names, a polaroid collage and the day\'s schedule, with music and a reply form for guests.',
    deliverables: ['Envelope opening', 'Photo collage', 'Schedule with map links', 'Music', 'RSVP form'],
    hint: 'Made for phones. Tap the envelope to begin, and keep the sound on.',
    previewTone: '#1d2918',
    screens: [
      {
        image: 'assets/img/work/oto-da-tako/oto-m-opening-780.webp',
        srcset: 'assets/img/work/oto-da-tako/oto-m-opening-390.webp 390w, assets/img/work/oto-da-tako/oto-m-opening-780.webp 780w',
        size: [390, 844],
        label: 'Sealed envelope',
        alt: 'The first screen of the Oto & Tako invitation: a closed green envelope wrapped in a lace band and sealed with wax, with two butterflies, on dark green.'
      },
      {
        image: 'assets/img/work/oto-da-tako/oto-m-invitation-780.webp',
        srcset: 'assets/img/work/oto-da-tako/oto-m-invitation-390.webp 390w, assets/img/work/oto-da-tako/oto-m-invitation-780.webp 780w',
        size: [390, 844],
        label: 'Invitation',
        alt: 'The opened invitation: a Save the Date card in a green envelope with white lilies, a lace frame holding the couple\'s names, a gramophone and a tag for the wedding schedule.'
      },
      {
        image: 'assets/img/work/oto-da-tako/oto-m-program-780.webp',
        srcset: 'assets/img/work/oto-da-tako/oto-m-program-390.webp 390w, assets/img/work/oto-da-tako/oto-m-program-780.webp 780w',
        size: [390, 844],
        label: 'Schedule',
        alt: 'The wedding schedule, opened as a torn-edge paper card hanging from a clip, listing four timed events.'
      }
    ],
    coverImage: 'assets/img/work/oto-da-tako/oto-m-invitation-780.webp',
    coverSrcset: 'assets/img/work/oto-da-tako/oto-m-invitation-390.webp 390w, assets/img/work/oto-da-tako/oto-m-invitation-780.webp 780w',
    coverSize: [780, 1688],
    coverPosition: '50% 8%',
    coverAlt: 'The opened Oto & Tako invitation: a Save the Date card in a green envelope with white lilies, a lace frame holding the couple\'s names, a gramophone and a tag for the wedding schedule.',
    liveUrl: 'https://digitalinvitee.github.io/oto-da-tako/'
  },
  {
    id: 'giorgi-da-mariami',
    name: 'Giorgi & Mariami',
    eventType: 'Weddings',
    services: ['youre-invited'],
    status: 'live',
    projectType: 'Wedding invitation',
    language: 'Georgian',
    year: '2026',
    description: 'A wedding invitation in parchment and espresso, written in Georgian. A tap opens the sealed envelope; scrolling leads through the schedule with map links, an animated illustration, the dress code and a reply form, with music alongside.',
    deliverables: ['Envelope opening', 'Animated illustration', 'Schedule with map links', 'Dress code', 'Music', 'RSVP form'],
    hint: 'Made for phones. Tap the envelope to begin, and keep the sound on.',
    previewTone: '#3b2620',
    screens: [
      {
        image: 'assets/img/work/giorgi-da-mariami/gm-m-sealed-780.webp',
        srcset: 'assets/img/work/giorgi-da-mariami/gm-m-sealed-390.webp 390w, assets/img/work/giorgi-da-mariami/gm-m-sealed-780.webp 780w',
        size: [390, 844],
        label: 'Sealed envelope',
        alt: 'The first screen of the Giorgi & Mariami invitation: a closed brown envelope with an olive wax seal bearing the couple\'s monogram, on parchment.'
      },
      {
        image: 'assets/img/work/giorgi-da-mariami/gm-m-opened-780.webp',
        srcset: 'assets/img/work/giorgi-da-mariami/gm-m-opened-390.webp 390w, assets/img/work/giorgi-da-mariami/gm-m-opened-780.webp 780w',
        size: [390, 844],
        label: 'Opened',
        alt: 'The envelope opened, with the invitation card showing the couple\'s names and the date, and a ring tucked in at the bottom of the card.'
      },
      {
        image: 'assets/img/work/giorgi-da-mariami/gm-m-scene-780.webp',
        srcset: 'assets/img/work/giorgi-da-mariami/gm-m-scene-390.webp 390w, assets/img/work/giorgi-da-mariami/gm-m-scene-780.webp 780w',
        size: [390, 844],
        label: 'Animated scene',
        alt: 'Further down the invitation: an illustrated wedding couple in a dining room with a cupid above, between the schedule and the dress code.'
      }
    ],
    coverImage: 'assets/img/work/giorgi-da-mariami/gm-m-opened-780.webp',
    coverSrcset: 'assets/img/work/giorgi-da-mariami/gm-m-opened-390.webp 390w, assets/img/work/giorgi-da-mariami/gm-m-opened-780.webp 780w',
    coverSize: [780, 1688],
    coverPosition: '50% 30%',
    coverAlt: 'The Giorgi & Mariami envelope opened, with the invitation card showing the couple\'s names and the date, and a ring tucked in at the bottom of the card.',
    liveUrl: 'https://digitalinvitee.github.io/giorgi-da-mariami/'
  }

  /* ── Template: copy, fill in, and paste above (keep a comma after the previous project) ──
  ,{
    id: 'your-project',
    name: 'Project name',
    industry: 'Automotive',
    // eventType: 'Corporate',           // only for event or invitation projects (feeds the filter of 004)
    services: ['get-noticed'],
    status: 'in-development',            // 'live' | 'in-development' | 'concept'
    projectType: 'Concept',              // e.g. 'Client project', 'Concept'
    year: '2026',
    description: 'One or two sentences about what was actually made.',
    deliverables: ['Animated HTML5 banners', 'Social creatives'],
    coverImage: 'assets/img/work/your-project/cover-800.webp',
    coverAlt: 'What the cover image shows.',
    caseStudyUrl: 'work/your-project/'    // only once that page exists
    // liveUrl: 'https://…'              // only once the live experience really works
  }
  ── Next wedding or event invitation (004 You're Invited): copy Oto & Tako above, change the id, name, text,
     screens (up to three real screens of the live invitation, 390 × 844 at 1× and 2×) and liveUrl. Use a real
     screen, never a stock photo or a mock-up.
  ── Not published yet (each needs real material first; do not mark any of them as client work):
     · Ideas still to be made: Automotive Campaign · Logistics Advertising Campaign · Wine Product Campaign ·
       Insurance Campaign · Corporate Event Invitation (status 'concept', and only with a real cover image)
  */
];

export const STATUS_LABEL = { live: 'Live', 'in-development': 'In development', concept: 'Concept' };

/* A project is shown only if it has what a card needs: a name, a cover image with a description,
   and a known status. Anything else is quietly left out rather than shown half-finished. */
export const isShowable = (p) => !!(p && p.name && p.coverImage && p.coverAlt && STATUS_LABEL[p.status]);

/* The projects of one service, in list order. */
export const projectsFor = (serviceId) => projects.filter((p) => isShowable(p) && Array.isArray(p.services) && p.services.includes(serviceId));
