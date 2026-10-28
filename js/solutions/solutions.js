/* ==========================================================================
   Creative Solutions — the content of the homepage section, in one place.

   Each entry is one of INVITÉ's four services. The homepage HTML is generated
   from this file (node tools/render-solutions.mjs), and the page script re-reads
   it, so a link added here appears on the site even before the HTML is regenerated.

   Projects are not listed here. Each service's "See Project Catalog" is filled
   from js/solutions/projects.js, where a project names the services it belongs to.
   The ids below ('get-noticed', 'build-anticipation', 'make-an-impression',
   'youre-invited') are what projects.js refers to, so keep them stable once shared.

   Optional, one extra link per service: when a single demonstration should be
   featured in the details as well, change only these two fields

       projectStatus: 'live',
       projectUrl: 'https://your-demo-url.example/',

   and, optionally, a preview image (a file in assets/img/solutions/):

       previewImage: 'assets/img/solutions/get-noticed.webp',
       previewAlt: 'What the image shows, in one sentence',

   An "Explore Experience" link then opens that demo in a new tab. While
   projectStatus is not 'live' or projectUrl is empty, no link is shown. (Most
   projects belong in the catalog instead, where they get a card and a case study.)

   Fields
     id              anchor and data id (#solution-<id>); keep it stable once shared
     number          shown as 001 to 004
     title           the headline, as words; the last word is set large
     category        the plain name of the service
     summary         one-line value proposition shown on the tile
     headline        one short line that opens the details (set in Bodoni italic)
     about           "What it is": what INVITÉ makes (paragraphs)
     why             "Why it works": why it is valuable to the person or brand (paragraphs)
     include         "What we can include": possible features and deliverables (a list; never a promise that every project has all)
     includeNote     optional, one short note under that list
     contactCategory the contact form choice preselected by "Start a project like this"
                     (it must match a project-type choice in the contact form in index.html)
     projectStatus   'in-development' | 'live'
     projectUrl      URL of one independent demonstration project ('' for now)
     projectLabel    link text (default "Explore Experience")
     previewImage    path or URL of a preview image ('' for now)
     previewAlt      description of the preview image
     artwork         how the title is typeset: width axis of Archivo (75–125),
                     fit = size of the large word in % of the tile's title width
                     (the page re-measures it, so an edited title still fits),
                     align of the small line, and its interaction
                     (frame | build | press | open; 'respond' and 'gather' are spare).
                     Optional: setup: 'serif' sets the small line in Bodoni Moda Italic.
     filterBy        what the catalog's filter buttons sort by: 'industry' (default) or
                     'eventType'. The filters only appear in a catalog large enough to need them.
     catalogLayout   how the catalog shows its projects: 'rows' (default: a compact ruled list, so a project that
                     belongs to several services is not shown in full under each of them), 'cards' (a grid of large
                     cards, for a service whose projects are not shown elsewhere) or 'spread' (one large editorial
                     spread per project, with its real screens; used by 004 for invitations that are best seen on a
                     phone). Any number of projects works.
     catalogIntro    optional, one short sentence under the catalog title
     catalogEnd      optional { title, text }: the closing call to action of the catalog
                     (default: "Have a project in mind? / Let’s create something together.")
     catalogEmpty    optional { title, text }: what the panel says while the service has no project to list
                     (default: "No projects to show here yet." and a short line inviting an enquiry). A service with
                     no showable project gets that note and a "Start a project" button instead of a catalog drawer.
   ========================================================================== */

