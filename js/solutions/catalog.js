/* ==========================================================================
   Project catalog — markup from the data in projects.js.

   Plain string templates with no DOM access. Only the build step uses this file:
   tools/render-solutions.mjs writes each service's catalog into index.html with the
   rest of that service's details (render.js places it at the foot of the panel).
   The page script (CreativeSolutions.js) then opens and closes it; it never needs
   the project data itself, so the data is not downloaded by visitors.

   Per service the markup is:
     the "See Project Catalog" row                  (.sol-detail__foot)
     the catalog drawer                             (.catalog)
        head (with an optional one-line intro), optional filters (by industry, or by event type for 004),
        the projects, closing call to action
   A service with no showable project has no drawer at all. Its foot says so in two lines and offers
   "Start a project" instead (.sol-detail__foot--empty), so nobody opens a panel to find nothing in it.
   Add a project to projects.js, run the build step, and the button and drawer appear.

   The projects are shown in one of three layouts (`catalogLayout` in solutions.js):
     rows     a compact list, one ruled row per project: a small picture, the name, its status and a line about it,
              and the links (default; 001 to 003). A project that belongs to several services is the same real
              work in each, so each catalog only points to it. The full presentation is in Selected Work and
              in the case study.
     cards    a grid of cards, one large picture each, for a service whose projects are not shown elsewhere
     spread   one large editorial spread per project: a plate in the project's own colour carrying up to three
              real screens, and beside it the name, what it contains, the facts and the live link
              (004 You're Invited, where the work is best seen as it is, on a phone). The spreads alternate
              sides. Any number of projects works: more are simply more spreads.

   Without the script the drawer is simply visible under the details.
   ========================================================================== */

import { projectsFor, STATUS_LABEL } from './projects.js';
import { esc, safeUrl } from './render.js';

/* Filters appear only when a catalog is big enough to need them, and only for the groups that have
   a project in it, so a filter can never lead to an empty list. A service sorts its catalog by
   industry (default) or by event type: see `filterBy` in solutions.js. */
export const FILTER_MIN_PROJECTS = 4;
export const FILTER_MIN_GROUPS = 2;

/* What a service with nothing to list says (a service can override it with `catalogEmpty` in solutions.js). */
const EMPTY = {
  title: 'No projects to show here yet.',
  text: 'We only list work that exists, so there is nothing to browse for now. If you have something in mind, tell us about it.'
};

const groupKey = (s) => (s.filterBy === 'eventType' ? 'eventType' : 'industry');
const groupOf = (p, s) => String(p[groupKey(s)] || '').trim();
const groupName = (s) => (s.filterBy === 'eventType' ? 'event type' : 'industry');

