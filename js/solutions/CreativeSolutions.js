/* ==========================================================================
   Creative Solutions — the page script for the homepage section.

   1. Details: each tile's "Details" button opens one panel under its row (only
      one open at a time). Escape or Close returns focus to the tile. A link to
      #solution-<id> opens that tile's details.
      Project catalog: the "See Project Catalog" button at the foot of a panel opens
      that service's catalog in place, under the details. Escape closes the catalog
      first and the panel on the next press; focus goes back to the button. Closing or
      switching the panel closes its catalog. A link to #solution-<id>-catalog opens
      both. Filters (only written for larger catalogs) work in place. A catalog set as
      "spread" (004) is moved by CatalogSpreads.js: a reveal and a pointer drift.
   2. Links: details follow js/solutions/solutions.js, so a demonstration link or
      preview added there shows up even before index.html is regenerated.
      (Catalog cards come from js/solutions/projects.js through the build step:
      node tools/render-solutions.mjs.)
   3. Fit: each large word is re-measured once the fonts are in, so it spans its
      tile exactly, even if the title text is edited.
   4. Title motions (the CSS holds the states):
        frame    GET NOTICED         crop marks close in around the word
        build    BUILD ANTICIPATION  the fill builds behind a lavender edge
        press    MAKE AN IMPRESSION  the paper tile is pressed with ink
        open     YOU'RE INVITED      the folded card opens along a lavender crease
      Two spare motions are kept for a future tile, though none of today's tiles uses them:
        respond  letters near the pointer turn into outlines
        gather   the letters come together
      They play on hover, focus and while a tile is open, and while scrolling:
      a tile plays as it crosses the middle of the screen and settles back once
      it has passed, on every device. Reduced motion: states change without
      movement and nothing plays by itself.
   ========================================================================== */

import { solutions } from './solutions.js';
import { renderExtras } from './render.js';
import { initConnectedLaunch } from './ConnectedLaunch.js';
import { initCatalogSpreads } from './CatalogSpreads.js';
import { motion } from '../core/motion.js';
import { $, $$ } from '../core/dom.js';
import { audio } from '../audio/AudioController.js';

/* Links to the five services that existed before the three-service update still land somewhere useful.
   "Bring people together" was about invitations and replies, which is now service 004. */
const LEGACY_IDS = { 'make-it-interactive': 'build-anticipation', 'bring-people-together': 'youre-invited' };

export function initCreativeSolutions() {
  const mosaic = $('[data-solutions]');
  if (mosaic) {
    const tiles = $$('.sol', mosaic);
    syncLinks(mosaic);
    fitTitles(tiles);
    tiles.filter((t) => t.dataset.motion === 'gather').forEach(spreadLetters);
    tiles.filter((t) => t.dataset.motion === 'respond').forEach(respond);
    details(mosaic, tiles);
    initCatalogSpreads(mosaic);
    engageOnScroll(tiles);
  }
  initConnectedLaunch();
}

