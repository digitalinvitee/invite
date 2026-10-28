/* ==========================================================================
   Creative Solutions — markup from the data in solutions.js.

   Plain string templates with no DOM access, so the same functions run in the
   browser (js/solutions/CreativeSolutions.js) and in Node
   (tools/render-solutions.mjs, which writes the static HTML into index.html).

   The mosaic is one grid: each tile is followed by its details. Without the
   script every detail is visible under its row; the script hides them and
   opens one at a time.

   Each service's project catalog is written by js/solutions/catalog.js and
   handed to renderDetail as ready-made markup, so this file (which the page
   loads) stays free of the project data (which only the build step reads).
   ========================================================================== */

import { isLive } from './solutions.js';

export const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* Only web links and paths inside the site are rendered as links. */
export const safeUrl = (u) => {
  const url = String(u || '').trim();
  return /^(https?:\/\/|\/|\.{0,2}\/|[\w-]+\/)/i.test(url) && !/^\s*javascript:/i.test(url) ? url : '';
};

const letters = (word) => Array.from(word).map((ch) => `<span class="ch">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('');

/* The title as a typographic composition: the small line (what you do) is outlined,
   the large line (what you get) is filled and set to the full width of the tile. */
function artwork(s) {
  const [setup, payoff] = s.title;
  const a = s.artwork || {};
  const motion = a.motion || 'none';
  const word = esc(payoff);
  let big;
  if (motion === 'build') {
    big = `<span class="fit fit--outline">${word}</span><span class="fit fit--fill">${word}</span><i class="sol__edge"></i>`;
  } else if (motion === 'respond' || motion === 'gather') {
    big = `<span class="fit">${letters(payoff)}</span>`;
  } else if (motion === 'frame') {
    big = `<span class="fit">${word}</span><i class="sol__mark sol__mark--tl"></i><i class="sol__mark sol__mark--tr"></i><i class="sol__mark sol__mark--bl"></i><i class="sol__mark sol__mark--br"></i>`;
  } else if (motion === 'open') {
    // Two halves of the same word, folded like a card; the crease between them is the lavender rule.
    big = `<span class="fit fit--half fit--l">${word}</span><span class="fit fit--half fit--r">${word}</span><i class="sol__crease"></i>`;
  } else {
    big = `<span class="fit">${word}</span>`;
  }
  return `<span class="sol__art" aria-hidden="true" style="--stretch:${Number(a.stretch) || 100}%;--fit:${Number(a.fit) || 14}">
            <span class="sol__line sol__line--setup sol__line--${a.align === 'end' ? 'end' : 'start'}"><span class="setup${a.setup === 'serif' ? ' setup--serif' : ''}">${esc(setup).replace(/&#39;/g, '’')}</span></span>
            <span class="sol__line sol__line--payoff">${big}</span>
          </span>`;
}

/* Preview image and demonstration link: empty until a project is live. */
export function renderExtras(s) {
  if (!isLive(s)) return '';
  const url = safeUrl(s.projectUrl);
  if (!url) return '';
  const img = safeUrl(s.previewImage)
    ? `<figure class="sol__preview"><img src="${esc(s.previewImage)}" alt="${esc(s.previewAlt || '')}" loading="lazy" decoding="async"></figure>`
    : '';
  return `${img}<a class="btn btn--primary sol__explore" href="${esc(url)}" target="_blank" rel="noopener">${esc(s.projectLabel || 'Explore Experience')} <span class="arr arr--up" aria-hidden="true">↗</span><span class="sr-only"> (opens the ${esc(s.title.join(' ').toLowerCase())} demonstration in a new tab)</span></a>`;
}

export function renderTile(s, i) {
  const id = esc(s.id), motion = esc((s.artwork || {}).motion || 'none');
  return `<article class="sol sol--${motion} sol--pos${i + 1}" id="solution-${id}" data-solution="${id}" data-motion="${motion}" aria-labelledby="solution-${id}-title">
        <div class="sol__meta">
          <span class="sol__num">${esc(s.number)}</span>
          <p class="sol__category">${esc(s.category)}</p>
        </div>
        <h3 class="sol__title" id="solution-${id}-title">
          <span class="sr-only">${esc(s.title.join(' '))}</span>
          ${artwork(s)}
        </h3>
        <div class="sol__foot">
          <p class="sol__summary">${esc(s.summary)}</p>
          <button class="sol__toggle" type="button" aria-expanded="false" aria-controls="solution-${id}-details" data-sol-toggle>
            <span class="sol__toggle-label">Details</span><span class="sr-only"> about ${esc(s.title.join(' ').toLowerCase())}</span><i class="sol__toggle-icon" aria-hidden="true"></i>
          </button>
        </div>
      </article>`;
}

/* The row of four service links under the hero (index.html, between the solutions:strip markers).
   The name is the title in sentence case ("Get noticed"), so it always follows solutions.js. */
export function renderStrip(list) {
  const name = (s) => { const t = s.title.join(' ').toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1); };
  return list.map((s) => `<li><a href="#solution-${esc(s.id)}" data-cx-service="${esc(s.id)}"><span class="meta-strip__num">${esc(s.number)}</span><span class="meta-strip__name">${esc(name(s)).replace(/&#39;/g, '’')}</span></a></li>`).join('\n      ');
}

/* `catalog` is the service's "See Project Catalog" row and drawer (catalog.js); it closes the panel. */
export function renderDetail(s, catalog = '') {
  const id = esc(s.id);
  const paras = (list) => list.map((p) => `<p>${esc(p)}</p>`).join('');
  const contact = s.contactCategory
    ? `<a class="btn btn--text sol-detail__contact" href="#contact" data-start-project data-category="${esc(s.contactCategory)}">Start a project like this <span class="arr" aria-hidden="true">→</span></a>`
    : '';
  const note = s.includeNote ? `\n              <p class="sol__note">${esc(s.includeNote)}</p>` : '';
  return `<div class="sol-detail" id="solution-${id}-details" data-sol-detail="${id}" role="region" aria-labelledby="solution-${id}-title">
        <div class="sol-detail__inner">
          <div class="sol-detail__head">
            <button class="sol-detail__close" type="button" data-sol-close>Close <span aria-hidden="true">×</span><span class="sr-only"> details about ${esc(s.title.join(' ').toLowerCase())}</span></button>
          </div>
          <div class="sol-detail__grid">
            <div class="sol-detail__value">
              <p class="sol__value">${esc(s.headline)}</p>
              ${contact}
              <div class="sol__extras" data-sol-extras>${renderExtras(s)}</div>
            </div>
            <div class="sol-detail__col">
              <h4 class="label">What it is</h4>
              <div class="sol__text">${paras(s.about)}</div>
            </div>
            <div class="sol-detail__col">
              <h4 class="label">Why it works</h4>
              <div class="sol__text">${paras(s.why)}</div>
            </div>
            <div class="sol-detail__col">
              <h4 class="label">What we can include</h4>
              <ul class="sol__list" role="list">${s.include.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>${note}
            </div>
          </div>${catalog ? `\n          ${catalog}` : ''}
        </div>
      </div>`;
}

/* `catalogOf(service)` returns that service's catalog markup (see catalog.js); omit it for details only. */
export function renderMosaic(list, catalogOf = () => '') {
  return list.map((s, i) => `${renderTile(s, i)}\n      ${renderDetail(s, catalogOf(s))}`).join('\n\n      ');
}
