/* ==========================================================================
   Fig. 01 — From attention to action.
   One path in three stages: Attention, Engagement and Action. The orbit and the four service links
   share one state: choosing a stage lights the services that belong to it.

   - The signal travels to the stage that is on, and the ring fills up to it.
   - Hovering (mouse) previews a stage, a tap or click pins it (again to let go), keyboard focus
     selects it, the arrow keys move around the orbit, Escape lets go.
   - Once, after the intro hands over, a short pass walks Attention, Engagement, Action and rests with
     all three on. It never loops, it stops at the first touch, and it does not run with reduced
     motion (the figure then simply rests with all three on).
   - On a phone the panel under the orbit always lists all four services, and a stage lights its own, so
     the figure carries the service links and the strip under it is not repeated (css/home.css).
   - With sound on, each stage has a note.
   ========================================================================== */

import { $, $$, escapeHTML } from '../core/dom.js';
import { motion } from '../core/motion.js';
import { audio } from '../audio/AudioController.js';
import { solutions } from '../solutions/solutions.js';

/* The stages and the services each one points to (ids from js/solutions/solutions.js). */
const STAGES = [
  { name: 'Attention', text: 'Ads, motion and social creatives that put your product or offer in front of the people you want to reach.', services: ['get-noticed'] },
  { name: 'Engagement', text: 'Launch experiences and interactive stories that build curiosity and explain what is coming.', services: ['build-anticipation'] },
  { name: 'Action', text: 'Websites and invitations that make the next step easy: get in touch, find the details, reply.', services: ['make-an-impression', 'youre-invited'] }
];
const CX = 200, CY = 200, R = 118;            // must match the SVG in index.html
const START = 150, SPAN = 240;                // a gauge that opens at the bottom: Attention at the lower left, over the top, to Action at the lower right
const POS = [0, 0.5, 1];                      // where each stage sits along the ring (left to right)
const SEQUENCE = [0, 1, 2, -1];               // the one-time pass; -1 is "all three on"