/* ── 1. Details ──────────────────────────────────────────────────────── */
function details(mosaic, tiles) {
  const panels = $$('[data-sol-detail]', mosaic);
  panels.forEach((p) => { p.hidden = true; });
  const drawers = catalogs(panels);
  let openId = null;

  const tileOf = (id) => tiles.find((t) => t.dataset.solution === id);
  const panelOf = (id) => panels.find((p) => p.dataset.solDetail === id);

  const close = (id, { focus = false, opening = false } = {}) => {
    const tile = tileOf(id), panel = panelOf(id);
    if (!tile || !panel) return;
    const drawer = drawers.get(id);
    if (drawer) drawer.close({ quiet: true });   // a catalog goes with its panel
    tile.classList.remove('is-open');
    $('[data-sol-toggle]', tile).setAttribute('aria-expanded', 'false');
    if (!opening) audio.play('tick', { freq: 660 });
    panel.classList.remove('is-open');
    const hide = () => { if (!panel.classList.contains('is-open')) panel.hidden = true; };
    if (motion.reduced) hide(); else setTimeout(hide, 560);
    if (openId === id) openId = null;
    if (focus) $('[data-sol-toggle]', tile).focus();
  };

  const open = (id, { scroll = true } = {}) => {
    const tile = tileOf(id), panel = panelOf(id);
    if (!tile || !panel) return;
    if (openId && openId !== id) close(openId, { opening: true });
    openId = id;
    tile.classList.add('is-open');
    $('[data-sol-toggle]', tile).setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    // The steps that follow check that the panel is still wanted: a key held down presses Details many times a second.
    requestAnimationFrame(() => requestAnimationFrame(() => { if (openId === id) panel.classList.add('is-open'); }));
    if (tile.dataset.motion === 'respond' && tile._wave) tile._wave();
    audio.play('select', { step: tiles.indexOf(tile) });
    if (scroll) setTimeout(() => {
      if (openId !== id) return;
      const r = panel.getBoundingClientRect();
      if (r.bottom > innerHeight || r.top < 0) panel.scrollIntoView({ behavior: motion.reduced ? 'auto' : 'smooth', block: 'nearest' });
    }, motion.reduced ? 0 : 420);
  };

  tiles.forEach((tile, i) => {
    const id = tile.dataset.solution;
    $('[data-sol-toggle]', tile).addEventListener('click', () => (openId === id ? close(id) : open(id)));
    // Each tile has its own note: hovering plays it softly (mouse only).
    tile.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') audio.play('note', { step: i, soft: true }); });
  });
  panels.forEach((panel) => {
    const id = panel.dataset.solDetail;
    $('[data-sol-close]', panel).addEventListener('click', () => close(id, { focus: true }));
    // Escape peels one layer: an open catalog first, then the panel.
    panel.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      const drawer = drawers.get(id);
      if (drawer && drawer.isOpen) drawer.close({ focus: true }); else close(id, { focus: true });
    });
  });

  // Other parts of the page can open a solution (the connected launch points at 002).
  $$('[data-open-solution]').forEach((btn) => btn.addEventListener('click', () => {
    const id = btn.dataset.openSolution, tile = tileOf(id);
    if (!tile) return;
    open(id, { scroll: false });
    tile.scrollIntoView({ behavior: motion.reduced ? 'auto' : 'smooth', block: 'start' });
    $('[data-sol-toggle]', tile).focus({ preventScroll: true });
  }));

  // A shared link to one solution (#solution-<id>) opens its details; with -catalog on the end, its catalog too.
  const fromHash = () => {
    const m = location.hash.match(/^#solution-([\w-]+?)(-catalog)?$/);
    if (!m) return;
    const legacy = LEGACY_IDS[m[1]], id = legacy || m[1], tile = tileOf(id);
    if (!tile) return;
    open(id, { scroll: false });
    if (legacy) {
      history.replaceState(null, '', `#solution-${id}`);
      tile.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else if (m[2] && drawers.get(id)) {
      drawers.get(id).open({ scroll: false });
      const region = $('[data-sol-catalog]', panelOf(id));
      setTimeout(() => region.scrollIntoView({ behavior: 'auto', block: 'start' }), motion.reduced ? 0 : 700);
    }
  };
  fromHash();
  addEventListener('hashchange', fromHash);
}

/* ── 1b. Project catalogs ───────────────────────────────────────────────
   One drawer per panel, written into the page by the build step. It is hidden here (without the script
   it simply shows under the details) and opens and closes in place, with the button's aria-expanded kept
   in step. Focus stays on the button when opening and returns to it when closing. Returns id → drawer. */
function catalogs(panels) {
  const drawers = new Map();
  panels.forEach((panel) => {
    const id = panel.dataset.solDetail;
    const region = $('[data-sol-catalog]', panel), toggle = $('[data-sol-catalog-toggle]', panel);
    if (!region || !toggle) return;
    const head = $('.catalog__head', region);
    let isOpen = false, timer = 0;
    region.hidden = true;

    const drawer = {
      get isOpen() { return isOpen; },
      open({ scroll = true } = {}) {
        if (isOpen) return;
        isOpen = true;
        clearTimeout(timer);
        toggle.setAttribute('aria-expanded', 'true');
        region.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => { if (isOpen) region.classList.add('is-open'); }));
        audio.play('tick', { freq: 880 });
        // Once it has grown, make sure its start is on screen, moving the page no more than needed.
        if (scroll) setTimeout(() => { if (isOpen) revealStart(head); }, motion.reduced ? 0 : 360);
      },
      close({ focus = false, quiet = false } = {}) {
        if (!isOpen) return;
        isOpen = false;
        clearTimeout(timer);
        toggle.setAttribute('aria-expanded', 'false');
        region.classList.remove('is-open');
        if (!quiet) audio.play('tick', { freq: 660 });
        const hide = () => { if (!isOpen) region.hidden = true; };
        if (motion.reduced) hide(); else timer = setTimeout(hide, 660);
        if (focus) {
          toggle.focus({ preventScroll: true });
          toggle.scrollIntoView({ behavior: motion.reduced ? 'auto' : 'smooth', block: 'nearest' });
        }
      }
    };

    toggle.addEventListener('click', () => (isOpen ? drawer.close() : drawer.open()));
    $$('[data-sol-catalog-close]', region).forEach((b) => b.addEventListener('click', () => drawer.close({ focus: true })));
    filters(region);
    drawers.set(id, drawer);
  });
  return drawers;
}