/* A case study must be a page inside this site; a live experience must be a secure web address. */
const internalUrl = (u) => {
  const url = safeUrl(u);
  return url && !/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(url) ? url : '';
};
const liveUrlOf = (p) => {
  const url = String(p.liveUrl || '').trim();
  return p.status === 'live' && /^https:\/\/[^\s"'<>]+$/i.test(url) ? url : '';
};
const cropOf = (p) => (/^[\d.%\s]+$/.test(String(p.coverPosition || '')) ? String(p.coverPosition).trim() : '');

/* What width the picture will have, for the browser's choice of file: one, two or three columns. */
const SIZES = {
  1: '(max-width: 1099px) 92vw, 56vw',
  2: '(max-width: 699px) 92vw, 46vw',
  3: '(max-width: 699px) 92vw, (max-width: 1099px) 46vw, 30vw'
};

/* The compact row's picture is small everywhere: a few rem wide. */
const ROW_SIZES = '(max-width: 40em) 80px, (max-width: 56.25em) 112px, 224px';

const indent = (text, n) => text.replace(/^(?=.)/gm, ' '.repeat(n));

/* One compact row: picture, status and facts, name, a line about it, and the links. */
function renderRow(p, s) {
  const base = `solution-${s.id}-project-${p.id}`;
  const caseUrl = internalUrl(p.caseStudyUrl);
  const liveUrl = liveUrlOf(p);
  const [w, h] = Array.isArray(p.coverSize) ? p.coverSize : [];
  const crop = cropOf(p);
  const img = `<img src="${esc(p.coverImage)}"${p.coverSrcset ? ` srcset="${esc(p.coverSrcset)}" sizes="${ROW_SIZES}"` : ''}${w && h ? ` width="${Number(w)}" height="${Number(h)}"` : ''} alt="${esc(p.coverAlt)}" loading="lazy" decoding="async"${crop ? ` style="object-position:${esc(crop)}"` : ''}>`;
  // The picture links to the case study too, for people with a pointer; keyboard and screen-reader users get the labelled link.
  const media = caseUrl
    ? `<a class="prow__media" href="${esc(caseUrl)}" tabindex="-1" aria-hidden="true">${img}</a>`
    : `<div class="prow__media">${img}</div>`;
  const status = `<span class="prow__status prow__status--${esc(p.status)}"><span class="prow__dot" aria-hidden="true"></span><span class="sr-only">Status: </span>${esc(STATUS_LABEL[p.status])}</span>`;
  const facts = [groupOf(p, s) || String(p.industry || '').trim(), p.projectType, p.year].filter(Boolean).map((f) => `<span>${esc(f)}</span>`);
  const meta = [status].concat(facts).join('<span class="sr-only">, </span>');
  const actions = [
    caseUrl ? `<a class="btn btn--ghost btn--sm" href="${esc(caseUrl)}">View Case Study <span class="arr" aria-hidden="true">→</span><span class="sr-only">: ${esc(p.name)}</span></a>` : '',
    liveUrl ? `<a class="btn btn--text prow__live" href="${esc(liveUrl)}" target="_blank" rel="noopener">Explore Live Experience <span class="arr arr--up" aria-hidden="true">↗</span><span class="sr-only">: ${esc(p.name)} (opens in a new tab)</span></a>` : ''
  ].filter(Boolean);
  return [
    `<li class="catalog__item" data-group="${esc(groupOf(p, s))}">`,
    `  <article class="prow" id="${esc(base)}" aria-labelledby="${esc(base)}-title">`,
    `    ${media}`,
    `    <div class="prow__body">`,
    `      <p class="prow__meta label">${meta}</p>`,
    `      <h5 class="prow__title" id="${esc(base)}-title">${esc(p.name)}</h5>`,
    `      <p class="prow__text">${esc(p.description)}</p>`,
    `    </div>`,
    actions.length ? `    <div class="prow__go">\n${indent(actions.join('\n'), 6)}\n    </div>` : '',
    `  </article>`,
    `</li>`
  ].filter(Boolean).join('\n');
}

function renderCard(p, s, cols) {
  const base = `solution-${s.id}-project-${p.id}`;
  const caseUrl = internalUrl(p.caseStudyUrl);
  const liveUrl = liveUrlOf(p);
  const [w, h] = Array.isArray(p.coverSize) ? p.coverSize : [];
  const crop = cropOf(p);
  const img = `<img src="${esc(p.coverImage)}"${p.coverSrcset ? ` srcset="${esc(p.coverSrcset)}" sizes="${SIZES[cols]}"` : ''}${w && h ? ` width="${Number(w)}" height="${Number(h)}"` : ''} alt="${esc(p.coverAlt)}" loading="lazy" decoding="async"${crop ? ` style="object-position:${esc(crop)}"` : ''}>`;
  const status = `<span class="pcard__status pcard__status--${esc(p.status)}"><span class="pcard__dot" aria-hidden="true"></span><span class="sr-only">Status: </span>${esc(STATUS_LABEL[p.status])}</span>`;
  // The picture links to the case study too, for people with a pointer; keyboard and screen-reader users get the labelled link below.
  const media = caseUrl
    ? `<a class="pcard__media" href="${esc(caseUrl)}" tabindex="-1" aria-hidden="true">${img}${status}</a>`
    : `<div class="pcard__media">${img}${status}</div>`;
  const tags = Array.isArray(p.deliverables) && p.deliverables.length
    ? `<ul class="pcard__tags tag-list label" role="list" aria-label="What the project contains">${p.deliverables.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`
    : '';
  const type = [p.projectType, p.year].filter(Boolean).map(esc).join(' · ');
  const actions = [
    caseUrl ? `<a class="btn btn--ghost btn--sm" href="${esc(caseUrl)}">View Case Study <span class="arr" aria-hidden="true">→</span><span class="sr-only">: ${esc(p.name)}</span></a>` : '',
    liveUrl ? `<a class="btn btn--text pcard__live" href="${esc(liveUrl)}" target="_blank" rel="noopener">Explore Live Experience <span class="arr arr--up" aria-hidden="true">↗</span><span class="sr-only">: ${esc(p.name)} (opens in a new tab)</span></a>` : ''
  ].filter(Boolean);
  const first = groupOf(p, s) || String(p.industry || '').trim();   // "Corporate" in 004, the sector elsewhere
  const meta = `${first ? `${esc(first)}<span aria-hidden="true"> / </span><span class="sr-only">, </span>` : ''}${esc(s.category)}`;
  return [
    `<li class="catalog__item" data-group="${esc(groupOf(p, s))}">`,
    `  <article class="pcard" id="${esc(base)}" aria-labelledby="${esc(base)}-title">`,
    `    ${media}`,
    `    <div class="pcard__body">`,
    `      <p class="pcard__meta label">${meta}</p>`,
    `      <h5 class="pcard__title" id="${esc(base)}-title">${esc(p.name)}</h5>`,
    `      <p class="pcard__text">${esc(p.description)}</p>`,
    tags ? `      ${tags}` : '',
    `    </div>`,
    `    <div class="pcard__foot">`,
    type ? `      <p class="pcard__type label">${type}</p>` : '',
    actions.length ? `      <div class="pcard__actions">\n${indent(actions.join('\n'), 8)}\n      </div>` : '',
    `    </div>`,
    `  </article>`,
    `</li>`
  ].filter(Boolean).join('\n');
}

/* ── Spreads ─────────────────────────────────────────────────────────────
   A project's own colour goes into a style attribute, so it must be a plain hex colour; anything else is dropped. */
const toneOf = (p) => (/^#(?:[0-9a-f]{3}){1,2}$/i.test(String(p.previewTone || '').trim()) ? String(p.previewTone).trim() : '');

/* Up to three real screens, in the order a visitor meets them. A project with no `screens` shows its cover alone. */
const MAX_SCREENS = 3;
const screensOf = (p) => {
  const own = Array.isArray(p.screens) ? p.screens.filter((x) => x && x.image && x.alt) : [];
  return (own.length ? own : [{ image: p.coverImage, srcset: p.coverSrcset, size: p.coverSize, alt: p.coverAlt }]).slice(0, MAX_SCREENS);
};

/* The browser's choice of file: about half the width on a phone, a third on a tablet, a fifth beside the words. */
const SPREAD_SIZES = '(max-width: 699px) 50vw, (max-width: 1099px) 32vw, 21vw';

/* The ampersand of a couple's names is set in the serif italic of the site's display type. */
const nameHtml = (name) => esc(name).replace(/&amp;/g, '<em class="amp">&amp;</em>');
const hostPath = (url) => url.replace(/^https:\/\//i, '').replace(/\/$/, '');

function renderSpread(p, s, index) {
  const base = `solution-${s.id}-project-${p.id}`;
  const caseUrl = internalUrl(p.caseStudyUrl);
  const liveUrl = liveUrlOf(p);
  const screens = screensOf(p);
  const tone = toneOf(p);
  const what = /invitation/i.test(String(p.projectType || '')) ? 'invitation' : 'experience';
  const source = p.status === 'live' ? `the live ${what}` : `the ${what} (${STATUS_LABEL[p.status].toLowerCase()})`;
  const labels = screens.map((sc) => String(sc.label || '').trim());
  const caption = `Screens from ${source}${labels.every(Boolean) ? `: ${labels.map((l) => l.toLowerCase()).join(', ')}` : ''}.`;
  const shots = screens.map((sc, i) => {
    const [w, h] = Array.isArray(sc.size) ? sc.size : [];
    return `<div class="spread__screen spread__screen--${i + 1}"><div class="spread__glide"><img src="${esc(sc.image)}"${sc.srcset ? ` srcset="${esc(sc.srcset)}" sizes="${SPREAD_SIZES}"` : ''}${w && h ? ` width="${Number(w)}" height="${Number(h)}"` : ''} alt="${esc(sc.alt)}" loading="lazy" decoding="async"></div></div>`;
  });
  const status = `<span class="pcard__status pcard__status--${esc(p.status)} spread__status"><span class="pcard__dot" aria-hidden="true"></span><span class="sr-only">Status: </span>${esc(STATUS_LABEL[p.status])}</span>`;
  // The plate links to the live invitation for people with a pointer; keyboard and screen-reader users get the labelled link in the text.
  const plateLink = liveUrl ? `<a class="spread__plate-link" href="${esc(liveUrl)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"></a>` : '';
  const tags = Array.isArray(p.deliverables) && p.deliverables.length
    ? `<ul class="spread__tags tag-list label" role="list" aria-label="What it contains">${p.deliverables.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`
    : '';
  const facts = [['Format', p.projectType], ['Language', p.language], ['Year', p.year]].filter(([, v]) => v);
  const actions = [
    liveUrl ? `<a class="btn btn--ghost spread__cta" href="${esc(liveUrl)}" target="_blank" rel="noopener">Open the live ${what} <span class="arr arr--up" aria-hidden="true">↗</span><span class="sr-only">: ${esc(p.name)} (opens in a new tab)</span></a>` : '',
    caseUrl ? `<a class="btn btn--text" href="${esc(caseUrl)}">View Case Study <span class="arr" aria-hidden="true">→</span><span class="sr-only">: ${esc(p.name)}</span></a>` : ''
  ].filter(Boolean);
  const hint = String(p.hint || '').trim();
  return [
    `<li class="catalog__item spread" data-spread data-group="${esc(groupOf(p, s))}">`,
    `  <article class="spread__article" id="${esc(base)}" aria-labelledby="${esc(base)}-title">`,
    `    <div class="spread__copy">`,
    `      <p class="spread__num label" aria-hidden="true">${String(index + 1).padStart(2, '0')}</p>`,
    `      <h5 class="spread__title" id="${esc(base)}-title"><span class="spread__title-in">${nameHtml(p.name)}</span></h5>`,
    `      <p class="spread__text">${esc(p.description)}</p>`,
    tags ? `      ${tags}` : '',
    facts.length ? `      <dl class="spread__facts">\n${facts.map(([k, v]) => `        <div><dt class="label">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n')}\n      </dl>` : '',
    actions.length ? [
      `      <div class="spread__go">`,
      `        <div class="spread__actions">\n${indent(actions.join('\n'), 10)}\n        </div>`,
      liveUrl ? `        <p class="spread__url label">${esc(hostPath(liveUrl))}</p>` : '',
      liveUrl && hint ? `        <p class="spread__hint">${esc(hint)}</p>` : '',
      `      </div>`
    ].filter(Boolean).join('\n') : '',
    `    </div>`,
    `    <figure class="spread__figure">`,
    `      <div class="spread__plate" data-screens="${screens.length}"${tone ? ` style="--tone:${esc(tone)}"` : ''}>`,
    plateLink ? `        ${plateLink}` : '',
    `        ${status}`,
    indent(shots.join('\n'), 8),
    `      </div>`,
    `      <figcaption class="spread__caption label">${esc(caption)}</figcaption>`,
    `    </figure>`,
    `  </article>`,
    `</li>`
  ].filter(Boolean).join('\n');
}

function renderFilters(s, list) {
  const groups = Array.from(new Set(list.map((p) => groupOf(p, s)).filter(Boolean)));
  if (list.length < FILTER_MIN_PROJECTS || groups.length < FILTER_MIN_GROUPS) return '';
  const btn = (value, label, pressed) => `<button class="catalog__filter" type="button" aria-pressed="${pressed}" data-filter="${esc(value)}">${esc(label)}</button>`;
  return [
    `<div class="catalog__filters" role="group" aria-label="Filter ${esc(s.title.join(' ').toLowerCase())} projects by ${groupName(s)}" data-sol-filters>`,
    indent([btn('*', 'All', true)].concat(groups.map((g) => btn(g, g, false))).join('\n'), 2),
    `</div>`,
    `<p class="sr-only" role="status" aria-live="polite" data-sol-filter-status></p>`
  ].join('\n');
}

/* The row and the drawer for one service. `s` is an entry of solutions.js. The first line carries no
   indentation (render.js indents it); the others are indented to sit inside the details panel. */
export function renderCatalog(s) {
  const id = esc(s.id);
  const name = esc(s.title.join(' ').toLowerCase());
  const list = projectsFor(s.id);
  const category = s.contactCategory ? ` data-category="${esc(s.contactCategory)}"` : '';
  const start = `<a class="btn btn--primary" href="#contact" data-start-project${category}>Start a project <span class="arr" aria-hidden="true">→</span></a>`;

  // Nothing to list: say so where the button would be, and offer the way in. No empty drawer, no fake projects.
  if (!list.length) {
    const empty = { ...EMPTY, ...(s.catalogEmpty || {}) };
    return indent([
      `<div class="sol-detail__foot sol-detail__foot--empty" data-sol-catalog-empty>`,
      `  <div class="catalog-note">`,
      `    <p class="catalog-note__title">${esc(empty.title)}</p>`,
      `    <p class="catalog-note__text">${esc(empty.text)}</p>`,
      `  </div>`,
      `  ${start}`,
      `</div>`
    ].join('\n'), 10).trimStart();
  }

  const cols = Math.max(1, Math.min(3, list.length));
  const projectsHtml = s.catalogLayout === 'spread'
    ? `<ol class="spreads" role="list" data-spreads data-count="${list.length}">\n${indent(list.map((p, i) => renderSpread(p, s, i)).join('\n'), 2)}\n</ol>`
    : s.catalogLayout === 'cards'
      ? `<ul class="catalog__grid" role="list" data-cols="${cols}">\n${indent(list.map((p) => renderCard(p, s, cols)).join('\n'), 2)}\n</ul>`
      : `<ul class="prows" role="list">\n${indent(list.map((p) => renderRow(p, s)).join('\n'), 2)}\n</ul>`;
  const body = [renderFilters(s, list), projectsHtml].filter(Boolean).join('\n');
  const html = [
    `<div class="sol-detail__foot">`,
    `  <button class="btn btn--ghost sol-detail__catalog" type="button" aria-expanded="false" aria-controls="solution-${id}-catalog" data-sol-catalog-toggle>See Project Catalog <span class="arr" aria-hidden="true">→</span><span class="sr-only"> for ${name}</span></button>`,
    `</div>`,
    `<section class="catalog" id="solution-${id}-catalog" data-sol-catalog aria-labelledby="solution-${id}-catalog-title">`,
    `  <div class="catalog__clip">`,
    `    <div class="catalog__inner">`,
    `      <header class="catalog__head">`,
    `        <div class="catalog__heading">`,
    `          <h4 class="display catalog__title" id="solution-${id}-catalog-title" tabindex="-1">Project <em>catalog</em><span class="sr-only"> for ${name}</span></h4>`,
    s.catalogIntro ? `          <p class="catalog__intro">${esc(s.catalogIntro)}</p>` : '',
    `        </div>`,
    `        <div class="catalog__tools">`,
    `          <p class="label catalog__count">${list.length} ${list.length === 1 ? 'project' : 'projects'}</p>`,
    `          <button class="sol-detail__close catalog__close" type="button" data-sol-catalog-close>Close catalog <span aria-hidden="true">×</span><span class="sr-only"> for ${name}</span></button>`,
    `        </div>`,
    `      </header>`,
    indent(body, 6),
    `      <div class="catalog__end">`,
    `        <div class="catalog__end-copy">`,
    `          <p class="catalog__end-title">${esc((s.catalogEnd && s.catalogEnd.title) || 'Have a project in mind?')}</p>`,
    `          <p class="catalog__end-text">${esc((s.catalogEnd && s.catalogEnd.text) || 'Let’s create something together.')}</p>`,
    `        </div>`,
    `        <div class="catalog__end-actions">`,
    `          ${start}`,
    `          <button class="btn btn--text catalog__close-end" type="button" data-sol-catalog-close>Close catalog <span class="arr" aria-hidden="true">↑</span><span class="sr-only"> for ${name}</span></button>`,
    `        </div>`,
    `      </div>`,
    `    </div>`,
    `  </div>`,
    `</section>`
  ].filter(Boolean).join('\n');
  return indent(html, 10).trimStart();
}

/* ── Selected Work: the invitations, compact ───────────────────────────────
   The third block of Selected Work shows the first two live projects of 004 as real phone screens (each project's cover),
   with the name, the live link and one button into the full catalog. It is written from the same list as the catalogs, so
   a change to a name, a picture or an address is made once, in js/solutions/projects.js, and `node tools/render-solutions.mjs`
   rewrites the block between the <!-- solutions:invites --> markers in index.html. With no live project it writes nothing.
   The words that frame the screens (the sentence, "Our part") are in the two constants below. */
export const INVITES_MAX = 2;
const INVITES_SERVICE = 'youre-invited';
const INVITES_PART = { many: 'Design, animation and build of each invitation.', one: 'Design, animation and build of the invitation.' };
const NUMBER_WORD = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
const INVITE_SIZES = '(min-width: 1080px) 240px, 42vw';
const smart = (text) => String(text || '').replace(/(\w)'(\w)/g, '$1’$2');   // typographic apostrophes, as everywhere else on the page
const unique = (values) => [...new Set(values.map((v) => String(v || '').trim()).filter(Boolean))];

export function renderInvites(list = projectsFor(INVITES_SERVICE)) {
  const shown = list.filter((p) => liveUrlOf(p)).slice(0, INVITES_MAX);
  if (!shown.length) return '';
  const n = shown.length;
  const kind = shown.every((p) => p.eventType === 'Weddings') ? 'Wedding invitations' : 'Digital invitations';
  const facts = [unique(shown.map((p) => p.language)).join(', '), unique(shown.map((p) => p.year)).join(', ')].filter(Boolean);
  const all = list.length === n ? (n === 1 ? 'it' : n === 2 ? 'both' : 'all') : 'all';
  const item = (p) => {
    const url = liveUrlOf(p);
    const first = String(p.coverSrcset || '').split(',')[0].trim().split(/\s+/)[0] || p.coverImage;   // the smallest file, as the screen's own src
    const [w, h] = Array.isArray(p.coverSize) ? p.coverSize : [];
    const name = esc(p.name).replace(/ &amp; /g, ' <span class="amp">&amp;</span> ');
    return [
      `<li class="invite">`,
      `  <a class="invite__screen" href="${esc(url)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">`,
      `    <img src="${esc(first)}"${p.coverSrcset ? ` srcset="${esc(p.coverSrcset)}" sizes="${INVITE_SIZES}"` : ''}${w && h ? ` width="${Number(w)}" height="${Number(h)}"` : ''} loading="lazy" decoding="async" alt="${esc(smart(p.coverAlt))}">`,
      `  </a>`,
      `  <p class="invite__name">${name}</p>`,
      `  <a class="btn btn--text" href="${esc(url)}" target="_blank" rel="noopener">Open live <span class="arr arr--up" aria-hidden="true">↗</span><span class="sr-only"> invitation for ${esc(p.name)} (opens in a new tab)</span></a>`,
      `</li>`
    ].join('\n');
  };
  return [
    `<article class="case invites" aria-labelledby="invites-title">`,
    `  <div class="invites__head">`,
    `    <ul class="case-meta label" aria-label="Project details">`,
    `      <li class="case-status">Live</li>`,
    `      <li>${esc(kind)}</li>`,
    ...facts.map((f) => `      <li>${esc(f)}</li>`),
    `    </ul>`,
    `    <h3 class="invites__title" id="invites-title">${esc(kind)}</h3>`,
    `    <p class="lead">${NUMBER_WORD[n] || n} live invitation${n === 1 ? '' : 's'}. Open ${n === 1 ? 'it' : 'one'} the way a guest would: on a phone, with the sound on.</p>`,
    `    <p class="case-part"><span class="label">Our part</span><span>${esc(n === 1 ? INVITES_PART.one : INVITES_PART.many)}</span></p>`,
    `  </div>`,
    `  <ul class="invites__pair" role="list">`,
    indent(shown.map(item).join('\n'), 4),
    `  </ul>`,
    `  <div class="invites__actions case-actions">`,
    `    <a class="btn btn--primary" href="#solution-${INVITES_SERVICE}-catalog">See ${all} in full <span class="arr" aria-hidden="true">→</span><span class="sr-only"> in the You’re invited catalog</span></a>`,
    `  </div>`,
    `</article>`
  ].join('\n');
}