const byId = new Map(solutions.map((s) => [s.id, s]));
const sentence = (s) => { const t = s.title.join(' ').toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1).replace(/'/g, '’'); };
const link = (id, dim = false) => {
  const s = byId.get(id);
  return s ? `<a class="cx__link${dim ? ' is-dim' : ''}" href="#solution-${escapeHTML(s.id)}"><span class="cx__link-num">${escapeHTML(s.number)}</span><span class="cx__link-text">${escapeHTML(sentence(s))}</span><span aria-hidden="true">→</span></a>` : '';
};
const point = (deg) => {
  const a = (deg * Math.PI) / 180;
  return [CX + R * Math.cos(a), CY + R * Math.sin(a)];
};
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initConnectedDiagram() {
  const root = $('[data-cx]');
  if (!root) return;
  const nodes = $$('[data-cx-node]', root), spokes = $$('[data-cx-spoke]', root), glyphs = $$('[data-cx-glyph]', root);
  const strip = $$('[data-cx-service]');
  const progress = $('[data-cx-progress]', root), signal = $('[data-cx-signal]', root), trail = $('[data-cx-trail]', root);
  const info = $('.cx__info', root), num = $('[data-cx-num]', root), name = $('[data-cx-name]', root), desc = $('[data-cx-desc]', root), links = $('[data-cx-links]', root);
  const stage = $('.cx__stage', root);
  const defaults = { name: name.textContent, text: desc.textContent };
  const phone = window.matchMedia ? window.matchMedia('(max-width: 35em)') : { matches: false };

  let pinned = -1, preview = -1, auto = -1;     // what the visitor pinned, what they are pointing at, what the pass is showing
  let idle = !motion.reduced;                   // before the pass: ring empty, nothing on
  let touched = false, passing = false, armed = false, userDriven = false;
  let shown = -3, swapTimer = 0, passTimer = 0;

  /* ── The ring and the signal ── */
  let cur = 0, anim = 0;
  const setProgress = (p) => { progress.style.strokeDashoffset = String(100 - p * 100); };
  const place = (p, dir) => {
    const deg = START + SPAN * p, [x, y] = point(deg);
    signal.setAttribute('cx', x.toFixed(2)); signal.setAttribute('cy', y.toFixed(2));
    if (!dir) { trail.setAttribute('d', ''); return; }
    const tail = Math.min(Math.max(deg - dir * 24, START), START + SPAN), [x0, y0] = point(tail);
    trail.setAttribute('d', Math.abs(deg - tail) > 0.5 ? `M${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 0 ${dir > 0 ? 1 : 0} ${x.toFixed(2)} ${y.toFixed(2)}` : '');
  };
  const settle = (p, signalOn) => { cur = p; setProgress(p); place(p, 0); signal.style.opacity = signalOn ? '1' : '0'; };
  const travel = (target, signalOn) => {
    cancelAnimationFrame(anim);
    if (motion.reduced || Math.abs(target - cur) < 0.001) { settle(target, signalOn); return; }
    if (signalOn) signal.style.opacity = '1';
    const from = cur, dir = target > from ? 1 : -1, t0 = performance.now(), dur = 450 + 750 * Math.abs(target - from);
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), p = from + (target - from) * ease(k);
      cur = p; setProgress(p); place(p, k < 1 ? dir : 0);
      if (k < 1) anim = requestAnimationFrame(step); else settle(target, signalOn);
    };
    anim = requestAnimationFrame(step);
  };

  /* ── One state, written everywhere ── */
  const current = () => (preview >= 0 ? preview : pinned >= 0 ? pinned : auto);
  const fill = (i) => {
    num.textContent = i >= 0 ? `0${i + 1}` : '';
    name.textContent = i >= 0 ? STAGES[i].name : defaults.name;
    desc.textContent = i >= 0 ? STAGES[i].text : defaults.text;
    // A stage lists its own services. On a phone the panel always lists all four, in the same place (the strip under the
    // figure is not shown there): the services of the chosen stage are lit and the others rest, so nothing below moves.
    links.innerHTML = phone.matches
      ? solutions.map((s) => link(s.id, i >= 0 && !STAGES[i].services.includes(s.id))).join('')
      : i >= 0 ? STAGES[i].services.map((id) => link(id)).join('') : '';
  };
  const writeInfo = (i, instant) => {
    info.setAttribute('aria-live', userDriven ? 'polite' : 'off');   // the pass is not announced, the visitor's choices are
    const write = () => { fill(i); info.classList.remove('is-swapping'); };
    clearTimeout(swapTimer);
    if (motion.reduced || instant) { write(); return; }
    info.classList.add('is-swapping');
    swapTimer = setTimeout(write, 140);
  };
  const render = () => {
    const i = current(), key = i >= 0 ? i : idle ? 'idle' : 'all';
    nodes.forEach((n, k) => n.setAttribute('aria-pressed', String(k === pinned)));
    if (key === shown) return;
    const first = shown === -3;
    shown = key;
    root.dataset.state = String(key);
    root.classList.toggle('is-glyph', i >= 0);
    nodes.forEach((n, k) => { n.classList.toggle('is-active', k === i); n.classList.toggle('is-done', key === 'all' || (i >= 0 && k < i)); });
    spokes.forEach((s, k) => s.classList.toggle('is-active', k === i));
    glyphs.forEach((g, k) => g.classList.toggle('is-on', k === i));
    const lit = i >= 0 ? STAGES[i].services : [];
    strip.forEach((a) => a.classList.toggle('is-lit', lit.includes(a.dataset.cxService)));
    travel(key === 'idle' ? 0 : key === 'all' ? 1 : POS[i], key !== 'all');
    writeInfo(i, first);
  };

  /* ── The one-time pass ── */
  const stopPass = () => { passing = false; auto = -1; clearTimeout(passTimer); };
  const touch = () => { touched = true; idle = false; if (passing) stopPass(); };
  const startPass = () => {
    if (touched || passing || motion.reduced) return;
    passing = true; idle = false;
    let k = 0;
    const next = () => {
      if (!passing) return;
      auto = SEQUENCE[k]; userDriven = false; render();
      if (auto >= 0) audio.play('ping', { step: auto });
      k += 1;
      if (k < SEQUENCE.length) passTimer = setTimeout(next, k === SEQUENCE.length - 1 ? 1500 : 1300);
      else passing = false;
    };
    next();
  };
  // It starts once the intro has handed over and the figure is on screen, never before.
  let introDone = !document.documentElement.classList.contains('intro-active'), inView = false;
  const maybeStart = () => {
    if (armed || touched || motion.reduced || !introDone || !inView) return;
    armed = true;
    passTimer = setTimeout(startPass, 600);
  };
  if (!introDone) {
    window.addEventListener('intro:done', () => { introDone = true; maybeStart(); }, { once: true });
    setTimeout(() => { introDone = true; maybeStart(); }, 9000);   // in case the intro never reports back
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { inView = e.isIntersecting; maybeStart(); }, { threshold: 0.45 }).observe(root);
  else { inView = true; maybeStart(); }

  /* ── The visitor ── */
  const point_ = (i) => { touch(); preview = i; userDriven = true; render(); };
  const leave = () => { if (preview >= 0) { preview = -1; userDriven = true; render(); } };
  const pin = (i) => {
    touch(); preview = -1; userDriven = true;
    pinned = pinned === i ? -1 : i;
    render();
    audio.play(pinned === i ? 'select' : 'tick', { step: i, freq: 660 });
  };
  nodes.forEach((node, i) => {
    node.addEventListener('click', () => pin(i));
    node.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { point_(i); audio.play('note', { step: i + 2, soft: true }); } });
    node.addEventListener('focus', () => { if (node.matches(':focus-visible')) point_(i); });
    node.addEventListener('blur', () => { if (preview === i) leave(); });
    node.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (step) { e.preventDefault(); nodes[(i + step + nodes.length) % nodes.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); nodes[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); nodes[nodes.length - 1].focus(); }
      else if (e.key === 'Escape' && pinned >= 0) { pinned = -1; userDriven = true; render(); }
    });
  });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') leave(); });

  // The panel keeps the height of its tallest text, so choosing a stage never moves what is below it.
  const reserve = () => {
    const keep = [num.textContent, name.textContent, desc.textContent, links.innerHTML];
    info.style.minHeight = '';
    let tallest = 0;
    [-1, 0, 1, 2].forEach((i) => { fill(i); tallest = Math.max(tallest, info.getBoundingClientRect().height); });
    [num.textContent, name.textContent, desc.textContent, links.innerHTML] = keep;
    info.style.minHeight = `${Math.ceil(tallest)}px`;
  };
  let reservedFor = 0;
  const reserveOnWidth = () => { const w = Math.round(info.getBoundingClientRect().width); if (w && w !== reservedFor) { reservedFor = w; reserve(); } };
  if ('ResizeObserver' in window) new ResizeObserver(reserveOnWidth).observe(info); else reserveOnWidth();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { reservedFor = 0; reserveOnWidth(); });

  motion.onChange((reduced) => {
    if (!reduced) return;
    stopPass(); idle = false; shown = -3; render();   // finish at once, in the resting state
  });
  render();
}