export const solutions = [
  {
    id: 'get-noticed',
    number: '001',
    title: ['Get', 'noticed'],
    category: 'Digital Advertising & Motion Campaigns',
    summary: 'We create digital ads, animated banners and social campaigns that help your brand stand out and reach the right audience.',
    headline: 'A campaign worth noticing.',
    about: [
      'We design and produce digital advertising for brands, products and services, from animated banners and short motion ads to social creatives. Each campaign is built around your brand, your audience, the platform it runs on and the message it needs to carry.'
    ],
    why: [
      'People give an ad a few seconds, on platforms that each have their own formats. We design for that moment: one clear message, motion where it helps, and a version made for every placement.'
    ],
    include: [
      'Animated HTML5 display banners',
      'Banners in multiple sizes, in vertical, square and landscape formats',
      '6–15 second motion ads',
      'Social media ad creatives',
      'Product and service promotional campaigns',
      'Campaign key visuals',
      'Campaign motion graphics',
      'AI-assisted product and campaign visuals',
      'Adaptations for different digital placements'
    ],
    contactCategory: 'Digital Advertising',
    projectStatus: 'in-development',
    projectUrl: '',
    projectLabel: 'Explore Experience',
    previewImage: '',
    previewAlt: '',
    catalogEmpty: { text: 'We only list work that exists, and none of it is an advertising campaign yet. If you have a campaign in mind, tell us about it.' },
    artwork: { stretch: 125, fit: 17.27, align: 'start', motion: 'frame' }
  },
  {
    id: 'build-anticipation',
    number: '002',
    title: ['Build', 'anticipation'],
    category: 'Launch & Interactive Experiences',
    summary: 'Turn your next launch into an experience. From teasers and countdowns to interactive reveals, we build excitement before the big moment.',
    headline: 'A launch worth waiting for.',
    about: [
      'We create connected experiences for the launch of a product, brand, service or campaign. They can stand alone as a microsite or combine into one story, designed and built in one place, from the first teaser to launch day.',
      'When the launch also has a guest list, such as a private opening or a preview, the invitation and RSVP side is covered by 004 You’re Invited.'
    ],
    why: [
      'Announcing a date is not enough. People need a reason to pay attention, a clear picture of what is coming and an easy way to take part. A planned experience builds interest step by step and gives the right audience one place to register.'
    ],
    include: [
      'Launch microsites for products and brands',
      'Teaser pages and campaigns',
      'Countdown experiences',
      'Interactive product reveals',
      'Scroll-driven storytelling',
      'Interactive launch presentations',
      'Launch registration and inquiry flows',
      'Connected launch campaigns, from teaser to launch day'
    ],
    contactCategory: 'Launch & Interactive Experience',
    projectStatus: 'in-development',
    projectUrl: '',
    projectLabel: 'Explore Experience',
    previewImage: '',
    previewAlt: '',
    artwork: { stretch: 80, fit: 16.66, align: 'end', motion: 'build' }
  },
  {
    id: 'make-an-impression',
    number: '003',
    title: ['Make an', 'impression'],
    category: 'Creative Websites & Digital Experiences',
    summary: 'Distinctive websites that showcase what you do, build trust and make it easy for visitors to take the next step.',
    headline: 'A website worth remembering.',
    about: [
      'We design and develop websites that bring together identity, visual storytelling and a considered user experience: for businesses and campaigns, and for creators with a portfolio, a blog or a personal brand to present. Each one is built around your goals and the people who will visit it.'
    ],
    why: [
      'A website is often the first place people meet you. Clear content, a confident design and an easy next step help visitors understand what you do, trust you and get in touch.'
    ],
    include: [
      'Business and service websites',
      'Creator websites, personal portfolios and blogs',
      'Campaign landing pages',
      'Interactive product presentation pages',
      'Digital catalogs',
      'UI/UX design',
      'Responsive front-end development',
      'GSAP-powered motion interactions',
      'Contact and inquiry forms',
      'Affiliate integrations',
      'A content structure that guides visitors to the next step'
    ],
    contactCategory: 'Creative Website',
    projectStatus: 'in-development',
    projectUrl: '',
    projectLabel: 'Explore Experience',
    previewImage: '',
    previewAlt: '',
    artwork: { stretch: 112, fit: 13.77, align: 'end', motion: 'press' }
  },
  {
    id: 'youre-invited',
    number: '004',
    title: ['You’re', 'invited'],
    category: 'Digital Invitations & Event Experiences',
    summary: 'Beautifully designed digital invitations for weddings, celebrations and corporate events — with everything your guests need in one easy-to-share link.',
    headline: 'An invitation worth opening.',
    about: [
      'From weddings and birthdays to private and corporate events, we create interactive digital invitations that make every occasion feel special — and keep everything guests need in one place.'
    ],
    why: [
      'One beautiful link brings together the invitation, event details, maps and RSVP. Guests know where to go and how to respond, while you keep track of replies without endless messages.'
    ],
    include: [
      'Custom invitation design',
      'Interactive animations',
      'Event schedule',
      'Location and maps',
      'Dress code',
      'Countdown',
      'RSVP',
      'Guest response tracking'
    ],
    includeNote: 'Where feasible, an invitation can be personalized for each guest or group. We collect only the details the event needs, and agree with you where replies are stored and who can see them.',
    contactCategory: 'Private or Corporate Event',
    projectStatus: 'in-development',
    projectUrl: '',
    projectLabel: 'Explore Experience',
    previewImage: '',
    previewAlt: '',
    filterBy: 'eventType',
    catalogLayout: 'spread',
    catalogIntro: 'Wedding invitations we designed and built, both live. Open one the way a guest would: on a phone, with the sound on.',
    catalogEnd: { title: 'Have an occasion in mind?', text: 'Let’s design the invitation.' },
    artwork: { stretch: 100, fit: 24, align: 'start', motion: 'open', setup: 'serif' }
  }
];

/* A demonstration link is shown only for a live project with a URL. */
export const isLive = (s) => s.projectStatus === 'live' && typeof s.projectUrl === 'string' && s.projectUrl.trim() !== '';