/* Bring the top of the catalog, and a good part of its first cards, into view; scroll only if needed. */
function revealStart(head) {
  if (!head) return;
  const top = head.getBoundingClientRect().top;
  const over = top + Math.min(480, innerHeight * 0.65) - (innerHeight - 16);
  if (over > 0) scrollBy({ top: over, behavior: motion.reduced ? 'auto' : 'smooth' });
}

/* Filters (industry, or event type for 004) exist only in larger catalogs, and only for groups that have a project. */
function filters(region) {
  const bar = $('[data-sol-filters]', region);
  if (!bar) return;
  const buttons = $$('[data-filter]', bar), items = $$('.catalog__item', region), status = $('[data-sol-filter-status]', region);
  buttons.forEach((b) => b.addEventListener('click', () => {
    const wanted = b.dataset.filter;
    let shown = 0;
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    items.forEach((li) => {
      const on = wanted === '*' || li.dataset.group === wanted;
      li.hidden = !on;
      if (on) shown++;
    });
    if (status) status.textContent = wanted === '*' ? `Showing all ${items.length} projects` : `Showing ${shown} of ${items.length} projects: ${wanted}`;
    audio.play('tick', { freq: 1046.5 });
  }));
}

/* ── 2. Demonstration links from the data ───────────────────────────── */
function syncLinks(root) {
  $$('[data-sol-detail]', root).forEach((panel) => {
    const data = solutions.find((s) => s.id === panel.dataset.solDetail);
    const box = $('[data-sol-extras]', panel);
    if (!data || !box) return;
    const html = renderExtras(data);
    if (box.innerHTML.trim() !== html.trim()) box.innerHTML = html;
  });
}

/* ── 3. Fit the large word to its tile ──────────────────────────────── */
function fitTitles(tiles) {
  const run = () => tiles.forEach((tile) => {
    const title = $('.sol__title', tile), art = $('.sol__art', tile), word = $('.sol__line--payoff .fit', tile);
    if (!title || !art || !word) return;
    const fit = parseFloat(art.style.getPropertyValue('--fit')) || 14;
    const scale = parseFloat(getComputedStyle(tile).getPropertyValue('--fit-scale')) || 1;
    const target = title.clientWidth * scale, actual = word.offsetWidth;   // layout width: ignores transforms
    if (!target || !actual) return;
    const ratio = target / actual;
    if (Math.abs(ratio - 1) > 0.004) art.style.setProperty('--fit', (fit * ratio).toFixed(3));
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run); else run();
}

/* ── 4. Title motions that need a script ────────────────────────────── */
function spreadLetters(tile) {
  const letters = $$('.sol__line--payoff .ch', tile), mid = (letters.length - 1) / 2;
  letters.forEach((ch, i) => ch.style.setProperty('--i', (i - mid).toFixed(2)));
}

/* "respond" (spare motion): letters near the pointer turn into outlines. It changes colour only,
   so it also runs with reduced motion. */
function respond(tile) {
  const letters = $$('.sol__line--payoff .ch', tile);
  if (!letters.length) return;
  const target = new Float32Array(letters.length), value = new Float32Array(letters.length);
  let raf = 0, centers = [];

  const measure = () => { centers = letters.map((ch) => { const r = ch.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); };
  const tick = () => {
    raf = 0;
    let moving = false;
    for (let i = 0; i < letters.length; i++) {
      const d = target[i] - value[i];
      value[i] = Math.abs(d) < 0.004 ? target[i] : value[i] + d * 0.22;
      if (value[i] !== target[i]) moving = true;
      letters[i].style.setProperty('--h', value[i].toFixed(3));
    }
    if (moving) raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const aim = (x, y) => {
    const size = parseFloat(getComputedStyle($('.sol__line--payoff', tile)).fontSize) || 80;
    const reach = size * 1.1;
    centers.forEach(([cx, cy], i) => { target[i] = Math.max(0, 1 - Math.hypot(x - cx, (y - cy) * 0.5) / reach); });
    kick();
  };
  const release = () => { target.fill(0); kick(); };

  tile.addEventListener('pointerenter', measure);
  tile.addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; if (!centers.length) measure(); aim(e.clientX, e.clientY); });
  tile.addEventListener('pointerleave', release);
  addEventListener('scroll', () => { centers = []; }, { passive: true });
  addEventListener('resize', () => { centers = []; }, { passive: true });

  // One pass across the word: on focus, on open and as a touch preview.
  tile._wave = () => {
    if (motion.reduced) return;
    measure();
    if (!centers.length) return;
    const y = centers[0][1], x0 = centers[0][0] - 60, x1 = centers[centers.length - 1][0] + 60, t0 = performance.now(), dur = 1300;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      aim(x0 + (x1 - x0) * t, y);
      if (t < 1) requestAnimationFrame(step); else release();
    };
    requestAnimationFrame(step);
  };
  tile.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) tile._wave(); });
}

/* Scrolling engages the tiles too. A tile is live while any part of it crosses the middle band of
   the screen: its title performs, then settles back once the tile has passed. Tiles that share a row
   play together. Each tile that comes alive sounds one soft note of a rising phrase (only when sound
   is on). Reduced motion: nothing plays by itself. */
function engageOnScroll(tiles) {
  if (!('IntersectionObserver' in window)) return;
  let io = null;
  const start = () => {
    if (io || motion.reduced) return;
    io = new IntersectionObserver((entries) => {
      let k = 0;   // tiles that come alive together (one row) sound as a short strum
      entries.forEach((e) => {
        const tile = e.target, live = e.isIntersecting;
        if (live === tile.classList.contains('is-live')) return;
        tile.classList.toggle('is-live', live);
        if (!live) return;
        if (tile.dataset.motion === 'respond' && tile._wave) tile._wave();
        audio.play('note', { step: tiles.indexOf(tile), at: 0.13 * k++ });
      });
    }, { rootMargin: '-38% 0px -38% 0px', threshold: 0 });
    tiles.forEach((t) => io.observe(t));
  };
  const stop = () => {
    if (io) { io.disconnect(); io = null; }
    tiles.forEach((t) => t.classList.remove('is-live'));
  };
  start();
  motion.onChange((reduced) => (reduced ? stop() : start()));
}
